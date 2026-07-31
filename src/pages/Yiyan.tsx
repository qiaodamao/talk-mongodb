import { useState, useEffect, useCallback } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import Navbar from '@/components/Navbar'

const typeMap: Record<string, string> = {
  a: '动画', b: '漫画', c: '游戏', d: '文学', e: '原创',
  f: '来自网络', g: '其他', h: '影视', i: '网易云',
  j: '哲学', k: '诗词', l: '抖机灵',
}

interface HitokotoData {
  hitokoto: string
  from: string
  from_who: string
  type: string
}

export default function Yiyan() {
  const [data, setData] = useState<HitokotoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchHitokoto = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('https://v1.hitokoto.cn/?t=' + Date.now())
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHitokoto() }, [fetchHitokoto])

  const handleCopy = async () => {
    if (!data) return
    const text = data.from ? `${data.hitokoto} —— 「${data.from}」` : data.hitokoto
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-pill p-12 text-center">
            {loading ? (
              <div className="py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : data ? (
              <>
                <div className="inline-block px-4 py-1.5 bg-reply-bg rounded-pill text-xs text-muted mb-8">
                  {typeMap[data.type] || '其他'}
                </div>
                <p className="text-2xl md:text-3xl leading-relaxed text-text-main mb-8 min-h-[80px] flex items-center justify-center" style={{ fontWeight: 500 }}>
                  {data.hitokoto}
                </p>
                {(data.from || data.from_who) && (
                  <p className="text-sm text-muted italic mb-8">
                    —— {data.from ? `「${data.from}」` : data.from_who}
                  </p>
                )}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-pill text-sm hover:bg-[#777] transition-all duration-300"
                  >
                    <Copy size={16} />
                    {copied ? '已复制' : '复制句子'}
                  </button>
                  <button
                    onClick={fetchHitokoto}
                    className="flex items-center gap-2 px-6 py-2.5 bg-page-bg text-text-main rounded-pill text-sm hover:bg-[#2a2b2c] hover:text-white transition-all duration-300"
                  >
                    <RefreshCw size={16} />
                    换一句
                  </button>
                </div>
              </>
            ) : (
              <p className="text-muted py-12">获取失败，请重试</p>
            )}
          </div>
          <p className="text-center text-xs text-text-light mt-6">
            基于 <a href="https://hitokoto.cn" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-all duration-300">Hitokoto</a> API
          </p>
        </div>
      </div>
    </div>
  )
}
