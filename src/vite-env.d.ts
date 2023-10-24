/// <reference types="vite/client" />
declare var wx: wx;

interface wx {
  miniProgram: {
    getEnv: (cb: (res: { miniprogram: Boolean }) => void) => void,
    reLaunch: ({ url }: { url: string }) => void
  },
  startRecord: any,
  stopRecord: (data: { success: (res: { localId: string }) => void }) => void,
  chooseImage: ({ }: any) => void,
  checkJsApi: any,
  config: any,
  error: any,
  uploadImage: any,
  uploadVoice: any,
  downloadImage: any,
  translateVoice: any,
  onVoiceRecordEnd: any,
  signurl: any,
  getLocalImgData: any
}

declare module 'jweixin-1.6.0' {
  export default wx
}
declare module 'pdfjs-dist/webpack'


type Channel = { cn_name: string, name: string, chan_info: { type: string, workDir?: string }, }
type Item = { id: number, name: string, chan_info: Record<string, string>, description: string, is_creatable: Boolean, root_id: number, channels?: Channel[], children?: Item[] }

type CategoryListType = {
  text: string,
  value: number | string
}[]

type MessageListType = { data_type: 'multimodal_text', value: { data_type: 'text' | 'image' | 'voice', value: string }[] }
  | { data_type: 'text' | 'voice' | 'image', value: string }

type NewMessageType = {
  m?: MessageListType[]
  u?: {
    avatar: string, id: string, name: string, offset: number | undefined, seed?: string
  }
}

type PublicationsType = {
  data: MessageListType[],
  offset: number,
  info:{user:string},
  tags: {
    seed: string,
    nickname: string,
    avatar: string
  }
}