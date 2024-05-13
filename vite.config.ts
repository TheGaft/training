import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react(), optimizeLodashImports()],
        server: {
            host: '0.0.0.0',
            port: parseInt(env.FRONT_PORT || '3000', 10),
            hmr: {
                host: '0.0.0.0',
                port: parseInt(env.FRONT_PORT_HMR || '3010', 10),
            },
        },
        preview: {
            host: '0.0.0.0',
            port: parseInt(env.FRONT_PORT || '3000', 10),
        },
        base: env.STATIC_URL || '/training',
    };
});
