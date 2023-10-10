import { ReactElement, useCallback, useRef, Profiler } from 'react';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom/client';
import './usePortal.scss';

function usePortal() {
  const node = useRef<HTMLElement | null>(null);
  const rootRef = useRef<any | null>(null);  // 使用 useRef 来保存 root


  const portal = (child: ReactElement<HTMLElement> | null, mask?: ReactElement<HTMLElement> | null) => {
    const div = document.createElement('div');
    node.current = div;
    const root = ReactDOM.createRoot(node.current);
    rootRef.current = root;  // 保存 root 到 rootRef

    root.render(createPortal(
        <>
          {mask || <div className='protal-mask' />}
          <div className='protal-wrapper'>{child}</div>
        </>
      , document.body
    ))

    // root.render(
    //   <Profiler id="PortalContent" onRender={handleRender}>
    //     <>
    //       {mask || <div className='protal-mask' />}
    //       <div className='protal-wrapper'>{child}</div>
    //     </>
    //   </Profiler>
    // );
   //  document.body.appendChild(div);
  }

  const remove = () => {
    if (node.current) {
      rootRef.current?.unmount();  // 使用 root 的 unmount 方法
     // document.body.removeChild(node.current);
    }
  }

  return { portal, remove };
}

export default usePortal;