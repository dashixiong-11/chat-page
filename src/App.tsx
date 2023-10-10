import { Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Channels from './pages/Channels/Channels';
import ErrorPage from './pages/Error/Error';
import './App.css'

function App() {
  localStorage.setItem('connection_status', 'file')

  return (
    <>
      <Routes>
        <Route path="/" element={<Channels />} />
        <Route path="/home" element={<Home />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  )
}

export default App
