import type { Context } from '@netlify/functions'
import {headers, lineClient, cors, error} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const richMenuId = req.url.split('/').pop()
  if (richMenuId) {
    const client = lineClient(req)
    const result = await client.richMenuImage(richMenuId)
    if (result) {
      headers['Content-Type'] = result.type
      return new Response(result.blob, {
        headers
      })
    }
  }

  return error('not found rich menu image', 404)
}
