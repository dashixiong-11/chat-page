import { post } from '@/utils/server';
import check from '@/assets/icons/check.svg'
import folder from '@/assets/icons/folder-upload.svg'
import translation from '@/assets/icons/translation.svg'
import close from '@/assets/icons/close_w.svg'
import vioce from '@/assets/icons/voice.svg'
import usePortal from "../usePortal/usePortal"
import { useState, useRef, useEffect, useCallback, ChangeEventHandler, ChangeEvent } from 'react'
import { pdf2png } from '@/utils/pdf2png'
import { jssdkAuthorize } from '@/utils/jssdkAuthorize'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '@/hooks/useStore';
import { showToast, showLoading, hideLoading } from '@/utils/loading'
import { dataURLtoBlob } from '@/utils/dataURLtoBlob';
import search from '@/assets/icons/search-line.svg'
import camera from '@/assets/icons/camera.svg'
import expandDown from '@/assets/icons/expand-down.svg'
import voice from '@/assets/icons/voice-line.svg'
import wx from 'jweixin-1.6.0'
import './useSearch.scss'

type RecordStatus = 'recording' | 'translation' | 'off' | 'done'

const ua = navigator.userAgent.toLowerCase(); //判断是否是苹果手机，是则是true
const isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1);

const RecordBall = ({ remove, sendMessage }: {
    remove: () => void,
    sendMessage: (message: string) => void
}) => {
    const [_status, set_status] = useState<RecordStatus>('recording')
    const [textValue, setTextValue] = useState('')


    const startRecording = () => {
        wx.startRecord({
            success: () => {
                set_status('recording')
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

    useEffect(() => {
        startRecording()
    }, [])

    const translationVoice = async (id: string) => {
        set_status('translation')
        return new Promise((resolve) => {
            wx.translateVoice({
                localId: id,
                isShowProgressTips: 1,
                success: function (res: any) {
                    resolve(res.translateResult)
                    // setTextValue(textValue + res.translateResult)
                }
            })
        })

    }
    const stopRecording: () => Promise<string> = async () => {
        return new Promise((resolve) => {
            wx.stopRecord({
                success: (res) => {
                    resolve(res.localId)
                }
            })
        })
    }


    useEffect(() => {
        wx.onVoiceRecordEnd({
            complete: async function (res: any) {
                await translationVoice(res.localId)
            }
        })
    }, [])

    const sendVioce = useCallback(() => {
        sendMessage(textValue)
        remove()
    }, [textValue])

    const cancel = () => {
        stopRecording()
        remove()
    }
    const trans = async () => {
        const id = await stopRecording()
        const text = await translationVoice(id)
        setTextValue(textValue + text)
    }


    const textareaChangehandle: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setTextValue(e.target.value)
    }

    return <>
        <div className="record-wrapper">
            <div className="record-result">
                <textarea className='record-textarea' value={textValue} onChange={textareaChangehandle}></textarea>
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
                        <img src={translation} onClick={trans} alt="" /> :
                        <img src={vioce} onClick={startRecording} alt="" />
                }
                <div className='close-icon'>
                    <img src={close} onClick={cancel} alt="" />
                </div>
                <img src={check} onClick={sendVioce} alt="" />
            </div>
        </div>
    </>
}



type UploadToOpenAIResType = {
    "url": string,
}
type Base64DataType = { base: string, id: string }
export function useSearch(cb?: () => void) {
    const [params] = useSearchParams()
    const workDir = params.get('workDir')
    const searchInputRef = useRef<HTMLTextAreaElement>(null)
    const [searchValue, setSearchValue] = useState('')
    const { portal, remove } = usePortal()
    const [base64DataArray, setBase64DataArray] = useState<Base64DataType[]>([])
    const [imageIds, setImageIds] = useState<string[]>([])
    const onInput = (e: ChangeEvent<HTMLTextAreaElement>,) => {
        adjustHeight()
        setSearchValue(e.target.value)
    }
    const { ws } = useStore()

    //后端不给整id 只能靠index删除 可能会出错
    const removeBase64Data: (selectedIndex: number) => void = (selectedIndex) => {
        const updatedItems = base64DataArray.filter((_, index) => index !== selectedIndex);
        const updatedImageIds = imageIds.filter((_, index) => index !== selectedIndex);
        setBase64DataArray(updatedItems);
        setImageIds(updatedImageIds);
    }
    const clearBase64DataArray = () => setBase64DataArray([])

    useEffect(() => {
        (async () => {
            await jssdkAuthorize()
        })()
    }, [])

    useEffect(() => {
        return () => {
            remove()
        }
    }, [])



    const showBall = () => {
        portal(<RecordBall remove={remove} sendMessage={sendMessage} />)
    }


    const fileChangeHandle: ChangeEventHandler<HTMLInputElement> = async (e) => {
        switchAction()
        const files = e.target.files;
        if (!files) return;

        const isImageOrPDF = Array.from(files).every(file => {
            return file.type.match('image.*') || file.type === 'application/pdf';
        });

        if (!isImageOrPDF) {
            showToast({
                message: '文件类型不合法',
                duration: 1500
            });
            return;
        }

        showLoading()
        try {
            const promises = Array.from(files).map(file => pdf2png(file));
            const baseArrays = await Promise.all(promises);
            const baseArray: any[] = baseArrays.flat();
            const ids = await uploadFile(baseArray)
            setImageIds(ids)
            setBase64DataArray(baseArray);

            hideLoading()
        } catch (error) {
            showToast({
                message: '文件处理出错',
                duration: 1500
            });
        }
    }
    const keyDownHandle: React.KeyboardEventHandler<HTMLFormElement> = e => {
        if (e.code === 'Enter') {
            sendMessage(searchValue)
        }
    }



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

    const uploadFile: (bs64: Base64DataType[]) => Promise<string[]> = async (bs64) => {
        if (!bs64.length) { return [] }
        const formData = new FormData
        for (let i = 0; i < bs64.length; i++) {
            try {
                const blob = dataURLtoBlob(bs64[i].base)
                const dimensions = await loadImageDimensions(bs64[i].base);
                if (blob) {
                    formData.append('files', blob)
                    formData.append('widths', dimensions.width.toString())
                    formData.append('heights', dimensions.height.toString())
                }
            } catch (error: any) {
                console.error(`Error processing image ${i + 1}:`, error);
                return []
            }
        }

        try {
            const res = await post<string[], FormData>('/filesystem/api/upload-form' + (workDir ? `/${workDir}` : ''), formData)
            console.log('res', res);
            return res.data
        } catch (error) {
            return []
        }
    }

    const attchImage: () => Promise<{ url: string }[]> = useCallback(async () => {
        if (imageIds.length === 0) return []
        try {
            const res = await post<{ urls: string[] }, { file_info_ids: string[] }>('/filesystem/api/attach', { file_info_ids: imageIds })
            const data = res.data.urls.map(u => ({ url: u }))
            return data
        } catch (error: any) {
            return []
        }
    }, [imageIds])


    const sendMessage = useCallback(async (message: string) => {
        searchInputRef.current?.blur()
        const values = await attchImage()
        if (!message.trim() && values.length === 0) { return }
        cb && cb()
        const messageList: MessageListType = {
            data_type: 'text',
            value: message
        }
        const textMessage = { data_type: 'text', value: message }
        const imgMessage = { data_type: 'image', value: values }

        if (message.trim() && values.length >= 1) {
            Object.assign(messageList, { data_type: 'multimodal_text', value: [textMessage, imgMessage] })
        } else if (!message.trim() && values.length >= 1) {
            Object.assign(messageList, imgMessage)
        }
        const channelName = params.get('channel_name') || ''
        ws?.publish(channelName, [messageList]).then(function () {
        }, function (err) {
            showToast({
                message: '发送失败',
                duration: 1500
            })
            console.log('发送失败', err);
        }).finally(() => {
            clearBase64DataArray()
            setSearchValue('')
            if (!searchInputRef.current) return
            searchInputRef.current.style.height = 'inherit';
        })
    }, [base64DataArray])

    const adjustHeight = () => {
        if (searchInputRef.current) {
            searchInputRef.current.style.height = 'inherit';
            searchInputRef.current.style.height = `${searchInputRef.current.scrollHeight}px`;
        }
    };

    const [visible, setVisible] = useState(false)
    const switchAction = () => {
        setVisible(!visible)
    }

    const chooseImg = async () => {
        switchAction()
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: async (res: any) => {
                const localIds = res.localIds;
                eachGetBase64(localIds)
            }
        })
    }

    const eachGetBase64 = (ids: string[]) => {
        showLoading()
        let index = 0
        let id: number
        const imgArray: Base64DataType[] = []


        const get = () => {
            if (index >= ids.length) {
                hideLoading()
                setBase64DataArray(imgArray)
                uploadFile(imgArray)
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

    const view = <>
        <div className='search-bar'>
            <>
                <div className="upload-action">
                    <img className='icon' style={{ width: '26px', height: '26px' }} src={expandDown} alt="" onClick={switchAction} />
                    <img className='icon action-icon' onClick={chooseImg} style={{ transform: visible ? 'translateX(-50%) translateY(calc(1em + 15px))' : '', opacity: visible ? 1 : 0, zIndex: visible ? 2 : '-1' }} src={camera} alt="" />
                    <div className='action-icon' style={{ transform: visible ? 'translateX(-50%) translateY(calc(2em + 30px))' : '', opacity: visible ? 1 : 0, zIndex: visible ? 2 : '-1' }}>
                        <input id='file-input' style={{ display: 'none' }} type="file" multiple accept="image/*,application/pdf" onChange={fileChangeHandle} capture={false} />
                        <label className="upload-file" htmlFor='file-input'>
                            <img className='icon' src={folder} alt="" />
                        </label>
                    </div>
                </div>
                <div className="search-wrapper">
                    <div className="search">
                        <form action="." onKeyDown={keyDownHandle} style={{ flex: 1, display: 'flex' }}>
                            <textarea ref={searchInputRef} className="search-ipt" inputMode='search' rows={1} value={searchValue} onChange={onInput} placeholder='请输入想要搜索的问题' />
                        </form>
                    </div>
                    <div className="icon-wrapper">
                        <img src={voice} className='vioce-icon' alt="" onClick={showBall} />
                        <img src={search} className='search-icon' alt="" onClick={() => sendMessage(searchValue)} />
                    </div>
                </div>
            </>
        </div>
    </>

    return {
        view,
        base64DataArray,
        removeBase64Data,
    }
}