import { Centrifuge } from 'centrifuge';
import { set } from '@/utils/globalData';
import { useThrottle } from './useThrottle';
import { useEffect, useState, useRef } from 'react';
import { useShowToast } from './useShowToast/useShowToast';
import { showNotification, hideNotification } from '@/utils/loading';


export const useSocket = () => {
  const { showToast } = useShowToast()
  const maxReconnectAttempts = 3; // 最大重连尝试次数
  const reconnectInterval = 3000; // 重连间隔（毫秒）
  const reconnectAttempts = useRef(0);
  const [client, setClient] = useState<Centrifuge | null>(null)

  useEffect(() => {
    const connection_status = localStorage.getItem('connection_status') || 'file'
    console.log(connection_status);
    if (connection_status && connection_status !== 'file') { return }
    const _client = new Centrifuge('ws://192.168.1.3/im/connection/websocket');
    _client.on('connecting', function (ctx) {
      console.log('连接中', ctx);
      showNotification({
        message: '连接中...'
      })
      localStorage.setItem('connection_status', 'padding')
    }).on('connected', function (ctx) {
      console.log('连接成功', ctx);
      showNotification({
        message: '连接成功',
        type: 'success',
        duration: 1500
      })
      localStorage.setItem('connection_status', 'success')
      reconnectAttempts.current = 0
    }).on('error', function (ctx) {
      console.log('连接失败', ctx);
      showNotification({
        message: '连接失败',
        type: 'error',
        duration: 1500,
        success: () => {
          const { error } = ctx
          if (error.code === 109 || error.code === 12) {
            disconnectWS()
          } else {
            tReconnect()
          }
        }
      })
      localStorage.setItem('connection_status', 'file')
    }).on('disconnected', function (ctx) {
      console.log('关闭连接', ctx);
      // showNotification({
      //   message: '连接失败',
      //   type: 'error',
      // })
    })

    setClient(_client)
    set('client', _client)
  }, [])

  const tReconnect = useThrottle(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      console.log('Reconnect');
      setTimeout(() => {
        showNotification({
          message: `重连中(${reconnectAttempts.current + 1}次)`,
          type: 'warning',
        })
        console.log(`尝试重新连接 (尝试次数: ${reconnectAttempts.current + 1})`);
        client && client.connect()
        reconnectAttempts.current++;
      }, reconnectInterval);
    } else {
      showNotification({
        message: `达到最大重连尝试次数，无法重连`,
        type: 'error',
        duration: 1500,
        success: () => {
          disconnectWS()
        }
      })
    }
  }, 3000)

  const disconnectWS = () => {
    if (client) {
      client.disconnect()
      client.removeAllListeners()
    }
    setClient(null)
    set('client', null)
  }

  return {
    client
  }
}