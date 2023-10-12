import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import pause from '@/assets/icons/pause.svg'
import play from '@/assets/icons/play.svg'
import close from '@/assets/icons/close_w.svg'
import vioce from '@/assets/icons/voice.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import lottie from 'lottie-web';
import './useSendMessage.scss'

type RecordStatus = 'recording' | 'pause' | 'off' | 'done'

const RecordBall = ({ status, setStatus }: { status: RecordStatus, setStatus: Dispatch<SetStateAction<RecordStatus>> }) => {
    const [_status, set_status] = useState<RecordStatus>(status)

    const onChangeStatus = (s: RecordStatus) => {
        set_status(s)
        setStatus(s)
    }
    return <>
        <div className="record-wrapper">
            <div className='record-volume'>
                <div className={`volume-wrapper ${_status === 'recording' ? 'recording-animation' : ''}`}>
                    <img src={vioce} alt="" />
                    {new Array(1, 2, 3, 4).map(i => <div key={i} className={`volume-${i}`} />)}
                </div>
                <span>{status === 'recording' ? '录音中' : '暂停录音'}</span>
            </div>
            <div className="record-wrapper-footer">
                {
                    _status === 'recording' ?
                        <img src={pause} onClick={() => onChangeStatus('pause')} alt="" /> :
                        <img src={play} onClick={() => onChangeStatus('recording')} alt="" />
                }
                <div className='close-icon'>
                    <img src={close} onClick={() => onChangeStatus('off')} alt="" />
                </div>
                <img src={check} onClick={() => onChangeStatus('done')} alt="" />
            </div>
        </div>
    </>
}


export function useSendMessage() {
    const { portal, remove } = usePortal()
    const [recordStatus, setRecordStatus] = useState<RecordStatus>('done')
    const [translationResult, setTranslationResult] = useState([])
    const [message,setMessage] = useState('')

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

    const translationVoice = (id: string) => {
        wx.translateVoice({
            localId: id,
            isShowProgressTips: 1,
            success: function (res: any) {
                setTranslationResult(translationResult.concat(res.translateResult));
            }
        })
    }
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
        const container = document.querySelector('#lottie-container');
        if (!container) return
        lottie.loadAnimation({
            container: container!,
            renderer: 'canvas',       // 渲染方式 ('svg'/'canvas'/'html')
            loop: true,
            autoplay: true,
            path: './src/assets/animation/ball/ball.json'
        });
    }, [])

    useEffect(() => {
        if (recordStatus === 'recording') {
            portal(<RecordBall status={recordStatus} setStatus={setRecordStatus} />)
        } else if (recordStatus === 'off' ) {
            remove()
        }else if (recordStatus === 'done'){
            setMessage(translationResult.join(','))
        }
    }, [recordStatus])


    const start = () => {
        setRecordStatus('recording')
        //startRecording()
    }

    const view = <>
        <div className={`send-message-action-bar ${(recordStatus === 'recording' || recordStatus === 'pause') ? 'opa0' : ''}`}>
            <>
                <div className="upload-file">
                    <img className='icon' src={folder} alt="" />
                    <span>文件</span>
                </div>
                <div className='send-voice' onClick={start} id="lottie-container"></div>
                <div className="upload-img">
                    <img className='icon' src={pic} alt="" />
                    <span>图片</span>
                </div>
            </>
        </div>
    </>

    return {
        view,
        translationResult,
        message
    }
}