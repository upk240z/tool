<script lang="ts">
  import { Textarea, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline } from 'flowbite-svelte-icons'
  import YAML from 'yaml'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let jsonText = ''
  let json = ''
  let yaml = ''
  let php = ''
  let error = ''

  $: if (jsonText.length > 0) {
    try {
      const parsed = JSON.parse(jsonText)
      json = JSON.stringify(parsed, null, 2)
      yaml = YAML.stringify(parsed)
      php = json
        .replaceAll(': ', ' => ')
        .replaceAll(':', ' => ')
        .replaceAll('{', '[')
        .replaceAll('}', ']')
      error = ''
    } catch (e: any) {
      error = e.toString()
      json = ''
      yaml = ''
      php = ''
    }
  } else {
    error = ''
  }
</script>

<h1>JSON</h1>

<section>
  <div class="flex flex-col gap-3">
    <Textarea placeHolder="JSON text" rows="4" bind:value={jsonText}/>
    {#if error.length > 0}
      <Alert border>
        <InfoCircleOutline slot="icon"/>
        {error}
      </Alert>
    {/if}
    {#if php.length > 0}
      <ResultBox label="Pretty" text={json}/>
      <ResultBox label="YAML" text={yaml}/>
      <ResultBox label="PHP" text={php}/>
    {/if}
  </div>
</section>
