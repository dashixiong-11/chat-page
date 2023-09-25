import { ReactElement, useRef } from 'react'
import useProtal from '../useProtal/useProtal'


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
  const {protal,remove} = useProtal()

  const showToast = ({ messages, icon, type = 'toast', duration }: P) => {
    protal(map[type](messages, icon))
    if (!duration) return
    timerId.current = setTimeout(() => {
      timerId.current && clearTimeout(timerId.current)
      remove()
    }, duration)
  }


  return {
    showToast, removeToast: remove
  }
}