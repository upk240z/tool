<script lang="ts">
  import {onMount} from 'svelte'
  import { Button, Textarea, Alert, FloatingLabelInput } from 'flowbite-svelte'
  import { InfoCircleOutline, DownloadOutline } from 'flowbite-svelte-icons'
  import YAML from 'yaml'
  import { downloadFile } from '$lib/utils'
  import {getItem, setItem} from '$lib/store'

  let yamlText = ''
  let filename = 'redoc'
  let error = ''

  onMount(() => {
    yamlText = getItem('redocly-yaml', '')
  })

  $: if (yamlText.length > 0) {
    try {
      const parsed = YAML.parse(yamlText)
      if (parsed?.info?.title) {
        filename = parsed.info.title
        if (parsed.info.version) {
          filename += `-${parsed.info.version}`
        }
      }
      error = ''
    } catch (e: any) {
      error = e.toString()
    }
  } else {
    error = ''
  }

  const buildHtml = (spec: any): string => `<!DOCTYPE html>
<html>
  <head>
    <title>${spec?.info?.title ?? 'ReDoc'}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <div id="redoc-container"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"><\/script>
    <script>
      Redoc.init(${JSON.stringify(spec)}, {}, document.getElementById('redoc-container'))
    <\/script>
  </body>
</html>
`

  const download = () => {
    if (yamlText.length === 0 || error.length > 0 || filename.length === 0) {
      return
    }

    const spec = YAML.parse(yamlText)
    downloadFile(`${filename}.html`, buildHtml(spec), 'text/html')
    setItem('redocly-yaml', yamlText)
  }
</script>

<h1>Redocly</h1>

<section>
  <div class="flex flex-col gap-3">
    <Textarea placeHolder="YAML text" rows="10" bind:value={yamlText}/>
    {#if error.length > 0}
      <Alert border>
        <InfoCircleOutline slot="icon"/>
        {error}
      </Alert>
    {/if}
    <div class="flex gap-3 items-center">
      <div class="grow"><FloatingLabelInput style="outlined" bind:value={filename}>File name</FloatingLabelInput></div>
      <Button color="yellow" disabled={yamlText.length === 0 || error.length > 0 || filename.length === 0} on:click={download}>
        <DownloadOutline class="me-2"/>
        Download HTML
      </Button>
    </div>
  </div>
</section>
