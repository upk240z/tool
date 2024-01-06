import type { Context } from '@netlify/functions'
import {headers, lineClient, cors} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const richMenuId = req.url.split('/').pop()
  if (richMenuId) {
    const client = lineClient(req)
    await client.setDefaultRichMenu(richMenuId)
    return new Response('{}', {
      headers
    })
  }

  return new Response('not found rich menu', {
    status: 404
  })
}
