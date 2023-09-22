import {  Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import ErrorPage from './pages/Error/Error';
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  )
}

export default App
