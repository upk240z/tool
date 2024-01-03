<script lang="ts">
  import { Textarea, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline } from 'flowbite-svelte-icons'
  import YAML from 'yaml'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let yamlText = ''
  let json = ''
  let php = ''
  let error = ''

  $: if (yamlText.length > 0) {
    try {
      const parsed = YAML.parse(yamlText)
      json = JSON.stringify(parsed, null, 2)
      php = json
        .replaceAll(': ', ' => ')
        .replaceAll(':', ' => ')
        .replaceAll('{', '[')
        .replaceAll('}', ']')
      error = ''
    } catch (e: any) {
      error = e.toString()
      json = ''
      php = ''
    }
  } else {
    error = ''
  }
</script>

<h1>YAML</h1>

<section>
  <div class="flex flex-col gap-3">
    <Textarea placeHolder="YAML text" rows="4" bind:value={yamlText}/>
    {#if error.length > 0}
      <Alert border>
        <InfoCircleOutline slot="icon"/>
        {error}
      </Alert>
    {/if}
    {#if php.length > 0}
      <ResultBox label="JSON" text={json}/>
      <ResultBox label="PHP" text={php}/>
    {/if}
  </div>
</section>
