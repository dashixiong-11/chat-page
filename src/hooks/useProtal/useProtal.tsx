
import { ReactElement, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import './useProtal.scss'

function useProtal() {
  const node = useRef<HTMLElement | null>(null)
  const protal = (child: ReactElement<HTMLElement> | null) => {
    const div = document.createElement('div')
    node.current = div
    const root = ReactDOM.createRoot(node.current);
    root.render(<><div className='protal-mask' /> <div className='protal-wrapper'>{child}</div> </>);
    document.body.appendChild(div)
  }
  const remove = () => {
    node.current && document.body.removeChild(node.current)
  }
  return { protal, remove }
}

export default useProtal