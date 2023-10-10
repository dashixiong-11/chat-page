import { post } from '@/utils/server'
import { Centrifuge } from 'centrifuge';
import { useEffect, TouchEventHandler, useState, ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { get as getGlobalData, set as setGlobalData } from "@/utils/globalData";
import { useMessagesData } from '@/hooks/useMessagesData';
import './Chat.scss'


type RecordTypeType = 'nomal' | 'recoeding' | 'thinking'
function Chat() {
  const [params] = useSearchParams()
  const [recordType, setRecordType] = useState<RecordTypeType>('nomal')
  const [searchValue, setSearchValue] = useState('')
  const [centrifuge] = useState<Centrifuge | undefined>(() => {
    return getGlobalData('client')
  })
  const { newMessage } = useMessagesData({ channelName: params.get('channel_name') || '' })

  useEffect(() => {
    console.log(newMessage);
  }, [newMessage])


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
    // post('/miniprogram/api/jssdk', {
    //   url: location.href.split('#')[0]
    // }).then((res: any) => {
    //   console.log(res);
    // }).catch(error => console.log(error));
  }, [])


  const sendMessage = () => {
    
    const channelName = params.get('channel_name') || ''
    console.log('send message',channelName);
    centrifuge?.publish(channelName, [{
      data_type: 'text',
      value: '写一首古诗'
    }]).then(function (res) {
      console.log('发送成功');
    }, function (err) {
      console.log('发送失败', err);
    })

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
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    if (touchEndPosition.y - touchStartPosition.y >= 50) {
      setHeaderHeight(60)
    }
    if (touchStartPosition.y - touchEndPosition.y > 50) {
      setHeaderHeight(0)
    }
  }

  const sendV = () => { }


  const onInput = (e: ChangeEvent<HTMLInputElement>,) => {
    setSearchValue(e.target.value)
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
          <input type="text" className="search-ipt" value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
          <span onClick={sendMessage}>搜索</span>
        </div>
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
          <div className="send-voice" onClick={sendV} id="demoCanvas">发送语音</div>
          <div className="upload-img">
            图片
          </div>
        </div>
      </div>

    </main>
  </div>
}

export default Chat