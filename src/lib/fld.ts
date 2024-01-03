import Encoding from 'encoding-japanese'
import {getItem, setItem} from './store'

const SAVE_KEY = 'fld-definitions'

export type ColumnInfo = {
  name: string,
  start: number,
  length: number,
}

export type ParseResult = {
  rows: {[index: string]: string}[],
  type: string,
  dataLength: number,
  messages: string[],
  lineLengths: number[],
  columns: ColumnInfo[],
}

export type FILE_DATA = {
  type: string,
  json: string,
  length: number,
}

export const parseFile = (file: File): Promise<ParseResult> => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const allLines = reader.result as string
      const lines = allLines.trim().split(/\r\n|\r|\n/)
      const dataLength = lines[0].length;
      const messages: string[] = []
      const lineLengths: number[] = []

      const definitions = getDefinitions()
      const filtered = definitions.filter((definition) => {
        return definition.length == dataLength
      })

      if (filtered.length == 0) { reject('unknown file format') }

      const type = filtered[0].type
      const _columns = getDefinition(type)
      if (!_columns) {
        reject(`unknown data type: ${type}`)
        return
      }

      const columns: ColumnInfo[] = _columns!

      const results = lines.map((line, index) => {
        if (line.length != dataLength) {
          messages.push(`${index + 1}行目データ長不正: ${line.length} bytes`)
        }
        lineLengths.push(line.length)
        const codeArray = Encoding.stringToCode(line)
        const map: {[index: string]: string} = {}
        columns.forEach((column) => {
          const s = column.start - 1
          const columnArray = codeArray.slice(s, s + column.length)
          const utfArray = Encoding.convert(columnArray, {
            to: 'UNICODE',
            from: 'SJIS'
          })
          map[column.name] = Encoding.codeToString(utfArray)
        })
        return map
      })
      resolve({
        rows: results,
        type: type,
        dataLength: dataLength,
        messages: messages,
        lineLengths: lineLengths,
        columns: columns,
      })
    }

    reader.onerror = (err) => {
      reject(err)
    }

    reader.readAsBinaryString(file)
  })
}

export const saveDefinition = (type: string, file: File): Promise<void> => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      try {
        const json = reader.result as string
        const columns = JSON.parse(json) as ColumnInfo[]
        const definitions = getItem(SAVE_KEY, []) as FILE_DATA[]

        const last = columns.pop()
        if (!last) {
          reject('wrong file format')
          return
        }

        definitions.push({
          type,
          json,
          length: last.start + last.length - 1,
        })
        setItem(SAVE_KEY, definitions)
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    reader.readAsText(file)
  })
}

const getDefinition = (type: string): ColumnInfo[] | null => {
  const definitions = getDefinitions()
  const filtered = definitions.filter((definition) => {
    return definition.type == type
  })

  if (filtered.length > 0) {
    return JSON.parse(filtered[0].json) as ColumnInfo[]
  } else {
    return null
  }
}

export const getDefinitions = (): FILE_DATA[] => {
  return getItem(SAVE_KEY, []) as FILE_DATA[]
}

export const deleteDefinition = (type: string) => {
  const definitions = getDefinitions()
  const filtered = definitions.filter(item => {
    return item.type != type
  })
  setItem(SAVE_KEY, filtered)
}
