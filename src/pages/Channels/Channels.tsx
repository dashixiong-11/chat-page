import { post } from '@/utils/server'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket'
import add_fill from '@/assets/icons/add_fill.svg'
import more from '@/assets/icons/more.svg'
import { useCallback, useEffect, useState, } from 'react'
import { useAddChannel } from '@/hooks/useAddChannel/useAddChannel'
import './Channels.scss'

type ListItem = { cn_name: string, name: string, chan_info: { type: string, workDir?: string }, }
type ListType = ListItem[]
function Channels() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const { client } = useSocket()
  const [list, setList] = useState<ListType>([])
  const getChannel = async () => {
    const res = await post('/miniprogram/api/channels').catch(err => { throw new Error(err) })
    if (res.code === 0 && res.data) {
      setList(res.data?.channels)
    }
  }
  const { show } = useAddChannel(getChannel)


  const onAddChannel = () => {
    show()
  }

  useEffect(() => {
    document.title = '频道列表';

    getChannel()
  }, [])

 useEffect(() => {
    
    if (token && client) {
      client?.setToken(token)
      client?.connect()
    }
  },[token,client])



  const to = (item: ListItem) => {
    const { name, cn_name } = item
    const { workDir } = item.chan_info
    navigate(`/chat?channel_name=${name}&cn_name=${cn_name}` + (workDir ? `&workDir=${workDir}` : ''))
  }

  return <div className="channels">
    <div className="add-channel-nav">
      <div className='add-btn' onClick={onAddChannel}>
        <img src={add_fill} alt="" />
        <span> 新增频道 </span>
      </div>
    </div>
    <ul className="channel-list">
      {list && list.length > 0 &&
        list.map((item, index) => <li className='item' key={index}>
          <div className='item-inner'>
            <div className='name' onClick={() => to(item)} style={{ flex: 1 }}>
              {item.cn_name}
            </div>
            <img className='icon-more' src={more} alt="" />
          </div>
        </li>)
      }
    </ul>
  </div>
}

export default Channels