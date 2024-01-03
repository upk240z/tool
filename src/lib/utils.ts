export const copyClip = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
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
