import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@fathom/types': path.resolve(__dirname, '../shared/types/index.ts'),
            '@fathom/validators': path.resolve(__dirname, '../shared/validators/index.ts'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: 'ws://localhost:5000',
                ws: true,
            },
        },
    },
    build: {
        target: 'es2022',
        cssCodeSplit: true,
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-router': ['react-router-dom'],
                    'vendor-charts': ['recharts'],
                    'vendor-ui': ['lucide-react'],
                    'vendor-editor': ['@uiw/react-codemirror', '@codemirror/lang-sql'],
                    'vendor-date': ['date-fns'],
                },
            },
        },
        chunkSizeWarningLimit: 600,
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'recharts',
            'lucide-react',
            '@uiw/react-codemirror',
            '@codemirror/lang-sql',
            'date-fns',
        ],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.{js,ts,tsx}', 'src/**/*.spec.{js,ts,tsx}'],
        setupFiles: ['./src/test/setup.ts'],
    },
});
