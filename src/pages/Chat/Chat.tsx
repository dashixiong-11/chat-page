import { post } from '@/utils/server'
import { Centrifuge } from 'centrifuge';
import { useEffect, useState, ChangeEvent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { get as getGlobalData } from "@/utils/globalData";
import { useMessagesData, NewMessageType } from '@/hooks/useMessagesData';
import { useSendMessage } from '@/hooks/useSendMessage/useSendMessage';
import history from '@/assets/icons/history.svg'
import ai_avatar from '@/assets/icons/ai_avatar.png'
import Markdown from 'react-markdown'
import { showToast } from '@/utils/loading';
import './Chat.scss'


function Chat() {
  const [aiStatus, setAiStatus] = useState<'waitting' | 'thinking'>('waitting')
  const { view, message, recordStatus } = useSendMessage({ aiStatus: aiStatus })
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [searchValue, setSearchValue] = useState('')
  const [centrifuge] = useState<Centrifuge | undefined>(() => {
    return getGlobalData('client')
  })
  const { newMessage } = useMessagesData({ channelName: params.get('channel_name') || '' })
  const [historyList, setHistoryList] = useState<NewMessageType[]>([])
  const [result, setResult] = useState<{ value: string, data_type: string }[]>([])

  useEffect(() => {
    if (!newMessage || !newMessage.m) return
    const copy = [...historyList]
    if (copy.some(item => item.u?.offset === newMessage.u?.offset)) {
      const c = copy.map(item => item.u?.offset === newMessage.u?.offset ? newMessage : item)
      setHistoryList([...c])
      setAiStatus('waitting')
    } else {
      setHistoryList([...copy, newMessage])
    }

    if (newMessage.u?.id === localStorage.getItem('id')) {
      setResult(newMessage.m)
    }
    console.log(newMessage, 'newMessage');
  }, [newMessage])


  const sendMessage = (message: string) => {
    const channelName = params.get('channel_name') || ''
    console.log('send message', channelName);
    centrifuge?.publish(channelName, [{
      data_type: 'text',
      value: message
    }]).then(function (res) {
      console.log('发送成功');
      setAiStatus('thinking')
    }, function (err) {
      setAiStatus('waitting')
      showToast({
        message: '发送失败',
        duration: 1500
      })
      console.log('发送失败', err);
    }).finally(() => {
      setSearchValue('')
    })
  }
  useEffect(() => {
    if (!message) return
    sendMessage(message)
  }, [message])




  const onInput = (e: ChangeEvent<HTMLInputElement>,) => {
    setSearchValue(e.target.value)
  }


  const to = (path: string) => {
    navigate(path)
  }


  const playVoice = (url: string | undefined) => {
    if (!url) return
    console.log(url);
  }

  const keyDownHandle: React.KeyboardEventHandler<HTMLFormElement> = e => {
    if (e.code === 'Enter') {
      sendMessage(searchValue)
    }
  }


  return <div className="chat"  >
    <div className="floating-ball" onClick={() => to('/history')}>
      <img src={history} alt="" />
    </div>
    <main style={{ height: '100vh' }} >
      <div className="main-header">
        <div className="search">
          <form action="." style={{ flex: 1 }} onKeyDown={keyDownHandle}>
            <input type="search" className="search-ipt" value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
            <input type="text" style={{ display: 'none' }} />
          </form>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }} onClick={() => sendMessage(searchValue)}>搜索</span>
        </div>
      </div>
      <div className="search-res">
        {result && result[0] && result[0].value &&
          <div className='res-block'>
            {
              result.find(rf => rf.data_type === 'voice') &&
              <div className='voice-btn' onClick={() => playVoice(result.find(rf => rf.data_type === 'voice')?.value)}>点击播放语音</div>
            }
            {
              result[1]?.value ?
                <Markdown>{result[1].value}</Markdown> :
                <span>思考中...</span>
            }
          </div>
        }

      </div>
      <div className={`message-action ${(recordStatus === 'recording' || recordStatus === 'pause') ? 'opa0' : ''}`} >
        <div className="messages" style={{ height: `${historyList.length > 0 ? '230px' : '0'}` }}>
          <ul>
            {historyList.map((item, index) =>
              <li className='active' key={index}>
                <div className="user-message">
                  <img src={item.u?.avatar} className='avatar' alt="" />
                  <span className='name'>{item.u?.name} </span>
                  <span className='message'>
                    {item['m'] && item['m'][0]?.value}
                  </span>
                </div>
                {
                  item['m'] && item['m'][1] &&
                  <div className="ai-message">
                    <img src={ai_avatar} className='avatar' alt="" />
                    <span className='name'>ai</span>
                    {item.m && item.m.filter((f, index2) => index2 !== 0 && f.data_type === 'text').map((msg, index3) => <>
                      <span className='message' key={index3 + '-msg'}>{msg.value}</span>
                    </>)}
                  </div>
                }
              </li>
            )}
          </ul>
        </div>
        {view}
      </div>

    </main>
  </div>
}

export default Chat