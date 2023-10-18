 export const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    if (!arr[0].match(/:(.*?);/)) {
      return ''
    }
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
      type: mime
    });
  };

