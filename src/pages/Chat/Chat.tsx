import { useEffect, useState, useCallback, useRef } from 'react'
import { post } from '@/utils/server';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/hooks/useStore';
import { useSearch } from '@/hooks/useSearch/useSearch';
import history from '@/assets/icons/history.svg'
import close from '@/assets/icons/close_w.svg'
import Markdown from 'react-markdown'
import { showToast, hideLoading } from '@/utils/loading';
import './Chat.scss'


function Chat() {
  const navigate = useNavigate()
  const { view, base64DataArray, removeBase64Data } = useSearch()
  const newMessage = useStore((state) => state.newMessage)
  const [result, setResult] = useState<MessageListType[]>([])

  useEffect(() => {
    if (!newMessage || !newMessage.m) return

    if (newMessage.u?.id === localStorage.getItem('id')) {
      setResult(newMessage.m)
    }
    if (newMessage.m[1]) {
      hideLoading()
    }
    console.log(newMessage, 'newMessage');
  }, [newMessage])


  const to = (path: string) => {
    navigate(path)
  }



  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(function () {
      showToast({
        message: '已复制',
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
        {
          base64DataArray.length > 0 &&
          <div className="imgs">
            {base64DataArray.map((base64, index) => <div key={base64.id} className="img-item">
              <div className="remove-icon-wrapper" onClick={() => removeBase64Data(index)}>
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
          result.filter(f => f.data_type === 'text').map((res, index) =>
            <div className='res-block'>
              {/* {
              result.find(rf => rf.data_type === 'voice') &&
              <div className='voice-btn' onClick={() => playVoice(result.find(rf => rf.data_type === 'voice'))}>点击播放语音</div>
            } */}
              {res?.value && <div className='cp-btn' onClick={() => copy((res?.value as string))}>
                <span>
                  {index === 0 ? '问题：' : index === 1 ? '回答：' : '其他：'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#3478f5',fontSize:'13px' }}>
                  复制
                </span>
              </div>}
              {res?.value && <Markdown>{(res?.value as string)}</Markdown>}
            </div>
          )
        }

      </div>
    </main>
  </div>
}

export default Chat