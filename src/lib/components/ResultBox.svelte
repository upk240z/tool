<script lang="ts">
  import {Button} from 'flowbite-svelte'
  import {FileCopyOutline, ExpandOutline, MinimizeOutline} from 'flowbite-svelte-icons'
  import {copyClip} from '$lib/utils'
  import JsonNode from '$lib/components/JsonNode.svelte'

  export let label: string
  export let text: string

  let parsedJson: any
  let isJson = false

  $: {
    try {
      parsedJson = JSON.parse(text)
      isJson = true
    } catch {
      isJson = false
    }
  }

  let signal: {n: number, expand: boolean} | undefined = undefined

  function expandAll() {
    signal = {n: (signal?.n ?? 0) + 1, expand: true}
  }

  function collapseAll() {
    signal = {n: (signal?.n ?? 0) + 1, expand: false}
  }
</script>

{#if text.length > 0}
  <div class="flex flex-col gap-3 p-3 shadow rounded-lg border">
    <h5 class="font-medium inline-flex gap-3 items-center">
      {label}
      <Button class="ml-2" on:click={() => copyClip(text)} size="sm">
        <FileCopyOutline size="sm"/>
      </Button>
      {#if isJson}
        <Button color="light" size="xs" on:click={expandAll}><ExpandOutline size="sm"/></Button>
        <Button color="light" size="xs" on:click={collapseAll}><MinimizeOutline size="sm"/></Button>
      {/if}
    </h5>
    {#if isJson}
      <div class="border px-3 py-2 rounded-lg bg-blue-50 text-sm font-mono overflow-x-auto">
        <JsonNode value={parsedJson} depth={0} {signal} />
      </div>
    {:else}
      <div class="result-text">
        <pre class="border px-3 py-2 rounded-lg bg-blue-50 grow">{@html text}</pre>
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .result-text {
    @apply flex items-center gap-2 overflow-x-auto text-xs;
    line-break: anywhere;
    word-break: break-all;
  }
</style>
