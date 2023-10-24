import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import './Index.scss'
import { useStore } from '@/hooks/useStore';


function Index() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || localStorage.getItem('token') || ''
  const id = params.get('id') || localStorage.getItem('id') || ''
  const channelId = params.get('channel_id') || localStorage.getItem('channel_id') || ''
  localStorage.setItem('token', token)
  localStorage.setItem('id', id)
  localStorage.setItem('channel_id', channelId)
  const { initializeWs } = useStore()
  useEffect(() => {
    if (token) {
      initializeWs(token, () => {
        navigate('/channels')
      })
    }
  }, [])


  return <> </>
}

export default Index