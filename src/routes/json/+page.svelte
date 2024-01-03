<script lang="ts">
  import { Textarea, Button, Alert } from 'flowbite-svelte'
  import { InfoCircleOutline, CopySolid } from 'flowbite-svelte-icons'
  import YAML from 'yaml'
  import {copyClip} from '$lib/utils'

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
  <div class="flex flex-col gap-5">
    <Textarea placeHolder="JSON text" rows="4" bind:value={jsonText}/>
    {#if error.length > 0}
      <Alert border>
        <InfoCircleOutline slot="icon"/>
        {error}
      </Alert>
    {/if}
    {#if php.length > 0}
      <div class="result-box">
        <h5>
          Pretty
          <Button size="sm" on:click={() => copyClip(json)}>
            <CopySolid size="sm"/>
          </Button>
        </h5>
        <pre>{json}</pre>
      </div>
      <div class="result-box">
        <h5>
          YAML
          <Button size="sm" on:click={() => copyClip(yaml)}>
            <CopySolid size="sm"/>
          </Button>
        </h5>
        <pre>{yaml}</pre>
      </div>
      <div class="result-box">
        <h5>
          PHP
          <Button size="sm" on:click={() => copyClip(php)}>
            <CopySolid size="sm"/>
          </Button>
        </h5>
        <pre>{php}</pre>
      </div>
    {/if}
  </div>
</section>
