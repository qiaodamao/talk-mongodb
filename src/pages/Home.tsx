import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Announcement from '@/components/Announcement'
import MessageForm from '@/components/MessageForm'
import MessageList from '@/components/MessageList'
import Sidebar from '@/components/Sidebar'
import BackToTop from '@/components/BackToTop'
import ChangePassword from '@/components/ChangePassword'
import { useStore } from '@/store'

const recommendLinks = ['哈哈', '文艺社区', '一言', '摄影', '手机壁纸']

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const so = searchParams.get('so') || ''
  const { token, clearAuth } = useStore()
  const [showChangePwd, setShowChangePwd] = useState(false)

  const handleChangePasswordSuccess = () => {
    setShowChangePwd(false)
    clearAuth()
    alert('密码修改成功，请使用新密码重新登录')
  }

  const handlePostSuccess = () => {
    window.dispatchEvent(new CustomEvent('message-posted'))
  }

  const handleSidebarSearch = (keyword: string) => {
    const params = new URLSearchParams()
    params.set('so', keyword)
    setSearchParams(params)
  }

  const handleClearSearch = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-[1600px] mx-auto px-6 pt-[72px] md:pt-[106px] pb-12 bg-[#FAFAFA]">
        <div className="mx-auto">
          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <MessageForm onSuccess={handlePostSuccess} />

              {/* Recommend links bar */}
              <div className="flex items-center gap-3 my-4 text-sm">
                <span className="text-muted">推荐:</span>
                {recommendLinks.map((link) => (
                  <button
                    key={link}
                    onClick={() => handleSidebarSearch(link)}
                    className="text-text-link hover:text-accent transition-all duration-300"
                  >
                    {link}
                  </button>
                ))}
              </div>

              <Announcement />
              <MessageList />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-[260px] flex-shrink-0 overflow-visible">
              <div className="sticky top-[106px] overflow-visible">
                <Sidebar
                  onSearch={handleSidebarSearch}
                  searchKeyword={so || undefined}
                  onClearSearch={handleClearSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <BackToTop />
      {showChangePwd && (
        <ChangePassword
          onClose={() => setShowChangePwd(false)}
          onSuccess={handleChangePasswordSuccess}
        />
      )}
      {/* Footer */}
      <footer className="py-8 text-center bg-[#FAFAFA]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-center gap-8 mb-3">
            <a href="https://shijuefuhao.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-all duration-300">关于</a>
            <a href="https://talk.shijuefuhao.com/yiyan" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-all duration-300">一言</a>
            <a href="#" className="text-sm text-muted hover:text-accent transition-all duration-300">联系</a>
            {token ? (
              <>
                <button onClick={() => setShowChangePwd(true)} className="text-sm text-muted hover:text-accent transition-all duration-300">修改密码</button>
                <button onClick={clearAuth} className="text-sm text-muted hover:text-accent transition-all duration-300">退出管理</button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-muted hover:text-accent transition-all duration-300">管理</Link>
            )}
          </div>
          <p className="text-xs text-text-light">Copyright © 视觉符号. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
