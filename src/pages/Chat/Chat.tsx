import { post } from '@/utils/server'
import { Centrifuge } from 'centrifuge';
import { useEffect, TouchEventHandler, useState, ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { get as getGlobalData } from "@/utils/globalData";
import { useMessagesData } from '@/hooks/useMessagesData';
import { useNavigate } from 'react-router-dom';
import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import pause from '@/assets/icons/pause.svg'
import play from '@/assets/icons/play.svg'
import history from '@/assets/icons/history.svg'

import Markdown from 'react-markdown'
import './Chat.scss'
import { useSendMessage } from '@/hooks/useSendMessage/useSendMessage';


type RecordTypeType = 'nomal' | 'recoeding' | 'thinking'
function Chat() {
  const {view} = useSendMessage()
  const navigate = useNavigate()
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




  const sendMessage = () => {
    const channelName = params.get('channel_name') || ''
    console.log('send message', channelName);
    centrifuge?.publish(channelName, [{
      data_type: 'text',
      value: '写一首古诗'
    }]).then(function (res) {
      console.log('发送成功');
    }, function (err) {
      console.log('发送失败', err);
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

  const sendV = () => { }


  const onInput = (e: ChangeEvent<HTMLInputElement>,) => {
    setSearchValue(e.target.value)
  }

  const markdown = '# Hi, *Pluto*!'

  const to = (path: string) => {
    navigate(path)
  }


  return <div className="chat"  >
    <div className="floating-ball" onClick={() => to('/history')}>
      <img src={history} alt="" />
    </div>
    <main style={{ height: '100vh' }} >
      <div className="main-header">
        <div className="search">
          <input type="text" className="search-ipt" value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
          <span onClick={sendMessage}>搜索</span>
        </div>
      </div>
      <div className="search-res">
        <div className='res-block' style={{ height: '200px' }}>
          <Markdown>{markdown}</Markdown>
        </div>
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
        {view}
      </div>

    </main>
  </div>
}

export default Chat