import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import translation from '@/assets/icons/translation.svg'
import close from '@/assets/icons/close_w.svg'
import vioce from '@/assets/icons/voice.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jssdkAuthorize } from '@/utils/jssdkAuthorize'
import lottie from 'lottie-web';
import { showToast } from '@/utils/loading'
import wx from 'jweixin-1.6.0'
import './useSendMessage.scss'
import { post } from '@/utils/server'

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


export function useSendMessage({ aiStatus }: { aiStatus: 'thinking' | 'waitting' }) {
    const { portal, remove } = usePortal()
    const [recordStatus, setRecordStatus] = useState<RecordStatus>('done')
    const [message, setMessage] = useState('')
    const [imgs, setImgs] = useState<string[]>([])
    const base64DataArray = useRef<string[]>([])
    const [params] = useSearchParams()
    const workDir = params.get('workDir')



    const attachImageToMessage = async (ids: number[]) => {
        const res = await post('/filesystem/api/attach', {
            file_info_ids: ids
        }).catch(err => { throw new Error(err) })
        console.log(res, '------');
        if (res.code === 0 && res.data && res.data.urls && Object.prototype.toString.call(res.data.urls) === '[object Array]') {
            setImgs(res.data.urls)
        }
    }
    const uploadFile = async () => {
        console.log('files', base64DataArray.current);
        const formData = new FormData
        base64DataArray.current.forEach(b => {
            const blob = dataURLtoBlob(b)
            console.log('blob', blob);

            console.log('append files');
            if (blob) {
                formData.append('files', blob)
            }
        })
        const res = await post('/filesystem/api/upload-form' + (workDir ? `/${workDir}` : ''), formData).catch(err => {
            throw new Error(err)
        })
        if (res.code === 0) {
            base64DataArray.current = []
            res.data && res.data.length > 0 && attachImageToMessage(res.data)
        }
        console.log(res);
    }

    useEffect(() => {
        (async () => {
            await jssdkAuthorize()
        })()
    }, [])

    const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        if (!arr[0].match(/:(.*?);/)) {
            return ''
        }
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    };

    const eachGetBase64 = (ids: string[]) => {
        let index = 0
        let id: number


        const get = () => {
            if (index >= ids.length) {
                uploadFile()
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
                    base64DataArray.current.push(imageBase64)
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
                console.log('localIds', localIds);
                eachGetBase64(localIds)
                //const ids = await uploadLocalImage(localIds)
                //  console.log('ids', ids);

            }
        })
    }


    useEffect(() => {
        const container = document.querySelector('#lottie-container');
        const canvas = document.querySelector('#lottie-container canvas');
        if (!container || canvas) return
        lottie.loadAnimation({
            container: container!,
            renderer: 'canvas',       // 渲染方式 ('svg'/'canvas'/'html')
            loop: true,
            autoplay: true,
            path: './src/assets/animation/ball/ball.json'
        });
        return () => {
            lottie.destroy()
        }
    }, [])

    useEffect(() => {
        if (aiStatus === 'thinking') {
            lottie.setSpeed(3)
        } else {
            lottie.setSpeed(1)
        }
    }, [aiStatus])


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

    const view = <>
        <div className='send-message-action-bar'>
            <>
                <div className="upload-file">
                    <img className='icon' src={folder} alt="" />
                    <span>文件</span>
                </div>
                <div className={`send-voice ${aiStatus}`} onClick={start} id="lottie-container"></div>
                <div className="upload-img" onClick={chooseImg}>
                    <img className='icon' src={pic} alt="" />
                    <span>图片</span>
                </div>
            </>
        </div>
    </>

    return {
        view,
        imgs,
        message,
        recordStatus,
        base64DataArray
    }
}