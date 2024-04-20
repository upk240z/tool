import type { Context } from '@netlify/functions'
import {cors, headers, lineClient} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  if (req.method == 'POST') {
    const alias = req.url.split('/').pop()
    if (alias) {
      const body = await new Response(req.body).text()
      const parameters = JSON.parse(body)
      await client.updateAlias(parameters.richMenuId, alias)
      return new Response(JSON.stringify(parameters), {
        headers
      })
    }
  }

  return new Response('{}', {
    headers
  })
}
