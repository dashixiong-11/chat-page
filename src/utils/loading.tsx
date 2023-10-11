import { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';


let id: number
function show(child: ReactNode) {
    const findDiv = document.querySelector('#popup-wrapper')
    if (findDiv) { hide() }
    const div = document.createElement('div')
    div.id = 'popup-wrapper'
    const root = ReactDOM.createRoot(div);
    root.render(
        <>
            <div className='popup-mask' />
            <div className='popup-wrapper '>
                {child}
            </div>
        </>

    )
    document.body.appendChild(div);
}
function hide() {
    const findDiv = document.querySelector('#popup-wrapper')
    if (findDiv) {
        document.body.removeChild(findDiv);
    }
}

function showLoading() {
    show(<div className="loading" />)
}

function hideLoading() {
    hide()
}

function showToast({ message, duration }: { message: string, duration?: number }) {
    show(<> <div className='popup-toast'>
        {message}
    </div> </>)
    clearTimeout(id)
    if (duration) {
        id = setTimeout(() => {
            hide()
            clearTimeout(id)
        }, duration)
    }
}

function hideToast() {
    hide()
}

function showNotification({ message, duration, type = 'info', success }: {
    message: string, duration?: number, type?: 'info' | 'success' | 'warning' | 'error',
    success?: () => void
}) {
    const findDiv = document.querySelector('#popup-wrapper')
    if (findDiv) { hide() }
    const div = document.createElement('div')
    div.id = 'popup-wrapper'
    const root = ReactDOM.createRoot(div);
    root.render(
        <>
            <div className='notification-mask' />
            <div className={`notification ${type}`}>
                {message}
            </div>
        </>

    )

    document.body.appendChild(div);
    clearTimeout(id)
    if (duration) {
        id = setTimeout(() => {
            hideNotification()
            success && success()
            clearTimeout(id)
        }, duration)
    }
}
function hideNotification() {
    hide()
}




export {
    showLoading, hideLoading,
    showToast, hideToast,
    showNotification, hideNotification
}