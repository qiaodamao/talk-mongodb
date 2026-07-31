import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Send, MapPin, Clock, Image as ImageIcon } from 'lucide-react'
import { type Message, messagesApi } from '@/lib/api'
import { replaceEmojis } from '@/lib/emojis'
import { useStore } from '@/store'
import ImagePreview from './ImagePreview'

interface Props {
  message: Message
  floor: number
  onRefresh: () => void
}

// 根据用户名生成稳定的头像编号 (1-7)
function getAvatarIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return (Math.abs(hash) % 7) + 1
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MessageCard({ message, floor, onRefresh }: Props) {
  const { token } = useStore()
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      const res = await messagesApi.reply(message.id, replyText.trim())
      if (res.success) {
        setReplyText('')
        setShowReply(false)
        onRefresh()
      } else {
        alert(res.error || '回复失败')
      }
    } catch {
      alert('回复失败')
    } finally {
      setReplying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这条留言吗？')) return
    setDeleting(true)
    try {
      const res = await messagesApi.delete(message.id)
      if (res.success) {
        onRefresh()
      } else {
        alert(res.error || '删除失败')
      }
    } catch {
      alert('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const avatarIndex = getAvatarIndex(message.username)

  return (
    <>
      <div className="message-card bg-white rounded-card pt-[25px] px-5 pb-[30px] hover:shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-300 relative">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar */}
          <div className="flex items-center gap-2 sm:w-[80px] sm:flex-shrink-0 sm:block">
            <div className="relative group">
              <img
                src={`/images/user_0${avatarIndex}.jpg`}
                alt={message.username}
                className="w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] rounded-full object-cover"
              />
              <Link
                to={`/?so=${encodeURIComponent(message.username)}`}
                className="absolute inset-0 w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span className="text-white text-xs">只看此人</span>
              </Link>
            </div>
            <Link
              to={`/?so=${encodeURIComponent(message.username)}`}
              className="text-sm text-muted hover:text-accent transition-all duration-300 sm:hidden"
            >
              {message.username}
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 mt-2 sm:mt-0">
            {/* Username + Content */}
            <div>
              <Link
                to={`/?so=${encodeURIComponent(message.username)}`}
                className="text-sm text-muted hover:text-accent transition-all duration-300 hidden sm:inline"
              >
                {message.username}
              </Link>
              <div
                className="mt-2 text-text-main whitespace-pre-wrap break-words"
                style={{ fontSize: '16px', lineHeight: '30px' }}
                dangerouslySetInnerHTML={{ __html: replaceEmojis(message.content) }}
              />
            </div>

            {/* Image */}
            {message.img && (
              <div className="mt-3">
                <button
                  onClick={() => setPreviewImg(message.img!)}
                  className="flex items-center gap-1 text-sm text-text-link hover:text-accent transition-all duration-300"
                >
                  <ImageIcon size={14} />
                  查看图片
                </button>
              </div>
            )}

            {/* Admin Reply */}
            {message.reply && (
              <div className="mt-3 bg-[#f5f5f5] rounded-[10px] p-3">
                <div className="flex items-start gap-2">
                  <img src="/images/reply_icon.svg" alt="" className="w-[14px] h-[14px] flex-shrink-0 opacity-25 mt-1.5" />
                  <div>
                    <span className="text-sm text-[#444c54] font-medium">新文艺：</span>
                    <span className="text-sm text-[#444c54]" dangerouslySetInnerHTML={{ __html: replaceEmojis(message.reply) }} />
                    {message.replytime && (
                      <span className="text-xs text-muted ml-2 hidden sm:inline">{formatTime(message.replytime)}</span>
                    )}
                  </div>
                </div>
                {message.replytime && (
                  <div className="text-xs text-muted sm:hidden mt-1 pl-[22px]">{formatTime(message.replytime)}</div>
                )}
              </div>
            )}

            {/* Reply textarea (admin only) */}
            {showReply && (
              <div className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="输入回复内容..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-page-bg rounded-[10px] focus:outline-none focus:border-accent bg-[#f5f5f5] resize-none placeholder:text-muted transition-all duration-300"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => setShowReply(false)} className="px-3 py-1 text-xs text-muted hover:text-text-main transition-all duration-300">取消</button>
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-white rounded-pill hover:bg-[#777] disabled:opacity-50 transition-all duration-300"
                  >
                    <Send size={12} />
                    {replying ? '回复中...' : '回复'}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center gap-3 text-sm text-muted" style={{ fontSize: '14px' }}>
              {message.dream && <span className="italic">{message.dream}</span>}
              {message.ipLocation && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={12} />
                  {message.ipLocation}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Clock size={12} />
                {formatTime(message.posttime)}
              </span>
              {token && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReply(!showReply)}
                    className="flex items-center gap-0.5 text-muted hover:text-accent transition-all duration-300"
                  >
                    回复
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-0.5 text-muted hover:text-red-500 transition-all duration-300"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floor number - bottom right */}
          <span
            className="text-[#f0f0f0] select-none font-sans absolute right-5 bottom-4"
            style={{ fontSize: '36px', lineHeight: '1' }}
          >
            {floor}
          </span>
        </div>
      </div>

      {/* Image preview overlay */}
      {previewImg && (
        <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />
      )}
    </>
  )
}
