import { useState } from 'react'
import { Lock, X } from 'lucide-react'
import { authApi } from '@/lib/api'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function ChangePassword({ onClose, onSuccess }: Props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段')
      return
    }

    if (newPassword.length < 6) {
      setError('新密码长度不能少于6位')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    if (oldPassword === newPassword) {
      setError('新密码不能与旧密码相同')
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword(oldPassword, newPassword)
      onSuccess()
    } catch (err: any) {
      setError(err.message || '修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white rounded-pill p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text-main transition-all duration-300"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-text-main" style={{ fontFamily: '"BrandonText-Black", "PingFang SC", sans-serif' }}>
            修改密码
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="当前密码"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-input-bg outline-none text-sm placeholder:text-muted transition-all duration-300"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新密码（至少6位）"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-input-bg outline-none text-sm placeholder:text-muted transition-all duration-300"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认新密码"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-input-bg outline-none text-sm placeholder:text-muted transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-pill text-sm font-medium hover:bg-[#777] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </form>
      </div>
    </div>
  )
}
