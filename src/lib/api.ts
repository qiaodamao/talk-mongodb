export interface Message {
  id: string
  username: string
  content: string
  img: string | null
  ip: string | null
  ipLocation: string | null
  dream: string | null
  userImg: string | null
  reply: string | null
  replytime: string | null
  posttime: string
}

// 后端统一响应格式
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  // GET /api/messages 额外字段
  total?: number
  page?: number
  limit?: number
}

const BASE = '/api'

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const messagesApi = {
  // 后端返回: { success, data: Message[], total, page, limit }
  list: async (page = 1, limit = 50, so = ''): Promise<ApiResponse<Message[]>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (so) params.set('so', so)
    const res = await fetch(`${BASE}/messages?${params}`, { cache: 'no-store' })
    return res.json()
  },

  // 后端返回: { success, data: Message }
  create: async (data: { username: string; content: string; img?: string }): Promise<ApiResponse<Message>> => {
    const res = await fetch(`${BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '发送失败' }))
      throw new Error(err.error || '发送失败')
    }
    return res.json()
  },

  // 后端返回: { success }
  delete: async (id: string): Promise<ApiResponse> => {
    const res = await fetch(`${BASE}/messages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return res.json()
  },

  // 后端返回: { success, data: Message }
  reply: async (id: string, reply: string): Promise<ApiResponse<Message>> => {
    const res = await fetch(`${BASE}/messages/${id}/reply`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reply }),
    })
    return res.json()
  },
}

export const uploadApi = {
  // 后端返回: { success, data: { filename, url } }
  upload: async (file: File): Promise<ApiResponse<{ filename: string; url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '上传失败' }))
      throw new Error(err.error || '上传失败')
    }
    return res.json()
  },

  // 后端返回: { success, data: { filename, url } }
  remote: async (url: string): Promise<ApiResponse<{ filename: string; url: string }>> => {
    const res = await fetch(`${BASE}/upload/remote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '获取图片失败' }))
      throw new Error(err.error || '获取图片失败')
    }
    return res.json()
  },
}

export const authApi = {
  // 后端返回: { success, data: { token, username } }
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; username: string }>> => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '登录失败' }))
      throw new Error(err.error || '登录失败')
    }
    return res.json()
  },

  // 后端返回: { success, data: { username } }
  me: async (): Promise<ApiResponse<{ username: string }>> => {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: getHeaders(),
      cache: 'no-store',
    })
    return res.json()
  },

  // 修改密码 - 后端返回: { success, message }
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    const res = await fetch(`${BASE}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '修改失败' }))
      throw new Error(err.error || '修改失败')
    }
    return res.json()
  },
}
