import { Centrifuge } from 'centrifuge';
import { useEffect, useState, ChangeEvent, useCallback, useRef } from 'react'
import { post } from '@/utils/server';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { get as getGlobalData } from "@/utils/globalData";
import { useMessagesData } from '@/hooks/useMessagesData';
import { useSendMessage } from '@/hooks/useSendMessage/useSendMessage';
import history from '@/assets/icons/history.svg'
import ai_avatar from '@/assets/icons/ai_avatar.png'
import close from '@/assets/icons/close_w.svg'
import Markdown from 'react-markdown'
import { showToast } from '@/utils/loading';
import { dataURLtoBlob } from '@/utils/dataURLtoBlob';
import './Chat.scss'


function Chat() {
  const [params] = useSearchParams()
  const workDir = params.get('workDir')
  const navigate = useNavigate()
  const [aiStatus, setAiStatus] = useState<'waitting' | 'thinking'>('waitting')
  const { view, message, recordStatus, base64DataArray, removeBase64Data, clearBase64DataArray } = useSendMessage({ aiStatus: aiStatus })
  const [searchValue, setSearchValue] = useState('')
  const [centrifuge] = useState<Centrifuge | undefined>(() => {
    return getGlobalData('client')
  })
  const { newMessage } = useMessagesData({ channelName: params.get('channel_name') || '' })
  const [historyList, setHistoryList] = useState<NewMessageType[]>([])
  const [result, setResult] = useState<MessageListType[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

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


  const attachImageToMessage = async (ids: number[]) => {
    const res = await post<any>('/filesystem/api/attach', {
      file_info_ids: ids
    }).catch(err => { throw new Error(err) })
    if (res.code === 0 && res.data && res.data.urls && Object.prototype.toString.call(res.data.urls) === '[object Array]') {
      return res.data.urls
    } else {
      return []
    }
  }
  const uploadFile = useCallback(async () => {
    if (!base64DataArray.length) { return [] }
    const formData = new FormData
    base64DataArray.forEach(b => {
      const blob = dataURLtoBlob(b.base)
      if (blob) {
        formData.append('files', blob)
      }
    })
    const res = await post<any>('/filesystem/api/upload-form' + (workDir ? `/${workDir}` : ''), formData).catch(err => {
      throw new Error(err)
    })
    if (res.code === 0) {
      const urls = await attachImageToMessage(res.data)
      return urls
    } else {
      return []
    }
  }, [base64DataArray])




  const sendMessage = useCallback(async (message: string) => {
    const urls = await uploadFile()
    if (!message.trim() && urls.length === 0) return
    let messageList: MessageListType = {
      data_type: 'image',
      value: urls[0]
    }
    if (urls.length >= 1 && message) {
      const valueArray: { data_type: 'text' | 'image', value: string }[] = [{ data_type: 'text', value: message }]
      urls.forEach((url: string) => {
        valueArray.push({ data_type: 'image', value: url })
      })
      messageList = {
        data_type: 'multimodal_text',
        value: valueArray
      }
    } else if (urls.length === 0 && message) {
      messageList = { data_type: 'text', value: message }
    }


    const channelName = params.get('channel_name') || ''
    console.log('send message', messageList);
    centrifuge?.publish(channelName, [messageList]).then(function (res) {
      console.log('发送成功');
      clearBase64DataArray()
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
      console.log(searchInputRef.current, 'searchInputRef.current');
      searchInputRef.current?.blur()
    })
  }, [base64DataArray])



  useEffect(() => {
    sendMessage(message)
  }, [message])



  const onInput = (e: ChangeEvent<HTMLInputElement>,) => {
    setSearchValue(e.target.value)
  }


  const to = (path: string) => {
    navigate(path)
  }


  const playVoice = (msg: MessageListType | undefined) => {
    if (!msg || !msg.value) return
    console.log(msg);
  }

  const keyDownHandle: React.KeyboardEventHandler<HTMLFormElement> = e => {
    if (e.code === 'Enter') {
      sendMessage(searchValue)
    }
  }



  const getMessageView = (message: MessageListType) => {
    if (message.data_type === 'text') {
      return <span> {message.value}</span>
    } else if (message.data_type === 'multimodal_text') {
      (message.value as { data_type: 'text' | 'image', value: string }[])
        .forEach((m, index) => <span key={index}>{m.data_type === 'image' ? '[图片]' : m.value} </span>)
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
            <input type="search" ref={searchInputRef} className="search-ipt" value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
            <input type="text" style={{ display: 'none' }} />
          </form>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }} onClick={() => sendMessage(searchValue)}>搜索</span>
        </div>
        {
          base64DataArray.length > 0 &&
          <div className="imgs">
            {base64DataArray.map(base64 => <div key={base64.id} className="img-item">
              <div className="remove-icon-wrapper" onClick={() => removeBase64Data(base64.id)}>
                <img className='remove-icon' src={close} alt="" />
              </div>
              <img className='search-img' src={base64.base} />
            </div>
            )}
          </div>
        }
      </div>
      <div className="search-res">
        {result && result[0] && result[0].value &&
          <div className='res-block'>
            {
              result.find(rf => rf.data_type === 'voice') &&
              <div className='voice-btn' onClick={() => playVoice(result.find(rf => rf.data_type === 'voice'))}>点击播放语音</div>
            }
            {
              result[1]?.value ?
                <Markdown>{(result[1]?.value as string)}</Markdown> :
                <span>思考中...</span>
            }
          </div>
        }

      </div>
      <div className={`message-action ${(recordStatus === 'recording' || recordStatus === 'translation') ? 'opa0' : ''}`} >
        <div className="messages" style={{ height: `${historyList.length > 0 ? '230px' : '0'}` }}>
          <ul>
            {historyList.map((item, index) =>
              <li className='active' key={index}>
                <div className="user-message">
                  <img src={item.u?.avatar} className='avatar' alt="" />
                  <span className='name'>{item.u?.id === localStorage.getItem('id') ? '我' : item.u?.name} </span>
                  <span className='message'>
                    {item['m'] && item['m'][0].data_type === 'text' ? item['m'][0].value : '[图片]'}
                  </span>
                </div>
                {
                  item['m'] && item['m'].length > 0 && item['m'][1] &&
                  <div className="ai-message">
                    <img src={ai_avatar} className='avatar' alt="" />
                    <span className='name'>ai</span>
                    {item.m && item.m.filter((_, index2) => {
                      if (item.u?.id === localStorage.getItem('id')) {
                        return index2 !== 1 && index2 !== 0
                      } else {
                        return index2 === 1
                      }
                    }).map((msg, index3) => { return getMessageView(msg) }
                    )}
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