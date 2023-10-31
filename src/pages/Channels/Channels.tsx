import { get } from '@/utils/server'
import { useNavigate } from 'react-router-dom';
import right from '@/assets/icons/right.svg'
import plus from '@/assets/icons/plus.svg'
import add_fill from '@/assets/icons/add_fill.svg'
import { useEffect, useState, useLayoutEffect } from 'react'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import { useStore } from '@/hooks/useStore';
import './Channels.scss'


const ChannelItem = ({ item, cb, show }: { item: Item, cb: (name: string, fn: () => void) => void, show: (item: Item) => void }) => {
  const [height, setHeight] = useState<string | number>(0)

  const navigate = useNavigate()
  const to = (channel: Channel) => {
    const { name, cn_name } = channel
    document.title = cn_name;
    const { workDir } = channel.chan_info
    cb(name, () => {
      navigate(`/chat?channel_name=${name}&cn_name=${cn_name}` + (workDir ? `&workDir=${workDir}` : ''))
    })
  }

  const drawerTrigger = () => {
    setHeight(height === 0 ? '1000px' : 0)
  }

  return <>
    <div className='channel' >
      <div className="channel-name" >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }} onClick={drawerTrigger}>
          <img src={right} alt="" style={{ transform: `rotate(${height === 0 ? '0' : '90deg'})` }} />
          {item.name}
        </div>
        {item.is_creatable &&
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1em' }} onClick={() => show(item)} >
            <img style={{ marginLeft: 'auto', width: '1.3em' }} src={plus} alt="" />
            <span>添加频道</span>
          </div>
        }
      </div>
      <div className='channel-drawer' style={{ maxHeight: height }} >
        {item.children && item.children.length > 0 &&
          <div className='channel-child'>
            {item.children.map(cItem => <ChannelItem cb={cb} show={show} key={cItem.id + cItem.name} item={cItem} />)}
          </div>
        }
        {item.channels && item.channels.length > 0 && item.channels.map((channelItem, channelIndex) =>
          <div className="channel-item" onClick={() => to(channelItem)} key={channelIndex + 'channels'}>
            {channelItem.cn_name}
          </div>
        )}
      </div>
    </div >
  </>
}

function Channels() {
  const { initializeSub } = useStore()
  const channelId = localStorage.getItem('channel_id')
  const [channel, setChannel] = useState<Item | undefined>(undefined)
  const navigate = useNavigate()
  const getChannel = async () => {
    if (!channelId) return
    const res = await get<Item, any>('/miniprogram/api/channel' + `/${channelId}`).catch(err => { throw new Error(err) })
    console.log(res);
    if (res.code === 0 && res.data) {
      const result = res.data
      setChannel(result)
    }
  }
  const { show } = useAddChannel({
    cb: getChannel,
  })

  useLayoutEffect(() => {
    if ((!channel?.children || channel.children.length === 0) && channel?.channels && channel.channels.length === 1) {
      const channelItem = channel.channels[0]
      const { workDir } = channelItem.chan_info
      initializeSub(channelItem.name)
      navigate(`/chat?channel_name=${channelItem.name}&cn_name=${channelItem.cn_name}` + (workDir ? `&workDir=${workDir}` : ''), { replace: true })
    }

  }, [channel])



  const to = (channel: Channel) => {
    const { name, cn_name } = channel
    document.title = cn_name;
    const { workDir } = channel.chan_info
    initializeSub(name)
    const id = setTimeout(() => {
      clearTimeout(id)
      navigate(`/chat?channel_name=${name}&cn_name=${cn_name}` + (workDir ? `&workDir=${workDir}` : ''))
    }, 500)
  }

  useEffect(() => {
    (async () => {
      document.title = '频道列表';
      await getChannel()
    })()
  }, [])


  return <div className="channels">
    <div className="add-channel-nav">
      <div className='add-btn' onClick={() => channel && show(channel)}>
        <img src={add_fill} alt="" />
        <span> 新增频道 </span>
      </div>
    </div>
    <div className="channel-list">
      {channel &&
        <div className='channel' >
          <div className='channel-drawer' >
            {channel.children && channel.children.length > 0 &&
              <div className='channel-child'>
                {channel.children.map((cItem, index) => <ChannelItem key={index} cb={initializeSub} show={show} item={cItem} />)}
              </div>
            }
            {channel.channels && channel.channels.length > 0 && channel.channels.map((channelItem, channelIndex) =>
              <div className="channel-item" onClick={() => to(channelItem)} key={channelIndex + 'channels'}>
                {channelItem.cn_name}
              </div>
            )}
          </div>
        </div >
      }
    </div>
  </div>
}

export default Channels