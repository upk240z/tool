export type ClientOptions = {
  token: string,
}

type ObjectData = {[i: string]: any}

export default class LineClient {
  private readonly token: string

  constructor(options: ClientOptions) {
    this.token = options.token
  }

  private headers = (): ObjectData => {
    return {
      'Authorization' : `Bearer ${this.token}`
    }
  }

  private async fetch(url: string): Promise<Response | null> {
    try {
      const options: ObjectData = {
        method: 'GET',
        headers: this.headers()
      }
      const response = await fetch(url, options)

      if (response.ok) {
        return response
      } else {
        console.log('@@@ fetch response error')
        console.log(response.statusText)
        return null
      }
    } catch (err) {
      console.log('@@@ fetch error')
      console.log(err)
      return null
    }
  }

  private async fetchJSON(url: string): Promise<any> {
    const response = await this.fetch(url)
    return response ? await response.json() : null
  }

  private async post(url: string, body: any = null, type: string | null = null): Promise<Response | null> {
    try {
      const headers = this.headers()
      if (type) {
        headers['Content-Type'] = type
      }
      const options: ObjectData = {
        method: 'POST',
        headers,
      }
      if (body) {
        options.body = body
      }

      const response = await fetch(url, options)
      if (response.ok) {
        return response
      } else {
        console.log('@@@ post response error')
        console.log(response.statusText)
        return null
      }
    } catch (err) {
      console.log('@@@ post error')
      console.log(err)
      return null
    }
  }

  public async richMenus(): Promise<ObjectData[]> {
    const result = await this.fetchJSON('https://api.line.me/v2/bot/richmenu/list')
    if (result === null) {
      return []
    } else {
      return (result.richmenus as ObjectData[]).sort((a, b) => {
        if (a['name'] > b['name']) {
          return 1;
        } else if (a['name'] == b['name']) {
          return 0;
        } else {
          return -1;
        }
      })
    }
  }

  public async defaultRichMenuId(): Promise<ObjectData> {
    const result = await this.fetchJSON('https://api.line.me/v2/bot/user/all/richmenu')
    if (result === null) {
      return {richMenuId: ''}
    } else {
      return result
    }
  }

  public async richMenuImage(richMenuId: string): Promise<ObjectData> {
    const response = await this.fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`)
    if (response === null) {
      return {
        blob: null,
        type: null
      }
    } else {
      return {
        blob: await response.blob(),
        type: response.headers.get('content-type'),
      }
    }
  }

  public async createRichMenu(json: string): Promise<string> {
    const response = await this.post(
      'https://api.line.me/v2/bot/richmenu',
      json,
      'application/json'
    )

    if (response === null) {
      return ''
    }

    const {richMenuId} = await response.json() as ObjectData
    return richMenuId
  }

  public async uploadRichMenuImage(menuId: string, file: ObjectData): Promise<string> {
    const bin = atob(file.base64)

    const buffer = new Uint8Array(bin.length)
    buffer.forEach((_, idx) => {
      buffer[idx] = bin.charCodeAt(idx)
    })

    const url = `https://api-data.line.me/v2/bot/richmenu/${menuId}/content`
    const response = await this.post(
      url,
      buffer,
      file.type
    )

    if (response === null) {
      return ''
    }

    const {richMenuId} = await response.json() as ObjectData
    return richMenuId
  }

  public async setDefaultRichMenu(menuId: string) {
    const url = `https://api.line.me/v2/bot/user/all/richmenu/${menuId}`
    await this.post(url)
  }

  public async deleteRichMenu(menuId: string) {
    const url = `https://api.line.me/v2/bot/richmenu/${menuId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers(),
    })

    if (!response.ok) {
      console.log('@@@ delete response error')
      console.log(response.statusText)
    }
  }
}
