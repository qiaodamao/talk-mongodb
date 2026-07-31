import { useState, useRef, useEffect } from 'react'
import { X, Link as LinkIcon, Upload, Image } from 'lucide-react'
import { emojiMap, emojiKeys } from '@/lib/emojis'
import { messagesApi, uploadApi } from '@/lib/api'

interface Props {
  onSuccess: () => void
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}

function setCookie(name: string, value: string, days = 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}`
}

export default function MessageForm({ onSuccess }: Props) {
  const [username, setUsername] = useState(() => getCookie('msg_username') || '')
  const [content, setContent] = useState('')
  const [img, setImg] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showImagePanel, setShowImagePanel] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const imgBtnRef = useRef<HTMLButtonElement>(null)

  // 点击外部关闭浮窗
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showEmoji && !target.closest('.emoji-panel') && !target.closest('.emoji-trigger')) {
        setShowEmoji(false)
      }
      if (showImagePanel && !target.closest('.image-panel') && !target.closest('.image-trigger')) {
        setShowImagePanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmoji, showImagePanel])

  const autoResize = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }

  const insertEmoji = (key: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const newContent = content.slice(0, start) + key + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + key.length
      el.focus()
    }, 0)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.upload(file)
      if (res.success && res.data) {
        setImg(res.data.url)
      } else {
        alert('上传失败')
      }
    } catch (err: any) {
      alert(err.message || '上传失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleUrlSubmit = async () => {
    if (!imgUrl.trim()) return
    setUploading(true)
    try {
      const res = await uploadApi.remote(imgUrl.trim())
      if (res.success && res.data) {
        setImg(res.data.url)
        setImgUrl('')
      } else {
        alert('获取图片失败')
      }
    } catch (err: any) {
      alert(err.message || '获取图片失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const trimmedName = username.trim()
    const trimmedContent = content.trim()
    if (!trimmedName) { alert('请输入昵称'); return }
    if (!trimmedContent) { alert('请输入内容'); return }
    if (trimmedContent.length > 1000) { alert('内容不能超过1000字'); return }

    setSubmitting(true)
    try {
      setCookie('msg_username', trimmedName)
      await messagesApi.create({ username: trimmedName, content: trimmedContent, img: img || undefined })
      setContent('')
      setImg('')
      setShowEmoji(false)
      setShowImagePanel(false)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      onSuccess()
    } catch (err: any) {
      alert(err.message || '发送失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-pill shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 mb-4 relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => { setContent(e.target.value); autoResize() }}
        placeholder="写下你想说的，开始我们的对话"
        maxLength={1000}
        rows={5}
        className="w-full bg-transparent border-none outline-none resize-none text-text-main placeholder:text-muted"
        style={{ fontSize: '16px', fontWeight: 500, lineHeight: '1.6' }}
      />

      {/* Image preview */}
      {img && (
        <div className="mt-2 relative inline-block">
          <img src={img} alt="预览" className="h-20 rounded-card" />
          <button
            onClick={() => setImg('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Emoji floating panel */}
      {showEmoji && (
        <div className="emoji-panel absolute left-5 top-full mt-2 z-20 bg-white rounded-card shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-3 w-[340px] max-h-48 overflow-y-auto">
          <div className="grid grid-cols-10 gap-1">
            {emojiKeys.map((key) => (
              <button
                key={key}
                onClick={() => insertEmoji(key)}
                className="w-8 h-8 flex items-center justify-center hover:bg-reply-bg rounded transition-all duration-300"
                title={key}
              >
                <img src={emojiMap[key]} alt={key} className="w-7 h-7" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image floating panel (upload + URL combined) */}
      {showImagePanel && (
        <div className="image-panel absolute left-5 top-full mt-2 z-20 bg-white rounded-card shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-4 w-[320px]">
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-[#e5e5e5] rounded-card cursor-pointer hover:border-accent hover:bg-reply-bg transition-all duration-300"
          >
            <Upload size={24} className="text-muted mb-1" />
            <span className="text-sm text-muted">点击上传图片</span>
            <span className="text-xs text-text-light mt-0.5">支持 JPG / PNG / GIF / WebP，最大 2MB</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#e5e5e5]" />
            <span className="text-xs text-text-light">或</span>
            <div className="flex-1 h-px bg-[#e5e5e5]" />
          </div>

          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="输入图片链接"
              className="flex-1 px-3 py-2 text-sm rounded-pill bg-reply-bg outline-none border-none placeholder:text-muted"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={uploading}
              className="px-4 py-2 text-sm bg-primary text-white rounded-pill hover:bg-[#777] transition-all duration-300 disabled:opacity-50"
            >
              确定
            </button>
          </div>

          {uploading && <p className="text-xs text-muted mt-2 text-center">上传中...</p>}
        </div>
      )}

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            ref={emojiBtnRef}
            onClick={() => { setShowEmoji(!showEmoji); setShowImagePanel(false) }}
            className={`emoji-trigger p-1.5 rounded-full transition-all duration-300 ${showEmoji ? 'opacity-60' : 'hover:opacity-60'}`}
            title="加入表情"
          >
            <img src="/images/emoji.svg" alt="表情" className="w-[20px] h-[20px]" />
          </button>
          <button
            ref={imgBtnRef}
            onClick={() => { setShowImagePanel(!showImagePanel); setShowEmoji(false) }}
            className={`image-trigger p-1.5 rounded-full transition-all duration-300 ${showImagePanel ? 'opacity-60' : 'hover:opacity-60'}`}
            title="添加图片"
          >
            <img src="/images/icon_img.svg" alt="图片" className="w-[20px] h-[20px]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-input-bg rounded-pill" style={{ paddingLeft: '40px', backgroundImage: 'url(/images/user.svg)', backgroundRepeat: 'no-repeat', backgroundSize: '14px 16px', backgroundPosition: '18px center' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="你的昵称"
              maxLength={20}
              className="pr-3 py-2.5 text-sm bg-transparent outline-none w-24 placeholder:text-muted transition-all duration-300 focus:w-32"
              style={{ color: '#999' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white rounded-pill hover:bg-[#777] transition-all duration-300 disabled:opacity-50 font-bold w-16 sm:w-[100px]"
            style={{ height: '40px', fontSize: '14px' }}
          >
            {submitting ? '发送中' : '发 布'}
          </button>
        </div>
      </div>
    </div>
  )
}
