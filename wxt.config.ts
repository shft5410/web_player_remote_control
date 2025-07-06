import { defineConfig } from 'wxt'
import svgr from 'vite-plugin-svgr'

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    srcDir: 'src',
    imports: false,
    manifestVersion: 3,
    manifest: {
        name: 'Web Player Remote Control',
        description: 'Control web players remotely via a WebSocket connection',
        permissions: ['storage', 'activeTab'],
        browser_specific_settings: {
            gecko: {
                id: 'web-player-remote-control@shft-dev.top',
            },
        },
    },
    vite: () => ({
        plugins: [svgr()],
    }),
})
