/// <reference types="vite/client" />
declare var wx: wx;

interface wx {
  miniProgram: {
    getEnv: (cb: (res: { miniprogram: Boolean }) => void) => void
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
  signurl: any
}

declare module 'jweixin-1.6.0' {
  export default wx
}