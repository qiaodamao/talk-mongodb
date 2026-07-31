/**
 * DELETE /api/upload/[filename] - 删除 COS 上的图片
 */
import { json, requireAuth } from '../../_lib.js'
import { deleteFromCos } from '../../_cos.js'

export async function onRequest(context) {
  if (context.request.method !== 'DELETE') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { filename } = context.params

    try {
      await deleteFromCos(filename)
    } catch (e) {
      // 删除失败不影响主流程
    }

    return json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除图片失败:', error)
    return json({ success: false, error: '删除图片失败' }, 500)
  }
}
