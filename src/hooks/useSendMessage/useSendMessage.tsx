import { post } from '@/utils/server'
import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import translation from '@/assets/icons/translation.svg'
import close from '@/assets/icons/close_w.svg'
import vioce from '@/assets/icons/voice.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useEffect, Dispatch, SetStateAction, useRef, useCallback } from 'react'
import lottie from 'lottie-web';
import { showToast } from '@/utils/loading'
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
                if (_status === 'done') {
                    setText(textValue + res.translateResult)
                } else {
                    setTextValue(textValue + res.translateResult)
                }
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
        } else {
            stopRecording()
        }
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


    useEffect(() => {
        let signLink = ''
        const ua = navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(ua)) {
            signLink = decodeURIComponent(wx.signurl())
        } else if (/(android)/i.test(ua)) {
            // alert('安卓终端设备')
            signLink = location.href
        } else {
            // alert('PC终端设备')
            signLink = location.href
        }
        post('/miniprogram/api/jssdk', {
            url: signLink
        }).then((res: any) => {
            if (res.code === 0 && res.data) {
                const { appId = '', timestamp = '', nonceStr = '', signature = '' } = res.data
                wx.config({
                    debug: false,
                    appId: appId,
                    timestamp: timestamp,
                    nonceStr: nonceStr,
                    signature: signature,
                    jsApiList: ['chooseImage', 'startRecord', 'stopRecord', 'uploadImage', 'downloadImage', 'uploadVoice', 'translateVoice']
                });
                wx.error(function (err: any) {
                    showToast({
                        message: '未获取麦克风权限',
                        duration: 1500
                    })
                    console.log(err, '--------');

                })
            }
            console.log(res);
        }).catch(error => console.log(error));
    }, [])

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
        message,
        recordStatus
    }
}