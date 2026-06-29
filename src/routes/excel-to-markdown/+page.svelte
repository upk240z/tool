<script lang="ts">
  import { Textarea, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline } from 'flowbite-svelte-icons'
  import ResultText from '$lib/components/ResultText.svelte'

  let excel = ''
  let markdown = ''
  let error = ''

  function escapeCell(value: string): string {
    return value
      .trim()
      .replace(/\|/g, '\\|')
      .replace(/\r\n|\r|\n/g, '<br>')
  }

  function parseRows(input: string): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let cell = ''
    let inQuotes = false
    let i = 0

    const pushCell = () => {
      row.push(cell)
      cell = ''
    }
    const pushRow = () => {
      pushCell()
      rows.push(row)
      row = []
    }

    while (i < input.length) {
      const char = input[i]

      if (inQuotes) {
        if (char === '"') {
          if (input[i + 1] === '"') {
            cell += '"'
            i += 2
            continue
          }
          inQuotes = false
          i++
          continue
        }
        cell += char
        i++
        continue
      }

      if (char === '"') {
        inQuotes = true
        i++
        continue
      }
      if (char === '\t') {
        pushCell()
        i++
        continue
      }
      if (char === '\r') {
        if (input[i + 1] === '\n') {
          i++
        }
        pushRow()
        i++
        continue
      }
      if (char === '\n') {
        pushRow()
        i++
        continue
      }
      cell += char
      i++
    }

    if (cell.length > 0 || row.length > 0) {
      pushRow()
    }

    return rows
  }

  function convert(input: string): void {
    error = ''
    markdown = ''

    const rows = parseRows(input)
      .filter((row) => row.some((cell) => cell.length > 0))
      .map((row) => row.map(escapeCell))

    if (rows.length === 0) {
      return
    }

    const columnCount = Math.max(...rows.map((row) => row.length))
    const normalized = rows.map((row) => {
      const cells = [...row]
      while (cells.length < columnCount) {
        cells.push('')
      }
      return cells
    })

    const [header, ...body] = normalized
    const lines: string[] = []
    lines.push(`| ${header.join(' | ')} |`)
    lines.push(`| ${header.map(() => '---').join(' | ')} |`)
    for (const row of body) {
      lines.push(`| ${row.join(' | ')} |`)
    }

    markdown = lines.join('\n')
  }

  $: convert(excel)
</script>

<h1>Excel To Markdown</h1>

<section>
  <div class="flex flex-col gap-3">
    <Textarea placeHolder="Past Excel Here" rows="4" bind:value={excel}/>
    {#if error.length > 0}
      <Alert border>
        <InfoCircleOutline slot="icon"/>
        {error}
      </Alert>
    {/if}
    {#if markdown.length > 0}
      <ResultText label="Markdown" text={markdown}/>
    {/if}
  </div>
</section>
