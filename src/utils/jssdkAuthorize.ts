import { post } from "./server"
import { showToast } from "./loading"
import wx from 'jweixin-1.6.0'

export const jssdkAuthorize = () => {
    return new Promise((resolve, reject) => {
        let signLink = ''
        const ua = navigator.userAgent.toLowerCase()
        wx.miniProgram.getEnv(res => {
            console.log(res);
        })
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
                    jsApiList: ['chooseImage', 'startRecord', 'stopRecord', 'uploadImage',
                        'previewImage', 'getLocalImgData', 'playVoice',
                        'downloadImage', 'uploadVoice', 'translateVoice']
                });
                wx.error(function () {
                    reject('授权失败')
                    showToast({
                        message: '未获取麦克风权限',
                        duration: 1500
                    })
                    return
                })
                resolve('授权成功')
                return
            }
            reject('授权失败')
        }).catch(error =>
            reject(error)
        );
    })
}
