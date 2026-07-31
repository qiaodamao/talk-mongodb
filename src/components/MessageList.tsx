import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { messagesApi, type Message } from '@/lib/api'
import MessageCard from './MessageCard'

export default function MessageList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page')) || 1
  const so = searchParams.get('so') || ''
  const limit = 10
  const totalPages = Math.ceil(total / limit)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await messagesApi.list(page, limit, so)
      if (res.success) {
        setMessages(Array.isArray(res.data) ? res.data : [])
        setTotal(res.total || 0)
      }
    } catch {
      // 静默处理
    } finally {
      setLoading(false)
    }
  }, [page, so])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    const handler = () => fetchMessages()
    window.addEventListener('message-posted', handler)
    return () => window.removeEventListener('message-posted', handler)
  }, [fetchMessages])

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams)
    if (p > 1) params.set('page', String(p))
    else params.delete('page')
    setSearchParams(params)
  }

  const floorOffset = total - (page - 1) * limit

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-4">
      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-card shadow-card p-5 animate-pulse">
              <div className="flex">
                <div className="w-[108px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      {!loading && (
        <>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              {so ? '没有找到相关留言' : '还没有留言，来写下第一条吧'}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  floor={floorOffset - idx}
                  onRefresh={fetchMessages}
                />
              ))}
            </div>
          )}

          {/* Pagination - pill shaped */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4 flex-wrap">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-page-bg rounded-pill hover:bg-[#2a2b2c] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-page-bg disabled:hover:text-text-main transition-all duration-300"
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map((p, i) =>
                typeof p === 'string' ? (
                  <span key={`dots-${i}`} className="px-2 text-muted text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[36px] h-[36px] text-sm rounded-pill transition-all duration-300 ${
                      p === page
                        ? 'bg-accent text-accent-light'
                        : 'bg-page-bg hover:bg-[#2a2b2c] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-page-bg rounded-pill hover:bg-[#2a2b2c] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-page-bg disabled:hover:text-text-main transition-all duration-300"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
