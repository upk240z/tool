import type { Context } from '@netlify/functions'
import {cors, error, lineClient, success} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  if (req.method == 'POST') {
    const body = await new Response(req.body).text()
    const parameters = JSON.parse(body)
    const richMenuId = await client.createRichMenu(parameters.json)
    await client.uploadRichMenuImage(richMenuId, parameters.image)
    return success({richMenuId})
  } else if (req.method == 'DELETE') {
    const richMenuId = req.url.split('/').pop()
    if (richMenuId) {
      await client.deleteRichMenu(richMenuId)
      return success({})
    }
  }

  return error('not found rich menu', 404)
}
