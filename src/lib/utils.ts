import {toastMessage} from '$lib/store'

export const setMessage = (message: string, ttl: number = 3000) => {
  toastMessage.set({
    text: message,
    ttl,
  })
}

export const copyClip = async (text: string, message = 'Copied', ttl = 3000): Promise<void> => {
  await navigator.clipboard.writeText(text)
  setMessage(message, ttl)
}

export const hash = async (algorithm: string, input: string): Promise<string> => {
  const buffer = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(input)
  )
  return Array.from(new Uint8Array(buffer))
    .map(buf => buf.toString(16).padStart(2, '0'))
    .join('')
}

export const buildQuery = (params: {[i: string]: any}): string => {
  const array = []
  for (const key in params) {
    const str = params[key] !== null ? params[key].toString() : ''
    array.push(encodeURIComponent(key) + '=' + encodeURIComponent(str));
  }
  return array.join('&')
}

export const prevent = (e: Event) => { e.preventDefault() }
