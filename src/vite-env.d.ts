/// <reference types="vite/client" />
declare var wx: wx;

interface wx {
  miniProgram: any,
  startRecord: any,
  stopRecord: (data: { success: (res:{localId:string}) => void }) => void,
  chooseImage: ({ }: any) => void,
  checkJsApi: any,
  config: any,
  error: any,
  uploadImage: any,
  uploadVoice: any,
  downloadImage: any,
  translateVoice:any

}