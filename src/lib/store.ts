import { writable } from 'svelte/store'

export const getItem = (key: string, defValue: any = null): any => {
  const item = localStorage.getItem(key)
  if (item) {
    return JSON.parse(item)
  } else {
    return defValue
  }
}

export const setItem = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const loading = writable<boolean>(false)

export type ToastMessageData = {
  text: string,
  ttl: number,
}
export const toastMessage = writable<ToastMessageData>({
  text: '', ttl: 0
})
