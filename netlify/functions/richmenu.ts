import type { Context } from '@netlify/functions'
import {cors, headers, lineClient} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  if (req.method == 'POST') {
    const body = await new Response(req.body).text()
    const parameters = JSON.parse(body)
    const richMenuId = await client.createRichMenu(parameters.json)
    await client.uploadRichMenuImage(richMenuId, parameters.image)
    return new Response(JSON.stringify({richMenuId}), {
      headers
    })
  } else if (req.method == 'DELETE') {
    const richMenuId = req.url.split('/').pop()
    if (richMenuId) {
      await client.deleteRichMenu(richMenuId)
      return new Response('{}', {
        headers
      })
    }
  }

  return new Response('not found rich menu', {
    status: 404
  })
}
