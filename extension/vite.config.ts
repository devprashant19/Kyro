import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' with { type: 'json' }

// Workaround for crxjs bug where dev preamble is injected into production builds
const stripDevPreamble = () => {
  return {
    name: 'strip-dev-preamble',
    generateBundle(_options: any, bundle: any) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkObj = chunk as any;
        if (fileName.endsWith('-loader.js') && chunkObj.type === 'chunk') {
          chunkObj.code = chunkObj.code.replace(/if \("vendor\/crx-client-preamble\.js"\)[\s\S]*?chrome\.runtime\.getURL\("vendor\/crx-client-preamble\.js"\)\s*\);/, '');
          chunkObj.code = chunkObj.code.replace(/await import\([\s\S]*?chrome\.runtime\.getURL\("vendor\/vite-client\.js"\)\s*\);/, '');
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    stripDevPreamble()
  ],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174
    },
    watch: {
      usePolling: true
    }
  },
  envDir: '../'
})
