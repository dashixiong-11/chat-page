import { Routes, Route } from "react-router-dom";
import Index from './pages/Index/Index';
import Chat from './pages/Chat/Chat';
import Channels from './pages/Channels/Channels';
import History from './pages/History/History';
import ErrorPage from './pages/Error/Error';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import './App.css'

function App() {
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
      initializeWs(token)
      navigate('/channels', { replace: true })
    }
  }, [])


  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/index" element={<Index />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/history" element={<History />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  )
}

export default App
