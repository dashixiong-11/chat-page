import * as  pdfjs from 'pdfjs-dist';
import * as pdfjsWorkerMin from 'pdfjs-dist/build/pdf.worker.min?url';


pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerMin.default;



export const pdf2png = (file: File) => {
    return new Promise((resolve) => {
        const name = file.name
        if (file.type.startsWith('image/')) {

            const reader = new FileReader();
            reader.onload = async (e: any) => {
                resolve([{
                    base: e.target.result,
                    id: file.name,
                }]);
                // 这里处理图片文件
            };
            file && reader.readAsDataURL(file)
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e: any) => {
                const pdfBytes = new Uint8Array(e.target.result);
                const loadingTask = pdfjs.getDocument({ data: pdfBytes });
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const pagesPromises: Promise<HTMLCanvasElement>[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const pagePromise = pdf.getPage(i).then(page => {
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        const renderContext: any = {
                            canvasContext: context,
                            viewport: viewport
                        };

                        return page.render(renderContext).promise.then(() => canvas);
                    });
                    pagesPromises.push(pagePromise);
                }
                const canvases = await Promise.all(pagesPromises);

                // 获取所有页面的 base64 图像数据
                const images = canvases.map((canvas, index) => {
                    return { base: canvas.toDataURL(), id: name + '-' + index }
                });
                resolve(images)
            };
            file && reader.readAsArrayBuffer(file)
        }

    })
}