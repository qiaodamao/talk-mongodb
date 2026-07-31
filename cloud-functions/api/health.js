/**
 * GET /api/health - 健康检查
 */
export async function onRequest(context) {
  return new Response(JSON.stringify({ success: true, message: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
