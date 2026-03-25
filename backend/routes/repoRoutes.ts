/**
 * routes/repoRoutes.ts
 * Repository API endpoints for file operations.
 */

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';

const router = Router();

const IGNORE_PATTERNS = [
    'node_modules', '.git', '.next', 'dist', 'build', '.DS_Store',
    'Thumbs.db', '__pycache__', '*.pyc', '.venv', 'venv', '.env',
    '.idea', '.vscode', 'coverage', '.cache'
];

const shouldIgnore = (name: string): boolean => {
    return IGNORE_PATTERNS.some(pattern => {
        if (pattern.startsWith('*')) return name.endsWith(pattern.substring(1));
        return name === pattern || name.startsWith(pattern);
    });
};

const validatePath = (requestedPath: string): string => {
    const normalized = path.normalize(requestedPath);
    if (normalized.includes('..')) {
        throw new Error('Invalid path: directory traversal not allowed');
    }
    return normalized;
};

const checkPathAccess = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath, fsConstants.R_OK);
        return true;
    } catch {
        return false;
    }
};

router.post('/read-directory', async (req: Request, res: Response) => {
    try {
        const { path: dirPath } = req.body;
        if (!dirPath) {
            return res.status(400).json({ error: 'Path is required' });
        }

        const validatedPath = validatePath(dirPath);
        const exists = await checkPathAccess(validatedPath);
        if (!exists) {
            return res.status(404).json({ error: 'Path not found' });
        }

        const stats = await fs.stat(validatedPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({ error: 'Not a directory' });
        }

        res.json({ data: [], count: 0, path: validatedPath });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/read-file', async (req: Request, res: Response) => {
    try {
        const { path: filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ error: 'Path is required' });
        }

        const validatedPath = validatePath(filePath);
        const exists = await checkPathAccess(validatedPath);
        if (!exists) {
            return res.status(404).json({ error: 'File not found' });
        }

        const stats = await fs.stat(validatedPath);
        const content = await fs.readFile(validatedPath, 'utf-8');
        res.json({ data: { content, size: stats.size, path: validatedPath } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
