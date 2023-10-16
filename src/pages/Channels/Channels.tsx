import { post } from '@/utils/server'
import { useNavigate } from 'react-router-dom';
import add_fill from '@/assets/icons/add_fill.svg'
import more from '@/assets/icons/more.svg'
import right from '@/assets/icons/right.svg'
import { useEffect, useState, } from 'react'
import { useAddChannel, CategoryListType } from '@/hooks/useAddChannel/useAddChannel'
import './Channels.scss'

type Channel = { cn_name: string, name: string, chan_info: { type: string, workDir?: string }, }
type Item = { id: number, name: string, description: string, channels: Channel[], children: Item[] }

const ListItem = ({ item }: { item: Item }) => {
  const [height, setHeight] = useState<string | number>(0)

  const navigate = useNavigate()
  const to = (item: Channel) => {
    const { name, cn_name } = item
    const { workDir } = item.chan_info
    navigate(`/chat?channel_name=${name}&cn_name=${cn_name}` + (workDir ? `&workDir=${workDir}` : ''))
  }

  const drawerTrigger = () => {
    if (!item.channels && !item.children) return
    setHeight(height === 0 ? '1000px' : 0)
  }

  return <>
    <div className='item' key={item.name}>
      <div className='item-inner' onClick={drawerTrigger}>
        <div className='name' style={{ flex: 1 }}>
          {item.name}
        </div>
        {(item.children?.length > 0 || item.channels?.length > 0) &&
          <img className='icon-right' src={right} alt="" style={{ transform: `rotate(${height === 0 ? 0 : 90}deg)` }} />
        }
      </div>
      <div className='drawer' style={{ maxHeight: height }} >
        {item.children && item.children.length > 0 && item.children.map(ci => <ListItem key={ci.name} item={ci} />)}
        {item.channels && item.channels.length > 0 && item.channels.map((channelItem, channelIndex) =>
          <div className="channel" onClick={() => to(channelItem)} key={channelIndex+'channels'}>
            {channelItem.cn_name}
          </div>
        )}
      </div>

    </div>
  </>
}

function Channels() {
  const [categoryList, setCategoryList] = useState<CategoryListType>([])
  const navigate = useNavigate()
  const [list, setList] = useState<Item[]>([])
  const getChannel = async () => {
    const res = await post('/miniprogram/api/category-list').catch(err => { throw new Error(err) })
    console.log(res);
    if (res.code === 0 && res.data && res.data.results) {
      setList(res.data?.results)
    }
  }
  const { show } = useAddChannel({
    cb: getChannel,
    categoryList: categoryList
  })



  const getCategory = async () => {
    const res = await post('/miniprogram/public/statuses', { "keys": ["channel_category"] }).catch(err => { throw new Error(err) })
    console.log(res);
    if (res.code === 0 && res.data) {
      const list = res.data.statuses?.channel_category
      list && setCategoryList(list)
    }
  }


  const onAddChannel = () => {
    show()
  }

  useEffect(() => {
    document.title = '频道列表';
    (async () => {
      await getCategory()
      await getChannel()
    })()
  }, [])



  const to = (item: Channel) => {
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
    <div className="channel-list">
      {list && list.length > 0 && list.map(item => <ListItem key={item.name} item={item} />)}
    </div>
  </div>
}

export default Channels