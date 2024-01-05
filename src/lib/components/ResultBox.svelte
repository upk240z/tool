<script lang="ts">
  import {Button, Toast} from 'flowbite-svelte'
  import { CopySolid, CheckCircleSolid } from 'flowbite-svelte-icons'
  import {copyClip} from '$lib/utils'

  export let label: string
  export let text: string
  let message = ''

  const onCopy = () => {
    copyClip(text)
    message = 'Copied'
    setTimeout(() => {
      message = ''
    }, 3000)
  }
</script>

{#if text.length > 0}
  <div class="flex flex-col gap-3 p-3 shadow rounded-lg mt-3">
    <h5 class="font-medium">
      {label}
      <Button class="ml-2" on:click={onCopy} size="sm">
        <CopySolid size="sm"/>
      </Button>
    </h5>
    <div class="result-text">
      <pre class="border px-3 py-2 rounded-lg bg-blue-50 grow">{@html text}</pre>
    </div>
  </div>
{/if}

{#if message.length > 0}
  <Toast color="green" class="fixed right-10 bottom-10">
    <svelte:fragment slot="icon">
      <CheckCircleSolid class="w-5 h-5" />
      <span class="sr-only">Check icon</span>
    </svelte:fragment>
    {message}
  </Toast>
{/if}

<style lang="postcss">
  .result-text {
    @apply flex items-center gap-2 overflow-x-auto text-sm;
    line-break: anywhere;
    word-break: break-all;
  }
</style>
