import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from 'react-router-dom';
import './Index.scss'


function Index() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tk = params.get('token') || ''
  const [token] = useState<string | null>(() => {
    return tk || localStorage.getItem('token')
  })
  const { client } = useSocket()

  useEffect(() => {
    if (token && client) {
      client.setToken(token)
      client.connect()
      navigate('/channel')
    }
  }, [token, client])


  return <div className="home">
  </div>
}

export default Index