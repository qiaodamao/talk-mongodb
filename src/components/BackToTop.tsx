import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top-enter fixed bottom-20 right-6 z-40 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      aria-label="回到顶部"
    >
      <img src="/images/up_2.svg" alt="回到顶部" className="w-[28px] h-[28px]" />
    </button>
  )
}
