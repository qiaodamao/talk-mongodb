import { useState, useRef, useEffect } from 'react'
import { Search, X, QrCode, Heart } from 'lucide-react'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
}

function getGreetingEn(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Late Night'
  if (h < 9) return 'Good Morning'
  if (h < 12) return 'Good Morning'
  if (h < 14) return 'Good Afternoon'
  if (h < 18) return 'Good Afternoon'
  if (h < 22) return 'Good Evening'
  return 'Late Night'
}

function getUsername(): string {
  const match = document.cookie.match(/msg_username=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : '访客'
}

const hotTags = ['哈哈', '文艺社区', '一言', '摄影', '手机壁纸', '设计分享']

interface Props {
  onSearch?: (keyword: string) => void
  searchKeyword?: string
  searchCount?: number
  onClearSearch?: () => void
}

export default function Sidebar({ onSearch, searchKeyword, searchCount, onClearSearch }: Props) {
  const greeting = getGreeting()
  const greetingEn = getGreetingEn()
  const username = getUsername()
  const [searchInput, setSearchInput] = useState('')
  const [showDashang, setShowDashang] = useState(false)
  const dashangRef = useRef<HTMLDivElement>(null)
  const [dashangPos, setDashangPos] = useState({ top: 0, left: 0 })

  const handleSearch = () => {
    if (searchInput.trim() && onSearch) {
      onSearch(searchInput.trim())
    }
  }

  return (
    <aside className="space-y-4 overflow-visible">
      {/* Greeting card */}
      <div className="bg-white rounded-card p-5">
        <h3
          className="text-lg font-bold text-text-main mb-1"
          style={{ fontFamily: '"BrandonText-Black", "PingFang SC", sans-serif' }}
        >
          {greetingEn}
        </h3>
        <p className="text-sm text-text-main">
          {greeting}，<span className="font-medium">{username}</span>
        </p>
        <p className="text-sm text-muted mt-1">欢迎你来到互动客厅，现在来与我对话吧。</p>
        <p className="text-sm text-muted mt-1">乔同学 😉</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-pill flex items-center px-4 py-3">
        <Search size={16} className="text-muted flex-shrink-0" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索留言..."
          className="flex-1 ml-2 text-sm bg-transparent outline-none placeholder:text-muted"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="text-muted hover:text-text-main transition-all duration-300">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search result indicator */}
      {searchKeyword && (
        <div className="bg-white rounded-card p-3 flex items-center justify-between">
          <span className="text-sm text-text-main">
            搜索: <span className="font-medium">{searchKeyword}</span>
            {searchCount !== undefined && <span className="text-muted ml-1">({searchCount}条)</span>}
          </span>
          {onClearSearch && (
            <button onClick={onClearSearch} className="text-muted hover:text-accent transition-all duration-300">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Hot keywords */}
      <div className="bg-white rounded-card p-4">
        <h3 className="text-sm font-medium text-text-main mb-3">热搜</h3>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag) => (
            <span
              key={tag}
              onClick={() => onSearch?.(tag)}
              className="px-3 py-1.5 text-xs text-text-link bg-white shadow-tag rounded-pill hover:bg-[#555] hover:text-white cursor-pointer transition-all duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* WeChat section */}
      <div className="bg-white rounded-card overflow-hidden">
        <div className="px-4 py-2.5 text-sm font-bold text-text-main rounded-t-card">关注乔同学微信公众号</div>
        <div className="p-4 flex flex-col items-center">
          <img src="/images/wechat_wk.svg" alt="微信二维码" className="w-[170px] h-[170px]" />
          <p className="text-xs text-muted mt-2 flex items-center gap-1">
            <img src="/images/wechat_logo.svg" alt="" className="w-[18px] h-[18px]" />
            搜索公众号：乔同学
          </p>
        </div>
      </div>

      {/* Mini program section */}
      <div className="bg-white rounded-card overflow-hidden">
        <div className="px-4 py-2.5 text-sm font-bold text-text-main rounded-t-card">
          推荐小程序
        </div>
        <div className="p-4 flex flex-col items-center">
          <img src="/images/wechat_xcx.svg" alt="小程序二维码" className="w-[170px] h-[170px]" />
          <p className="text-xs text-muted mt-2 flex items-center gap-1">
            <img src="/images/xcx_logo.svg" alt="" className="w-[18px] h-[18px]" />
            搜索小程序：小酷壁纸
          </p>
        </div>
      </div>

      {/* Dashang (tip) section */}
      <div
        ref={dashangRef}
        className="bg-white rounded-card p-4 relative"
        onMouseEnter={() => {
          if (dashangRef.current) {
            const rect = dashangRef.current.getBoundingClientRect()
            setDashangPos({
              top: rect.top - 220,
              left: rect.left + rect.width / 2 - 100,
            })
          }
          setShowDashang(true)
        }}
        onMouseLeave={() => setShowDashang(false)}
      >
        <div className="flex items-center justify-center gap-2 cursor-pointer">
          <img src="/images/dashang.png" alt="" className="w-[29px] h-[24px]" />
          <span className="text-sm font-medium text-text-main">感谢赞赏！</span>
        </div>
        {showDashang && (
          <div
            className="fixed z-[100] bg-white rounded-lg p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            style={{ top: dashangPos.top, left: dashangPos.left }}
          >
            <img src="/images/code2.jpg" alt="赞赏码" className="w-[200px] h-[200px] rounded-lg" />
          </div>
        )}
      </div>
    </aside>
  )
}
