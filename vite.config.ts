import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function _resolve(dir: string) {
  return path.resolve(__dirname, dir)
}

// const BASE_URL = `http://${ip}/miniprogram`
// const VOICE_URL = `ws://${ip}/miniprogram`
// const IM_URL = `ws://${ip}/im/connection/websocket`
// const IM_URL2 = 'http://' + ip + '/im'
// const UPLOAD_URL = `http://${ip}/filesystem`
//
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ip = env.VITE_IP_VALUE
  return {
    plugins: [react()],
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
        // 接口地址代理
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
          target: ip, // 接口的域名
          changeOrigin: true,
          secure: false, // 如果是https接口，需要配置这个参数
        },
        '/filesystem': {
          target: ip,
          secure: false, // 如果是https接口，需要配置这个参数
          changeOrigin: true,
        },
      }
    },
  }
})
