import type { Context } from '@netlify/functions'
import {cors, error, lineClient, success} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  if (req.method == 'POST') {
    const alias = req.url.split('/').pop()
    if (alias) {
      try {
        const body = await new Response(req.body).text()
        const parameters = JSON.parse(body)
        const response = await client.updateAlias(parameters.richMenuId, alias)
        if (response.ok) {
          return success(parameters)
        } else {
          return error(response.statusText)
        }
      } catch (err: any) {
        return error(err.toString())
      }
    }
  }

  return error('unknown')
}
