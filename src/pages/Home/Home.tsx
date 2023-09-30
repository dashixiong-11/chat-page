import { post } from '@/utils/server'
import { useSocket } from '@/hooks/useSocket'
import { useEffect, TouchEventHandler, useState } from 'react'
import { useShowToast } from '@/hooks/useShowToast/useShowToast'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import './Home.scss'


type RecordTypeType = 'nomal' | 'recoeding' | 'thinking'
function Home() {
  const { show } = useAddChannel()
  const [recordType, setRecordType] = useState<RecordTypeType>('nomal')
  const { showToast } = useShowToast()
  //const { client } = useSocket()
  // const getChannel = async () => {
  //   const res = await post('/miniprogram/api/channels').catch(err => { })
  // }



  useEffect(() => {
    const { appId, timestamp, nonceStr, signature } = {
      appId: "wxf1193f6efa3350b1",
      timestamp: '3213213213',
      nonceStr: 'ddssxx',
      signature: '579b1a7a460f63964f65ef6673e8b7ea15b63058'
    }

    wx.config({
      debug: false,
      appId: appId,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature,
      jsApiList: ['chooseImage', 'startRecord', 'stopRecord', 'uploadImage', 'downloadImage', 'uploadVoice', 'translateVoice']
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
    // client?.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjMsIkF1dGhvcml0eUlkIjoiMyIsIkRvbWFpbiI6IiIsInN1YiI6IjMiLCJleHAiOjE2OTYxNTAwNTMsImlhdCI6MTY5NTg5MDg1M30.N-gEguHqytR0oLGwVPDMjCd2Fj-8GJtT-IdXcMNDosY')
    // client?.connect()
    // showToast({
    //   messages: 'message',
    // })
  }
  const onAddChannel = () => {
    show()
  }

  const startRecording = () => {
    wx.startRecord({
      success: () => {
        console.log('开始录音');
      },
      cancel: () => {
        console.log('拒绝授权');
      }
    })

  }
  const stopRecording = () => {
    wx.stopRecord({
      success: (res) => {
        console.log(res.localId);
        //uploadLocalVoice(res.localId)
        wx.translateVoice({
          localId: res.localId,
          isShowProgressTips: 1,
          success: function (res: any) {
            alert(res.translateResult);
          }
        })
      }
    })
  }

  const uploadLocalImage = (localId: string | number) => {
    console.log('uploadLocalImage', localId);
    wx.uploadImage({
      localId,
      success: (res: any) => {
        console.log('res.serverId----', res.serverId);
      }
    })
  }
  const chooseImg = () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res: any) {
        var localIds = res.localIds;
        console.log('localIds---', localIds);
        uploadLocalImage(localIds[0])
      }
    })
  }

  const [headerHeight, setHeaderHeight] = useState(0)
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 })
  const [touchEndPosition, setTouchEndPosition] = useState({ x: 0, y: 0 })
  const onTouchStart: TouchEventHandler<HTMLDivElement> = event => {
    setTouchEndPosition({ x: 0, y: 0 })
    const touch = event.touches[0];
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
  }
  const onTouchMove: TouchEventHandler<HTMLDivElement> = event => {
    const touch = event.touches[0];
    setTouchEndPosition({ x: touch.clientX, y: touch.clientY });
  }
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = event => {
    if (touchEndPosition.y - touchStartPosition.y >= 50) {
      setHeaderHeight(60)
    }
    if (touchStartPosition.y - touchEndPosition.y > 50) {
      setHeaderHeight(0)
    }
  }
  

  return <div className="home"  >
    <header style={{ height: headerHeight + 'px' }}>
      <ul className="channel-list">
        <li> 频道1</li>
        <li> 频道2</li>
        <li> 频道3</li>
        <li> 频道3</li>
        <li> 频道3</li>
        <li> 频道3</li>
      </ul>
    </header>
    <main style={{ height: `calc(100vh - ${headerHeight}px)` }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="main-header">
        <div className="search">
          <input type="text" className="search-ipt" placeholder='请输入想要搜索的问题' />
          搜索
        </div>
        {/* <ul className="tips">
        <li>提示1</li>
        <li>提示2</li>
      </ul> */}
      </div>
      <div className="search-res">
        <div className='res-block' style={{ height: '200px' }}> message 1</div>
        <div className='res-block' style={{ height: '200px' }}> message 2</div>
        <div className='res-block' style={{ height: '200px' }}> message 3</div>
        <div className='res-block' style={{ height: '200px' }}> message 4</div>

      </div>
      <div className="message-action">
        <ul className="messages">
          <li>
            <div className="user-message">
              <img src="" className='avatar' alt="" />
              <span className='name'>张三 </span>
              <span className='message'>这是一条消息
                很长很长很长很长
                很长很长很长很长
                很长很长很长很长
                很长很长很长很长
              </span>
            </div>
          </li>
          <li className='active'>
            <div className="user-message">
              <img src="" className='avatar' alt="" />
              <span className='name'>张三 </span>
              <span className='message'>这是一条消息
                很长很长很长很长
                很长很长很长很长
                很长很长很长很长
                很长很长很长很长
              </span>
            </div>
            <div className="ai-message">
              <img src="" className='avatar' alt="" />
              <span className='name'>ai </span>
              <span className='message'>这是一条消息</span>
            </div>
          </li>
        </ul>
        <div className='record-button-wrapper'>
          <div className="upload-file">
            文件
          </div>
          <div className="send-voice" onClick={sendV}>发送语音</div>
          {/* <div className="container">
            <div className="circle">
              <div className="c c1"></div>
            </div>
            <div className="circle">
              <div className="c c2"></div>
            </div>
            <div className="circle ">
              <div className="c c3"></div>
            </div>
            <div className="circle">
              <div className="c c4"></div>
            </div>
            <div className="circle">
              <div className="c c5"></div>
            </div>
          </div> */}
          <div className="upload-img">
            图片
          </div>
        </div>
      </div>

      {/* <button onClick={onClick}>连接ws</button>
      <button onClick={onAddChannel}> 添加 频道</button>
      <button onClick={startRecording}> 开始录音 </button>
      <button onClick={stopRecording}> 结束录音 </button>
      <button onClick={chooseImg}> 上传图片 </button> */}
    </main>
  </div>
}

export default Home