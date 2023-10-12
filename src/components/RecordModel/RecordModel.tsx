import { createPortal } from 'react-dom';

export function RecordModel(){

    return createPortal(
      <>
         <div className='protal-mask' />
        <div className='protal-wrapper'>{}</div>
      </>
      , document.body
    )
}