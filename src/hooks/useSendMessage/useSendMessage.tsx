import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import translation from '@/assets/icons/translation.svg'
import close from '@/assets/icons/close_w.svg'
import vioce from '@/assets/icons/voice.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useRef, useEffect, Dispatch, SetStateAction, useCallback, ChangeEventHandler } from 'react'
import { pdf2png } from '@/utils/pdf2png'
import { jssdkAuthorize } from '@/utils/jssdkAuthorize'
import { Parser, Player, DB } from 'svga'
import { showToast, showLoading, hideLoading } from '@/utils/loading'
import wx from 'jweixin-1.6.0'
import './useSendMessage.scss'

type RecordStatus = 'recording' | 'translation' | 'off' | 'done'

const RecordBall = ({ status, setStatus, setText }: {
    status: RecordStatus,
    setStatus: Dispatch<SetStateAction<RecordStatus>>
    setText: Dispatch<SetStateAction<string>>
}) => {
    const [_status, set_status] = useState<RecordStatus>(status)
    const [textValue, setTextValue] = useState('')
    const onChangeStatus = (s: RecordStatus) => {
        set_status(s)
        setStatus(s)
    }


    const startRecording = () => {
        wx.startRecord({
            success: () => {
                console.log('开始录音');
            },
            cancel: () => {
                showToast({
                    message: '拒绝授权将无法使用语音功能',
                    duration: 1500
                })
                console.log('拒绝授权');
            }
        })

    }

    const translationVoice = useCallback((id: string) => {
        wx.translateVoice({
            localId: id,
            isShowProgressTips: 1,
            success: function (res: any) {
                setTextValue(textValue + res.translateResult)
            }
        })
    }, [_status])
    const stopRecording = () => {
        wx.stopRecord({
            success: (res) => {
                translationVoice(res.localId)
            }
        })
    }

    useEffect(() => {
        wx.onVoiceRecordEnd({
            // 录音时间超过一分钟没有停止的时候会执行 complete 回调
            complete: function (res: any) {
                translationVoice(res.localId)
            }
        })
    }, [])

    useEffect(() => {
        if (_status === 'recording') {
            startRecording()
            return
        } else if (_status === 'done') {
            setText(textValue)
        }
        stopRecording()
    }, [_status])



    const textareaChangehandle: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setTextValue(e.target.value)
    }

    return <>
        <div className="record-wrapper">
            <div className="record-result">
                <textarea value={textValue} onChange={textareaChangehandle}></textarea>
            </div>
            <div className='record-volume'>
                <div className={`volume-wrapper ${_status === 'recording' ? 'recording-animation' : ''}`}>
                    <img src={vioce} alt="" />
                    {new Array(1, 2, 3, 4).map(i => <div key={i} className={`volume-${i}`} />)}
                </div>
                <span>{_status === 'recording' ? '录音中' : '翻译中'}</span>
            </div>
            <div className="record-wrapper-footer">
                {
                    _status === 'recording' ?
                        <img src={translation} onClick={() => onChangeStatus('translation')} alt="" /> :
                        <img src={vioce} onClick={() => onChangeStatus('recording')} alt="" />
                }
                <div className='close-icon'>
                    <img src={close} onClick={() => onChangeStatus('off')} alt="" />
                </div>
                <img src={check} onClick={() => onChangeStatus('done')} alt="" />
            </div>
        </div>
    </>
}


type Base64DataType = { base: string, id: string }
export function useSendMessage({ aiStatus }: { aiStatus: 'thinking' | 'waitting' }) {
    const { portal, remove } = usePortal()
    const [recordStatus, setRecordStatus] = useState<RecordStatus>('done')
    const [message, setMessage] = useState('')
    const [base64DataArray, setBase64DataArray] = useState<Base64DataType[]>([])

    const removeBase64Data = (id: string) => {
        const updatedItems = base64DataArray.filter(item => item.id !== id);
        setBase64DataArray(updatedItems);
    }
    const clearBase64DataArray = () => setBase64DataArray([])

    useEffect(() => {
        (async () => {
            await jssdkAuthorize()
        })()
    }, [])

    const eachGetBase64 = (ids: string[]) => {
        showLoading()
        let index = 0
        let id: number
        const imgArray: Base64DataType[] = []


        const get = () => {
            if (index >= ids.length) {
                hideLoading()
                setBase64DataArray(imgArray)
                //  uploadFile()
                clearTimeout(id)
                return
            }
            wx.getLocalImgData({
                localId: ids[index], // 图片的localID
                success: function (res: any) {
                    const localData = res.localData;
                    let imageBase64 = '';
                    if (localData.indexOf('data:image') == 0) {
                        imageBase64 = localData;
                    } else {
                        imageBase64 = 'data:image/jpeg;base64,' + localData.replace(/\n/g, '');
                    }
                    console.log('setbase 64');
                    imgArray.push({ base: imageBase64, id: ids[index] })
                    // setBase64DataArray([...base64DataArray, { base: imageBase64, id: ids[index] }])
                    index++
                    id = setTimeout(() => {
                        get()
                    }, 500)
                }
            });
        }
        get()
    }


    const chooseImg = async () => {

        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: async (res: any) => {
                const localIds = res.localIds;
                eachGetBase64(localIds)
            }
        })
    }


    const player = useRef<Player | null>(null)
    const parser = useRef<Parser | null>(null)
    useEffect(() => {
        (async () => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            if (!canvas) return
            player.current = new Player({
                container: canvas,
            })
            try {
                const url = './src/assets/animation/ball.svga'
                const db = new DB()
                let svga = await db.find(url)
                if (!svga) {
                    // Parser 需要配置取消使用 ImageBitmap 特性，ImageBitmap 数据无法直接存储到 DB 内
                    parser.current = new Parser({ isDisableImageBitmapShim: true })
                    svga = await parser.current.load(url)
                    await db.insert(url, svga)
                }
                if (!player.current) return
                await player.current.mount(svga)
                player.current.start()
                setTimeout(() => {
                    player.current && player.current.pause()
                }, 100)


            } catch (error) {
                showToast({
                    message: '动画加载失败',
                    duration: 1500
                })
            }
        })()
        return () => {
            setRecordStatus('off')

            parser.current && parser.current.destroy()
            player.current && player.current.destroy()
        }
    }, [])

    useEffect(() => {
        if (aiStatus === 'thinking') {
            player.current && player.current.start()
        } else {
            player.current && player.current.pause()
        }
    }, [aiStatus])

    useEffect(() => {
        return () => {
            setRecordStatus('off')
            remove()
        }
    }, [])


    useEffect(() => {
        if (recordStatus === 'recording') {
            portal(<RecordBall status={recordStatus} setStatus={setRecordStatus} setText={setMessage} />)
        } else if (recordStatus === 'off' || recordStatus === 'done') {
            remove()
        }
    }, [recordStatus])

    const start = () => {
        setRecordStatus('recording')
    }

    const fileChangeHandle: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const files = e.target.files && e.target.files
        if (!files) return
        const urls: any = await pdf2png(files[0])
        setBase64DataArray(urls)
    }


    const view = <>
        <div className='send-message-action-bar'>
            <>
                <label className="upload-file">
                    <input id='file-input' type="file" accept="image/*,application/pdf" onChange={fileChangeHandle} />
                    <img className='icon' src={folder} alt="" />
                    <span>文件</span>
                </label>
                <canvas className={`send-voice ${aiStatus}`} onClick={start} id="canvas"></canvas>
                <div className="upload-img" onClick={chooseImg}>
                    <img className='icon' src={pic} alt="" />
                    <span>图片</span>
                </div>
            </>
        </div>
    </>

    return {
        view,
        message,
        recordStatus,
        base64DataArray,
        removeBase64Data,
        clearBase64DataArray
    }
}