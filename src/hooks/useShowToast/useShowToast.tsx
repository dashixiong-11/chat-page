import { ReactElement, useRef } from 'react'
import usePortal from '../usePortal/usePortal'


import './useShowToast.scss'
type P = {
  messages?: string | null,
  icon?: string | null,
  type?: 'toast' | 'message',
  duration?: number
}

const map = {
  toast: (message: string | null | undefined, icon: string | null | undefined): ReactElement<HTMLElement> => <div className="toast">
    {icon && icon}
    <div className="content">{message}</div>
  </div>,
  message: (message?: string | null | undefined): ReactElement<HTMLElement> => <div className='message'>
    <span className="content">{message}</span>
  </div>

}
export const useShowToast = () => {
  const timerId = useRef<number | null>(null)
  const { portal, remove } = usePortal()

  const showToast = ({ messages, icon = null, type = 'toast', duration }: P) => {
    portal(map[type](messages, icon))
    if (!duration) return
    timerId.current = setTimeout(() => {
      timerId.current && clearTimeout(timerId.current)
      remove()
    }, duration) as unknown as number
  }

  return {
    showToast, removeToast: remove
  }
}