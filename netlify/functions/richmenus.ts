import type { Context } from '@netlify/functions'
import {cors, headers, lineClient} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  const results = await client.richMenus()

  return new Response(JSON.stringify(results), {
    headers
  })
}
