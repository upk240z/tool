import type { Context } from '@netlify/functions'
import {headers, lineClient, cors} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  const result = await client.defaultRichMenuId()

  return new Response(JSON.stringify(result), {
    headers
  })
}
