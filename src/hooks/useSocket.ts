import { Centrifuge } from 'centrifuge';
import { path } from "@/config/urlConfig"
import { set } from '@/utils/globalData';
import { useThrottle } from './useThrottle';
import { useEffect, useState, useRef } from 'react';

export const useSocket = () => {
  const maxReconnectAttempts = 3; // 最大重连尝试次数
  const reconnectInterval = 3000; // 重连间隔（毫秒）
  const reconnectAttempts = useRef(0);
  const [client, setClient] = useState<Centrifuge | null>(null)

  // async function getToken() {
  //   const res = await fetch('/centrifuge/connection_token');
  //   if (!res.ok) {
  //     if (res.status === 403) {
  //       // Return special error to not proceed with token refreshes, client will be disconnected.
  //       throw new UnauthorizedError('登录失败');
  //     }
  //     // Any other error thrown will result into token refresh re-attempts.
  //     throw new Error(`Unexpected status code ${res.status}`);
  //   }
  //   const data = await res.json();
  //   return data.token;
  // }
  useEffect(() => {
    const _client = new Centrifuge(
      path,
      {
        token: '',
      }
    );
    _client.on('connecting', function (ctx) {
      console.log('连接中', ctx);
    }).on('connected', function (ctx) {
      console.log('连接成功', ctx);
      reconnectAttempts.current = 0
    }).on('error', function (ctx) {
      console.log('连接失败', ctx);
      const { error } = ctx

      if (error.code === 109 || error.code === 12) {
        // Taro.setStorageSync('token', '')
        disconnectWS()
      } else {
        tReconnect()
      }
    }).on('disconnected', function (ctx) {

    })

    setClient(_client)
    set('client', _client)
  }, [])

  const tReconnect = useThrottle(() => {
    console.log('Reconnect');
    if (reconnectAttempts.current < maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`尝试重新连接 (尝试次数: ${reconnectAttempts.current + 1})`);
        client && client.connect()
        reconnectAttempts.current++;
      }, reconnectInterval);
    } else {
      // Taro.showToast({
      //   title: '达到最大重连尝试次数，无法重连',
      //   icon: 'none',
      //   success: () => {
      //     disconnectWS()
      //   }
      // })
      console.error('达到最大重连尝试次数，无法重连');
    }
  }, 5000)

  const disconnectWS = () => {
    if (client) {
      client.disconnect()
      client.removeAllListeners()
    }
    setClient(null)
    set('client', null)


    return {
      client
    }

  }
}