import { defineConfig } from 'wxt'
import svgr from 'vite-plugin-svgr'

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    srcDir: 'src',
    imports: false,
    manifest: {
        permissions: ['storage', 'activeTab'],
    },
    vite: () => ({
        plugins: [svgr()],
    }),
})
