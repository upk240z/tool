<script lang="ts">
  import { Textarea, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline } from 'flowbite-svelte-icons'
  import ResultBox from '$lib/components/ResultBox.svelte'
  import {useFlatXmlParser} from '$lib/flat-xml-parser'

  const {parseIndexed} = useFlatXmlParser()

  let inputText = ''
  let json = ''
  let php = ''
  let error = ''

  $: if (inputText.length > 0) {
    try {
      const parsed = parseIndexed(inputText)
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
    json = ''
    php = ''
  }
</script>

<h1>Flat XML</h1>

<section>
  <div class="flex flex-col gap-3">
    <Textarea placeHolder="XML" rows="4" bind:value={inputText}/>
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
