import wx from "jweixin-1.6.0"

type ImageWithPreviewProps = {
    width?: string,
    height?: string,
    url: string,
}
export const ImageWithPreview = ({ width = '50px', height = '50px', url = '' }: ImageWithPreviewProps) => {

    const preview = () => {
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: [url] // 需要预览的图片http链接列表
        })
    }
    return <img onClick={preview} style={{ width, height, objectFit: 'cover', marginRight: '1em' }} src={url} alt="" />
}