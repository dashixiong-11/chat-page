import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from 'react-router-dom';
import './Index.scss'


function Index() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || localStorage.getItem('token') || ''
  const id = params.get('id') || localStorage.getItem('id') || ''
  const channelId = params.get('channel_id') || localStorage.getItem('channel_id') || ''
  localStorage.setItem('token', token)
  localStorage.setItem('id', id)
  localStorage.setItem('channel_id', channelId)
  const { client } = useSocket()
  useEffect(() => {

    if (token && client) {
      client.setToken(token)
      client.connect()
      navigate('/channels')
    }
  }, [client])


  return <div className="home">
  </div>
}

export default Index