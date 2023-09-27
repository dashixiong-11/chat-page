import { post } from '@/utils/server'
import { useEffect } from 'react'
import { useShowToast } from '@/hooks/useShowToast/useShowToast'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import './Home.scss'


function Home() {
  const miniProgram = wx.miniProgram

  const { show } = useAddChannel()
  const { showToast } = useShowToast()
  // const getChannel = async () => {
  //   const res = await post('/miniprogram/api/channels').catch(err => { })
  // }



  useEffect(() => {
    console.log('useEffect');
    //   getChannel()
    post('/miniprogram/api/jssdk', {
      url: location.href.split('#')[0]
    }).then((res: any) => {
      console.log(res);
      const { appId, timestamp, nonceStr, signature } = res.data
      console.log(appId, timestamp, nonceStr, signature);

      wx.config({
        debug: true,
        appId: appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: ['chooseImage', 'startRecord', 'stopRecord'] // 必填，需要使用的JS接口列表
      });
      wx.error(function (err: any) {
        console.log(err);
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      })
    }).catch(error => console.log(error));
  }, [])



  const onClick = () => {
    showToast({
      messages: 'message',
    })
  }
  const onAddChannel = () => {
    show()
  }

  const startRecording = () => {
    miniProgram.postMessage({ data: 'kaishi' })

  }
  const stopRecording = () => {
    miniProgram.postMessage({ data: 'jieshu' })
  }
  const chooseImg = () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res: any) {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        console.log(localIds);
      }
    })
  }

  return <div className="home">
    <button onClick={onClick}>连接ws</button>
    <button onClick={onAddChannel}> 添加 频道</button>
    <button onClick={startRecording}> 开始录音1 </button>
    <button onClick={stopRecording}> 结束录音 </button>
    <button onClick={chooseImg}> 上传图片 </button>
  </div>
}

export default Home