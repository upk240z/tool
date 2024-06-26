import LineClient from './line-client'

export type ObjectData = {[i: string]: any}

export const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,POST,DELETE',
  'Access-Control-Allow-Credentials': 'true',
}

export const cors = (req: Request): Response | null => {
  if (req.method == 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    })
  }

  return null
}

export const success = (output: ObjectData) => {
  return new Response(JSON.stringify(output), {
    status: 200,
    headers
  })
}

export const error = (message: string, status: number = 400) => {
  return new Response(JSON.stringify({message}), {
    status: 400,
    headers
  })
}

export const lineClient = (req: Request) => {
  const token = req.headers.get('line-token')

  return new LineClient({
    token: token!,
  })
}
