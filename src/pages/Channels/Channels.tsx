import { post, get } from '@/utils/server'
import { useNavigate } from 'react-router-dom';
import right from '@/assets/icons/right.svg'
import plus from '@/assets/icons/plus.svg'
import { useEffect, useState, } from 'react'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import './Channels.scss'


const ChannelItem = ({ item, cb }: { item: Item, cb: () => void }) => {
  const [height, setHeight] = useState<string | number>(0)


  const { show } = useAddChannel({
    cb: cb,
  })

  const navigate = useNavigate()
  const to = (channel: Channel) => {
    const { name, cn_name } = channel
    const { workDir } = channel.chan_info
    navigate(`/chat?channel_name=${name}&cn_name=${cn_name}` + (workDir ? `&workDir=${workDir}` : ''))
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
            {item.children.map(cItem => <ChannelItem cb={cb} key={cItem.id + cItem.name} item={cItem} />)}
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
  const channelId = localStorage.getItem('channel_id')
  const [channel, setChannel] = useState<Item | undefined>(undefined)
  const getChannel = async () => {
    if (!channelId) return
    const res = await get<Item>('/miniprogram/api/channel' + `/${channelId}`).catch(err => { throw new Error(err) })
    console.log(res);
    if (res.code === 0 && res.data) {
      const result = res.data
      setChannel(result)
      document.title = result ? result.name : '频道列表';
    }
  }





  useEffect(() => {
    (async () => {
      await getChannel()
    })()
  }, [])


  return <div className="channels">
    {/* <div className="add-channel-nav">
      <div className='add-btn' onClick={onAddChannel}>
        <img src={add_fill} alt="" />
        <span> 新增频道 </span>
      </div>
    </div> */}
    <div className="channel-list">
      {channel && <ChannelItem cb={getChannel} item={channel} />}
    </div>
  </div>
}

export default Channels