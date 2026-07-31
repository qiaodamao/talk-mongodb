import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Yiyan from '@/pages/Yiyan'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/yiyan" element={<Yiyan />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-gray-400">404 - 页面不存在</div>} />
      </Routes>
    </Router>
  )
}
