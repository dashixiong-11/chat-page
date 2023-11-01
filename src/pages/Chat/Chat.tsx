import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/hooks/useStore';
import { useSearch } from '@/hooks/useSearch/useSearch';
import history from '@/assets/icons/history.svg'
import close from '@/assets/icons/close_w.svg'
import Markdown from 'react-markdown'
import usePortal from '@/hooks/usePortal/usePortal';
import { showToast } from '@/utils/loading';
import { Parser, Player, DB } from 'svga'
import  ballurl from '../../assets/animation/ball.svga?url'
import './Chat.scss'


const BallLoading = () => {
  const player = useRef<Player | null>(null)
  const parser = useRef<Parser | null>(null)
  useEffect(() => {
    (async () => {
      const canvas = document.getElementById('ball-canvas') as HTMLCanvasElement;
      if (!canvas) return
      player.current = new Player({
        container: canvas,
      })
      // const ballurl = './src/assets/animation/ball.svga'
      try {
        const db = new DB()
        let svga = await db.find(ballurl)
        if (!svga) {
          // Parser 需要配置取消使用 ImageBitmap 特性，ImageBitmap 数据无法直接存储到 DB 内
          parser.current = new Parser({ isDisableImageBitmapShim: true })
          svga = await parser.current.load(ballurl)
          await db.insert(ballurl, svga)
        }
        if (!player.current) return
        await player.current.mount(svga)
        player.current.start()
      } catch (error) {
        console.log('error', error);
        parser.current = new Parser()
        const svga = await parser.current.load(ballurl)
        await player.current.mount(svga)
        player.current.start()
      }
    })()
    return () => {
      parser.current && parser.current.destroy()
      player.current && player.current.destroy()
    }
  }, [])
  return <>
    <canvas id='ball-canvas' />
  </>
}
function Chat() {
  const navigate = useNavigate()
  const { view, base64DataArray, removeBase64Data } = useSearch(() => {
    showBallLoading()
  })
  const { portal, remove } = usePortal()
  const newMessage = useStore((state) => state.newMessage)
  const [result, setResult] = useState<MessageListType[]>([])
  const currentOffset = useRef<number | undefined>(0)

  useEffect(() => {
    if (!newMessage || !newMessage.m) return
    currentOffset.current = newMessage.u?.offset
    if (newMessage.u?.id === localStorage.getItem('id') && (newMessage.u?.offset === currentOffset.current || currentOffset.current === 0)) {
      setResult(newMessage.m)
    }
    if (newMessage.u?.revise === 'true') {
      hideBallLoading()
    }
    console.log('new message', newMessage);

  }, [newMessage])


  const to = (path: string) => {
    navigate(path)
  }

  useEffect(() => {
    return () => {
      remove()
    }
  }, [])

  const showBallLoading = () => {
    portal(<BallLoading />, <div className='ball-loading-mask' />)

  }
  const hideBallLoading = () => { remove() }

  function fallbackCopyTextToClipboard(text: string) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
      showToast({
        message: '已复制',
        duration: 1500
      })
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  const copy = (text: string) => {
    // First try to use the modern approach
    if (navigator.clipboard && window.isSecureContext) {
      // navigator.clipboard is available
      navigator.clipboard.writeText(text).catch((err) => {
        // If it fails, use the fallback method
        fallbackCopyTextToClipboard(text);
        return
        console.error('Fallback: Oops, unable to copy', err);
      });
      showToast({
        message: '已复制',
        duration: 1500
      })
    } else {
      // navigator.clipboard is not available or not in a secure context
      // Use the fallback method
      fallbackCopyTextToClipboard(text);
    }
  };


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
        {newMessage && newMessage.m && newMessage.m[0] &&
          result.filter(f => f.data_type === 'text' || f.data_type === 'multimodal_text').map((res, index) =>
            <div className='res-block' key={index}>
              {/* {
              result.find(rf => rf.data_type === 'voice') &&
              <div className='voice-btn' onClick={() => playVoice(result.find(rf => rf.data_type === 'voice'))}>点击播放语音</div>
            } */}
              {res?.value && <div className='cp-btn' onClick={() => copy((res?.value as string))}>
                <span>
                  {index === 0 ? '问题：' : index === 1 ? '回答：' : '其他：'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#3478f5', fontSize: '13px' }}>
                  复制
                </span>
              </div>}
              {res?.data_type === 'text' ? <Markdown>{(res?.value as string)}</Markdown> :
                <div style={{ marginTop: '1em' }}> {
                  (res.value as { data_type: string, value: string }[]).map((item, index) =>
                    <span key={index}>{item.data_type === 'text' ? item.value : item.data_type === 'image' ? '[图片]' : ''}</span>
                  )}
                </div>
              }
            </div>
          )}
      </div>
    </main>
  </div>
}

export default Chat