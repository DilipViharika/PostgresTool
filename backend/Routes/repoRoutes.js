// ==========================================================================
//  VIGIL — Repository API Endpoints
// ==========================================================================
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

// Ignore common directories and files
const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.DS_Store',
    'Thumbs.db',
    '__pycache__',
    '*.pyc',
    '.venv',
    'venv',
    '.env',
    '.idea',
    '.vscode',
    'coverage',
    '.cache'
];

const shouldIgnore = (name) => {
    return IGNORE_PATTERNS.some(pattern => {
        if (pattern.startsWith('*')) {
            return name.endsWith(pattern.substring(1));
        }
        return name === pattern || name.startsWith(pattern);
    });
};

// Recursively read directory structure
const readDirectoryRecursive = async (dirPath, basePath = dirPath, depth = 0, maxDepth = 5) => {
    if (depth > maxDepth) return [];

    const files = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            // Skip ignored files/directories
            if (shouldIgnore(entry.name)) continue;

            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(basePath, fullPath);

            if (entry.isDirectory()) {
                // Add directory
                files.push({
                    path: relativePath,
                    name: entry.name,
                    type: 'dir'
                });

                // Recursively read subdirectory
                const subFiles = await readDirectoryRecursive(fullPath, basePath, depth + 1, maxDepth);
                files.push(...subFiles);
            } else if (entry.isFile()) {
                // Add file
                const stats = await fs.stat(fullPath);
                files.push({
                    path: relativePath,
                    name: entry.name,
                    type: 'file',
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
    }

    return files;
};

// Validate path to prevent directory traversal attacks
const validatePath = (requestedPath) => {
    const normalized = path.normalize(requestedPath);

    // Don't allow paths that go outside the base directory
    if (normalized.includes('..')) {
        throw new Error('Invalid path: directory traversal not allowed');
    }

    return normalized;
};

// Check if path exists and is accessible
const checkPathAccess = async (filePath) => {
    try {
        await fs.access(filePath, fs.constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   API ENDPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * POST /api/repo/read-directory
 * Read directory structure
 *
 * Body: { path: string }
 * Returns: { data: Array<{ path, name, type, size?, modified? }> }
 */
router.post('/read-directory', async (req, res) => {
    try {
        const { path: dirPath } = req.body;

        if (!dirPath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a directory path'
            });
        }

        // Validate path
        const validatedPath = validatePath(dirPath);

        // Check if path exists and is accessible
        const exists = await checkPathAccess(validatedPath);
        if (!exists) {
            return res.status(404).json({
                error: 'Path not found',
                message: `Directory "${dirPath}" does not exist or is not accessible`
            });
        }

        // Check if it's a directory
        const stats = await fs.stat(validatedPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({
                error: 'Not a directory',
                message: `Path "${dirPath}" is not a directory`
            });
        }

        // Read directory structure
        const files = await readDirectoryRecursive(validatedPath);

        res.json({
            data: files,
            count: files.length,
            path: validatedPath
        });

    } catch (error) {
        console.error('Error reading directory:', error);
        res.status(500).json({
            error: 'Failed to read directory',
            message: error.message
        });
    }
});

/**
 * POST /api/repo/read-file
 * Read file content
 *
 * Body: { path: string }
 * Returns: { data: { content: string, size: number, modified: Date } }
 */
router.post('/read-file', async (req, res) => {
    try {
        const { path: filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a file path'
            });
        }

        // Validate path
        const validatedPath = validatePath(filePath);

        // Check if path exists and is accessible
        const exists = await checkPathAccess(validatedPath);
        if (!exists) {
            return res.status(404).json({
                error: 'File not found',
                message: `File "${filePath}" does not exist or is not accessible`
            });
        }

        // Check if it's a file
        const stats = await fs.stat(validatedPath);
        if (!stats.isFile()) {
            return res.status(400).json({
                error: 'Not a file',
                message: `Path "${filePath}" is not a file`
            });
        }

        // Check file size (limit to 10MB for safety)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (stats.size > maxSize) {
            return res.status(413).json({
                error: 'File too large',
                message: `File size (${stats.size} bytes) exceeds maximum allowed size (${maxSize} bytes)`
            });
        }

        // Read file content
        const content = await fs.readFile(validatedPath, 'utf-8');

        res.json({
            data: {
                content,
                size: stats.size,
                modified: stats.mtime,
                path: validatedPath
            }
        });

    } catch (error) {
        console.error('Error reading file:', error);

        // Handle specific encoding errors
        if (error.code === 'ERR_INVALID_ARG_VALUE') {
            return res.status(415).json({
                error: 'File encoding not supported',
                message: 'This file appears to be binary or uses an unsupported encoding'
            });
        }

        res.status(500).json({
            error: 'Failed to read file',
            message: error.message
        });
    }
});

/**
 * POST /api/repo/write-file
 * Write file content
 *
 * Body: { path: string, content: string }
 * Returns: { data: { success: boolean, path: string, size: number } }
 */
router.post('/write-file', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a file path'
            });
        }

        if (content === undefined || content === null) {
            return res.status(400).json({
                error: 'Content is required',
                message: 'Please provide file content'
            });
        }

        // Validate path
        const validatedPath = validatePath(filePath);

        // Ensure directory exists
        const dir = path.dirname(validatedPath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(validatedPath, content, 'utf-8');

        // Get file stats
        const stats = await fs.stat(validatedPath);

        res.json({
            data: {
                success: true,
                path: validatedPath,
                size: stats.size,
                modified: stats.mtime
            },
            message: 'File saved successfully'
        });

    } catch (error) {
        console.error('Error writing file:', error);
        res.status(500).json({
            error: 'Failed to write file',
            message: error.message
        });
    }
});

/**
 * POST /api/repo/delete-file
 * Delete a file
 *
 * Body: { path: string }
 * Returns: { data: { success: boolean, path: string } }
 */
router.post('/delete-file', async (req, res) => {
    try {
        const { path: filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a file path'
            });
        }

        // Validate path
        const validatedPath = validatePath(filePath);

        // Check if file exists
        const exists = await checkPathAccess(validatedPath);
        if (!exists) {
            return res.status(404).json({
                error: 'File not found',
                message: `File "${filePath}" does not exist`
            });
        }

        // Delete file
        await fs.unlink(validatedPath);

        res.json({
            data: {
                success: true,
                path: validatedPath
            },
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            error: 'Failed to delete file',
            message: error.message
        });
    }
});

/**
 * POST /api/repo/create-file
 * Create a new file
 *
 * Body: { path: string, content?: string }
 * Returns: { data: { success: boolean, path: string } }
 */
router.post('/create-file', async (req, res) => {
    try {
        const { path: filePath, content = '' } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a file path'
            });
        }

        // Validate path
        const validatedPath = validatePath(filePath);

        // Check if file already exists
        const exists = await checkPathAccess(validatedPath);
        if (exists) {
            return res.status(409).json({
                error: 'File already exists',
                message: `File "${filePath}" already exists`
            });
        }

        // Ensure directory exists
        const dir = path.dirname(validatedPath);
        await fs.mkdir(dir, { recursive: true });

        // Create file
        await fs.writeFile(validatedPath, content, 'utf-8');

        res.json({
            data: {
                success: true,
                path: validatedPath
            },
            message: 'File created successfully'
        });

    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({
            error: 'Failed to create file',
            message: error.message
        });
    }
});

/**
 * POST /api/repo/git-status
 * Get git status for a repository (if git is available)
 *
 * Body: { path: string }
 * Returns: { data: { branch: string, status: string, modified: number, ... } }
 */
router.post('/git-status', async (req, res) => {
    try {
        const { path: repoPath } = req.body;

        if (!repoPath) {
            return res.status(400).json({
                error: 'Path is required',
                message: 'Please provide a repository path'
            });
        }

        // Validate path
        const validatedPath = validatePath(repoPath);

        // Check if .git directory exists
        const gitPath = path.join(validatedPath, '.git');
        const isGitRepo = await checkPathAccess(gitPath);

        if (!isGitRepo) {
            return res.json({
                data: {
                    isGitRepo: false,
                    message: 'Not a git repository'
                }
            });
        }

        // For a full implementation, you would use a library like 'simple-git'
        // or execute git commands. This is a placeholder.
        res.json({
            data: {
                isGitRepo: true,
                branch: 'main',
                status: 'clean',
                message: 'Git status check requires git integration'
            }
        });

    } catch (error) {
        console.error('Error checking git status:', error);
        res.status(500).json({
            error: 'Failed to check git status',
            message: error.message
        });
    }
});

module.exports = router;
