export default function Announcement() {
  return (
    <div className="message-card bg-white rounded-card pt-[25px] px-5 pb-[30px] mb-4 relative">
      <div className="flex flex-col sm:flex-row">
        {/* Avatar */}
        <div className="flex items-center gap-2 sm:w-[80px] sm:flex-shrink-0 sm:block">
          <img
            src="/images/g.jpg"
            alt="管理员"
            className="w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] rounded-full object-cover"
          />
          <span className="font-bold text-text-main sm:hidden" style={{ fontSize: '16px' }}>公告:</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-bold text-text-main hidden sm:inline" style={{ fontSize: '16px' }}>公告:</span>
              <span className="text-text-main sm:ml-1" style={{ fontSize: '16px', lineHeight: '30px' }}>
                心有山海，静而无边。 WeChat：
                <span className="text-[#0f9960]">nb003521</span>
              </span>
            </div>
            <span
              className="text-[#f0f0f0] select-none font-sans flex-shrink-0 ml-2 hidden sm:block"
              style={{ fontSize: '36px', lineHeight: '1' }}
            >
              置顶
            </span>
          </div>
          <span className="text-sm text-muted mt-1 inline-block">视觉符号</span>
        </div>
      </div>
    </div>
  )
}
