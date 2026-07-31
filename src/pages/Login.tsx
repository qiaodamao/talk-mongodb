import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useStore } from '@/store'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    try {
      const result = await authApi.login(username, password)
      if (result.success && result.data) {
        setAuth(result.data.token, result.data.username)
        navigate('/')
      } else {
        setError('登录失败')
      }
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col px-4">
      <Link to="/" className="inline-block mt-6 ml-6 hover:opacity-70 transition-all duration-300">
        <img src="/images/logo.svg" alt="新文艺" className="h-[40px] w-auto" />
      </Link>
      <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main" style={{ fontFamily: '"BrandonText-Black", "PingFang SC", sans-serif' }}>
            互动客厅管理
          </h1>
          <p className="text-sm text-muted mt-2">新文艺 · 理想生活杂志</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-pill p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-input-bg outline-none text-sm placeholder:text-muted transition-all duration-300"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-input-bg outline-none text-sm placeholder:text-muted transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-pill text-sm font-medium hover:bg-[#777] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}
