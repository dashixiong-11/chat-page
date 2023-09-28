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
    const { appId, timestamp, nonceStr, signature } = {
      appId: "wxec4f5418142ba0c2",
      timestamp: '1695861499',
      nonceStr: 'dashixiong',
      signature: '984678df891611982c4557881884800bf43eeeb0'
    }

    wx.config({
      debug: false,
      appId: appId,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature,
      jsApiList: ['chooseImage', 'startRecord', 'stopRecord', 'uploadImage', 'downloadImage']
    });
    wx.error(function (err: any) {
      console.log('error----', err);
    })
    //   getChannel()
    // post('/miniprogram/api/jssdk', {
    //   url: location.href.split('#')[0]
    // }).then((res: any) => {
    //   console.log(res);
    // }).catch(error => console.log(error));
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

  const uploadLocalImage = (localId: string | number) => {
    console.log('uploadLocalImage', localId);
    wx.uploadImage({
      localId,
      success: (res: any) => {
        console.log('res.serverId----', res.serverId);
        //       downloadLocalImage(res.serverId)
      }
    })
  }
  // const downloadLocalImage = (serverId: string | number) => {
  //   wx.downloadImage({
  //     serverId,
  //     success: (res: any) => {
  //       console.log(res);

  //     }
  //   })
  // }
  const chooseImg = () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res: any) {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        console.log('localIds---', localIds);
        uploadLocalImage(localIds[0])
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