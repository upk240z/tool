import type { Context } from '@netlify/functions'
import {lineClient, cors, success, error} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const richMenuId = req.url.split('/').pop()
  if (richMenuId) {
    try {
      const client = lineClient(req)
      await client.setDefaultRichMenu(richMenuId)
      return success({})
    } catch (err: any) {
      return error(err.toString())
    }
  }

  return error('not found rich menu', 404)
}
