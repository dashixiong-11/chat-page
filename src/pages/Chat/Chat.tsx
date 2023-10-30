import { useEffect, useState,  useCallback, useRef } from 'react'
import { post } from '@/utils/server';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/hooks/useStore';
import { useSearch } from '@/hooks/useSearch/useSearch';
import history from '@/assets/icons/history.svg'
import close from '@/assets/icons/close_w.svg'
import Markdown from 'react-markdown'
import { showLoading, showToast, hideLoading } from '@/utils/loading';
import { dataURLtoBlob } from '@/utils/dataURLtoBlob';
import './Chat.scss'

type UploadToOpenAIResType = {
  "url": string,
  "assetPointer": string,
  "height": string,
  "width": string,
  "sizeBytes": string
}

function Chat() {
  const [params] = useSearchParams()
  const workDir = params.get('workDir')
  const navigate = useNavigate()
  const { view, message,  base64DataArray, removeBase64Data, clearBase64DataArray } = useSearch()
  const newMessage = useStore((state) => state.newMessage)
  const [result, setResult] = useState<MessageListType[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { ws } = useStore()

  useEffect(() => {
    if (!newMessage || !newMessage.m) return
    // const copy = [...historyList]
    // if (copy.some(item => item.u?.offset === newMessage.u?.offset)) {
    //   const c = copy.map(item => item.u?.offset === newMessage.u?.offset ? newMessage : item)
    //   setHistoryList([...c])
    //   setAiStatus('waitting')
    //   hideLoading()
    // } else {
    //   setHistoryList([...copy, newMessage])
    // }

    if (newMessage.u?.id === localStorage.getItem('id')) {
      setResult(newMessage.m)
    }
    if(newMessage.m[1]) {
      hideLoading()
    }
    console.log(newMessage, 'newMessage');
  }, [newMessage])


  const loadImageDimensions: (base64Image: string) => Promise<{ width: number, height: number }> = (base64Image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function (event: Event) {
        const targetImg = event.currentTarget as HTMLImageElement;
        resolve({
          width: targetImg.width,
          height: targetImg.height
        });
      };
      img.onerror = function () {
        reject(new Error('Error loading image.'));
      };
      img.src = base64Image;
    });
  }

  const uploadFile: () => Promise<UploadToOpenAIResType[]> = useCallback(async () => {
    if (!base64DataArray.length) { return [] }
    const formData = new FormData
    for (let i = 0; i < base64DataArray.length; i++) {
      try {
        const blob = dataURLtoBlob(base64DataArray[i].base)
        const dimensions = await loadImageDimensions(base64DataArray[i].base);
        if (blob) {
          formData.append('files', blob)
          formData.append('widths', dimensions.width.toString())
          formData.append('heights', dimensions.height.toString())
        }
      } catch (error: any) {
        return []
      }
    }

    try {
      const res = await post<string[]>('/filesystem/api/upload-form' + (workDir ? `/${workDir}` : ''), formData)
      console.log('res', res);
      const urls = await post<{ urls: string[] }>('/filesystem/api/attach', { file_info_ids: res.data })
      console.log('urls', urls);
      const values = await post<{ data: UploadToOpenAIResType[] }>('/gpt2api/api/upload-to-openai', { urls: urls.data.urls })
      return values.data.data
    } catch (error: any) {
      return []
    }
  }, [base64DataArray])



  const sendMessage = useCallback(async (message: string) => {
    searchInputRef.current?.blur()
    if (!message.trim()) {
      showToast({
        message: '请输入内容',
        duration: 1500
      })
      return
    }
    const values = await uploadFile()
    console.log('values', values);
    if (!values) {
      showToast({
        message: '图片上传出错',
        duration: 1500
      })
      return
    }
    showLoading()
    const messageList: MessageListType = {
      data_type: 'text',
      value: message
    }
    if (values.length >= 1) {
      const valueArray: { data_type: 'text' | 'image', value: string | UploadToOpenAIResType }[] = [{ data_type: 'text', value: message }]
      values.forEach((value) => {
        valueArray.push({ data_type: 'image', value: value })
      })
      Object.assign(messageList, { data_type: 'multimodal_text', value: [{ data_type: 'text', value: message }, ...values.map(value => ({ data_type: 'image', value: value }))] })
    }
    const channelName = params.get('channel_name') || ''
    ws?.publish(channelName, [messageList]).then(function () {
      console.log('发送成功');
    }, function (err) {
      showToast({
        message: '发送失败',
        duration: 1500
      })
      console.log('发送失败', err);
    }).finally(() => {
      clearBase64DataArray()
    })
  }, [base64DataArray])



  useEffect(() => {
    if (!message && base64DataArray.length === 0) return
    sendMessage(message)
  }, [message])




  const to = (path: string) => {
    navigate(path)
  }



  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(function () {
      showToast({
        message:'已复制',
        duration: 1500
      })

    }).catch(function (err) {
      console.error('无法复制文本: ', err);
    });
  }

  return <div className="chat"  >
    <div className="floating-ball" onClick={() => to('/history')}>
      <img src={history} alt="" />
    </div>
    <main style={{ height: '100vh' }} >
      <div className="main-header">
        {view}
        {/* <div className="search">
          <form action="." style={{ flex: 1 }} onKeyDown={keyDownHandle}>
            <input type="search" ref={searchInputRef} className="search-ipt" value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
            <input type="text" style={{ display: 'none' }} />
          </form>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }} onClick={() => sendMessage(searchValue)}>搜索</span>
        </div> */}
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
        {result && result[1]?.value &&
          result.filter(f => f.data_type === 'text').map(res =>
            <div className='res-block'>
              {/* {
              result.find(rf => rf.data_type === 'voice') &&
              <div className='voice-btn' onClick={() => playVoice(result.find(rf => rf.data_type === 'voice'))}>点击播放语音</div>
            } */}
              {res?.value && <div className='cp-btn' onClick={() => copy((res?.value as string))}>复制</div>}
              {res?.value && <Markdown>{(res?.value as string)}</Markdown>}
            </div>
          )
        }

      </div>
      {/* <div className={`message-action ${(recordStatus === 'recording' || recordStatus === 'translation') ? 'opa0' : ''}`} >
        <div className="messages" style={{ height: `${historyList.length > 0 ? '230px' : '0'}` }}>
          <ul>
            {historyList.map((item, index) =>
              <li className='active' key={index}>
                <div className="user-message">
                  <img src={item.u?.avatar} className='avatar' alt="" />
                  <span className='name'>{item.u?.id === localStorage.getItem('id') ? '我' : item.u?.name} </span>
                  <span className='message'>
                    {item['m'] && item['m'][0] && getMessageView(item['m'][0])}
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
                    }).map((msg) => { return getMessageView(msg) }
                    )}
                  </div>
                }
              </li>
            )}
          </ul>
        </div>
        {view}
      </div> */}

    </main>
  </div>
}

export default Chat