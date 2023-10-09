import { post } from '@/utils/server'
import { useSocket } from '@/hooks/useSocket'
import add_fill from '@/assets/icons/add_fill.svg'
import { useEffect, TouchEventHandler, useState } from 'react'
import { useShowToast } from '@/hooks/useShowToast/useShowToast'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import './Channels.scss'


function Channels() {
  const { show } = useAddChannel(() => {
    getChannel()
  })
  const { showToast } = useShowToast()

  const getChannel = async () => {
    const res = await post('/miniprogram/api/channels').catch(err => { throw new Error(err) })
    console.log(res);
  }


  const onAddChannel = () => {
    show()
  }

  useEffect(() => {
    getChannel()
  }, [])

  return <div className="channels">
    <div className="add-channel-nav">
      <div className='add-btn' onClick={onAddChannel}>
        <img src={add_fill} alt="" />
        <span> 新增频道 </span>
      </div>
    </div>
    <ul className="channel-list">
      <li> 频道 1</li>
    </ul>
  </div>
}

export default Channels