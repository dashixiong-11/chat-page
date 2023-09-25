import { get, post } from '@/utils/server'
import { useEffect } from 'react'
import { useShowToast } from '@/hooks/useShowToast/useShowToast'
import './Home.scss'


function Home() {
  const { showToast } = useShowToast()
  const getChannel = async () => {
    const res = await post('/miniprogram/api/channels').catch(err => console.log(err))
    console.log(res);
  }

  useEffect(() => {
    getChannel()
  }, [])


  const onClick = () => {
    showToast({
      messages: 'message',
    })

  }

  return <div className="home">
    <button onClick={onClick}>连接ws</button>
    <button> 添加 频道</button>
  </div>
}

export default Home