
import { ReactElement, useRef } from 'react'
import ReactDOM from 'react-dom/client'

import './useShowToast.scss'
type P = {
  messages?: string | null,
  icon?: string | null,
  type?: 'toast' | 'message',
  duration?: number
}

const map = {
  toast: (message: string | null | undefined, icon: string | null | undefined): ReactElement<HTMLElement> => <div className="toast">
    <div className="mask" />
    {icon && icon}
    <div className="content">{message}</div>
  </div>,
  message: (message?: string | null | undefined): ReactElement<HTMLElement> => <div className='message'>
    <span className="content">{message}</span>
  </div>

}
export const useShowToast = () => {
  const timerId = useRef<number | null>(null)
  const node = useRef<HTMLDivElement | null>(null)

  const showToast = ({ messages, icon, type = 'toast', duration }: P) => {
    const div = document.createElement('div')
    node.current = div
    const root = ReactDOM.createRoot(node.current);
    root.render(map[type](messages, icon));
    document.body.appendChild(div)
    if (!duration) return
    timerId.current = setTimeout(() => {
      timerId.current && clearTimeout(timerId.current)
      removeToast()
    }, duration)
  }

  const removeToast = () => {
    node.current && document.body.removeChild(node.current)
  }

  return {
    showToast, removeToast
  }
}