/// <reference types="vite/client" />
declare var wx: wx;

interface wx {
  miniProgram: any,
  startRecord: () => void,
  chooseImage: ({ }: any) => void,
  checkJsApi: any,
  config: any,
  error: any

}