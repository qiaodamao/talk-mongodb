// Emoji 映射表：key -> GIF 图片路径（与原版一致）
export const emojiMap: Record<string, string> = {
  '[微笑]': '/images/bq/wx.gif',
  '[晕]': '/images/bq/y.gif',
  '[心花怒放]': '/images/bq/xhnf.gif',
  '[鼓掌]': '/images/bq/gz.gif',
  '[哈欠]': '/images/bq/hax.gif',
  '[憨笑]': '/images/bq/sx.gif',
  '[汗]': '/images/bq/han.gif',
  '[吃惊]': '/images/bq/cj.gif',
  '[鄙视]': '/images/bq/bs.gif',
  '[闭嘴]': '/images/bq/bz.gif',
  '[呲牙]': '/images/bq/cy.gif',
  '[害羞]': '/images/bq/hx.gif',
  '[衰]': '/images/bq/shuai.gif',
  '[偷笑]': '/images/bq/tx.gif',
  '[折磨]': '/images/bq/zm.gif',
  '[难过]': '/images/bq/ng.gif',
  '[示爱]': '/images/bq/sa.gif',
  '[可爱]': '/images/bq/ka.gif',
  '[泪]': '/images/bq/lei.gif',
  '[酷]': '/images/bq/cool.gif',
  '[发呆]': '/images/bq/fd.gif',
  '[强]': '/images/bq/qiang.gif',
  '[敲打]': '/images/bq/qd.gif',
  '[再见]': '/images/bq/zj.gif',
}

// 所有 emoji key 列表，用于 emoji 选择器
export const emojiKeys = Object.keys(emojiMap)

const EMOJI_STYLE = 'display:inline-block;height:18px;margin-bottom:-3px;margin-left:2px;margin-right:2px;vertical-align:middle;'

// 将单个 emoji 标记替换为 <img> 标签
function emojiToImg(match: string): string {
  const src = emojiMap[match]
  if (src) {
    return `<img src="${src}" alt="${match}" style="${EMOJI_STYLE}" />`
  }
  return match
}

// 将文本中的 emoji 标记替换为 <img> 标签
// 连续的多个 emoji（中间可能有空白/换行）会用 nowrap 的 span 包裹，确保横向排列
export function replaceEmojis(text: string): string {
  // 匹配连续的 emoji 序列（中间允许空白/换行）
  return text.replace(/(\[[^\]]+\])(\s*\[[^\]]+\])*/g, (sequence) => {
    // 把序列里的空白去掉，每个 emoji 替换成 img
    const imgs = sequence.replace(/\s+/g, '').replace(/\[[^\]]+\]/g, emojiToImg)
    // 用 nowrap span 包裹，防止父容器的 whitespace-pre-wrap 导致换行
    return `<span style="display:inline-block;white-space:nowrap;">${imgs}</span>`
  })
}
