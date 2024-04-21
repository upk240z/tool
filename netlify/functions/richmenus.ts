import type { Context } from '@netlify/functions'
import {cors, lineClient, success} from './lib'

export default async (req: Request, context: Context) => {
  const corsRes = cors(req)
  if (corsRes) { return corsRes}

  const client = lineClient(req)
  const results = await client.richMenus()
  const defaultMenu = await client.defaultRichMenuId()

  return success(results.map(menu => {
    menu.isDefault = menu.richMenuId == defaultMenu.richMenuId
    return menu
  }))
}
