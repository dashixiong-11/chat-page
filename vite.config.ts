import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function _resolve(dir: string) {
  return path.resolve(__dirname, dir)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ip = env.VITE_IP_VALUE
  return {
    plugins: [react()],
    assetsInclude: ['**/*.svga'],

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "src/assets/styles/var.scss";'
        }
      }
    },
    resolve: {
      alias: {
        '@': _resolve('src'),
      },
    },
    server: {
      proxy: {
        '/miniprogram': {
          target: ip,
          secure: false, // 如果是https接口，需要配置这个参数
          changeOrigin: true,
          bypass: (req, res, options) => {
            const proxyUrl = new URL(options.rewrite(req.url) || '', (options.target) as string)?.href || ''
            req.headers['x-req-proxyUrl'] = proxyUrl
            res.setHeader('x-req-proxyUrl', proxyUrl)
          },
          rewrite: path => path.replace(/^\/miniprogram/, '/miniprogram')
        },
        '/im': {
          target: ip,
          changeOrigin: true,
          secure: false,
          bypass: (req, res, options) => {
            const proxyUrl = new URL(options.rewrite(req.url) || '', (options.target) as string)?.href || ''
            req.headers['x-req-proxyUrl'] = proxyUrl
            res.setHeader('x-req-proxyUrl', proxyUrl)
          },
          rewrite: path => path.replace(/^\/im/, '/im')
        },
        '/filesystem': {
          target: ip,
          secure: false,
          changeOrigin: true,
        },
      }
    },
  }
})
