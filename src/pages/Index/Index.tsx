import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from 'react-router-dom';
import './Index.scss'


function Index() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || localStorage.getItem('token') || ''
  const id = params.get('id') || localStorage.getItem('id') || ''
  localStorage.setItem('token', token)
  localStorage.setItem('id', id)
  const { client } = useSocket()
  useEffect(() => {
    console.log(1111);


    // const { appId, timestamp, nonceStr, signature } = {
    //   appId: "wxf1193f6efa3350b1",
    //   timestamp: '3213213213',
    //   nonceStr: 'ddssxx',
    //   signature: '51fa1e2e6b12d303cf94f91f607407251a4dcbc1'
    // }

    // // const { appId = '', timestamp = '', nonceStr = '', signature = '' } = res.data
    // wx.config({
    //   debug: true,
    //   appId: appId,
    //   timestamp: timestamp,
    //   nonceStr: nonceStr,
    //   signature: signature,
    //   jsApiList: ['chooseImage', 'startRecord', 'stopRecord', 'uploadImage', 'downloadImage', 'uploadVoice', 'translateVoice']
    // });
    // wx.error(function (err: any) {
    //   console.log(err, '--------');

    // })

    // return

    if (token && client) {
      client.setToken(token)
      client.connect()
      navigate('/channels')
    }
  }, [client])


  return <div className="home">
  </div>
}

export default Index