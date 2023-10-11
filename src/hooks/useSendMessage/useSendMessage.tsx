import pic from '@/assets/icons/pic.svg'
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder.svg'
import pause from '@/assets/icons/pause.svg'
import play from '@/assets/icons/play.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useEffect } from 'react'
import lottie from 'lottie-web';
import './useSendMessage.scss'

type RecordStatus = 'recording' | 'pause' | 'no' | 'done'

const RecordBall = ({ status }: { status: RecordStatus }) => {
    return <>
        <div className="record-wrapper">
            <div className="record-wrapper-footer">
                {
                    status === 'recording' ?
                        <img src={pause} alt="" /> :
                        <img src={play} alt="" />
                }
                <div style={{ width: '100px', height: '100px' }}></div>
                <img src={check} alt="" />

            </div>
        </div>
    </>
}


export function useSendMessage() {
    const { portal, remove } = usePortal()
    const [recordStatus, setRecordStatus] = useState<RecordStatus>('no')
    const [translationResult, setTranslationResult] = useState('')
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
    const stopRecording = () => {
        wx.stopRecord({
            success: (res) => {
                console.log(res.localId);
                //uploadLocalVoice(res.localId)
                wx.translateVoice({
                    localId: res.localId,
                    isShowProgressTips: 1,
                    success: function (res: any) {
                        alert(res.translateResult);
                    }
                })
            }
        })
    }

    useEffect(() => {
        const container = document.querySelector('#lottie-container');
        if (!container) return
        lottie.loadAnimation({
            container: container!,
            renderer: 'canvas',       // 渲染方式 ('svg'/'canvas'/'html')
            loop: true,
            autoplay: true,
            path: './src/assets/animation/ball/yuyin1.json'
        });
    }, [])

    const start = () => {
        setRecordStatus('recording')
        portal(<RecordBall status={recordStatus} />)
    }

    const view = <>
        <div className=' send-message-action-bar'>
            <>
                <div className="upload-file">
                    <img className='icon' src={folder} alt="" />
                    <span>文件</span>
                </div>
                <div className={`send-voice ${recordStatus === 'recording' ? 'set-index' : ''}`} onClick={start} id="lottie-container"></div>
                <div className="upload-img">
                    <img className='icon' src={pic} alt="" />
                    <span>图片</span>
                </div>
            </>
        </div>
    </>

    return {
        view,
        translationResult
    }
}