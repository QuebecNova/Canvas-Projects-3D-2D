// vite.config.ts
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        minify: 'esbuild',
        assetsDir: 'assets',
        rollupOptions: {
            input: path.resolve(__dirname, 'src/index.html'),
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.ts', '.js'],
    },
    esbuild: {
        loader: 'ts',
        include: /\.ts$/,
    },
})
