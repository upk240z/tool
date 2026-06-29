<script lang="ts">
  import { Textarea, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline } from 'flowbite-svelte-icons'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let excel = ''
  let markdown = ''
  let error = ''

  function escapeCell(value: string): string {
    return value.trim().replace(/\|/g, '\\|')
  }

  function convert(input: string): void {
    error = ''
    markdown = ''

    const rows = input
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter((row) => row.length > 0)
      .map((row) => row.split('\t').map(escapeCell))

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
      <ResultBox label="Markdown" text={markdown}/>
    {/if}
  </div>
</section>
