<script lang="ts">
  import { Select, Textarea ,Button, Toast } from 'flowbite-svelte'
  import { CopySolid, CheckCircleSolid } from 'flowbite-svelte-icons'
  import {copyClip, hash} from '$lib/utils'

  const ALGORITHMS = [
    'SHA-1',
    'SHA-256',
    'SHA-384',
    'SHA-512',
  ]

  const algorithms = ALGORITHMS.map(item => {
    return { value: item, name: item }
  })

  let algorithm: string = ''
  let text: string = ''
  let result: string = ''
  let toastMessage = ''

  $: {
    if (algorithm.length > 0 && text.length > 0) {
      hash(algorithm, text).then(r => result = r)
    } else {
      result = ''
    }
  }

  const onClickCopy = () => {
    copyClip(result)
    toastMessage = 'Copied'
    setTimeout(() => {
      toastMessage = ''
    }, 3000)
  }
</script>

<h1>Crypt</h1>

<section>
  <div class="flex flex-col gap-5">
    <Select class="mt-2" placeholder="Choose Algorithm" items={algorithms} bind:value={algorithm}/>
    <Textarea rows="4" placeHolder="Target text" bind:value={text}/>

    {#if result.length > 0}
      <hr>
      <div class="flex flex-col gap-3 p-3 shadow rounded-lg">
        <h5 class="font-medium">{algorithm}</h5>
        <div class="flex items-center gap-2">
          <p class="border px-3 py-2 rounded-lg bg-blue-50 grow">{result}</p>
          <Button class="ml-2" on:click={onClickCopy}>
            <CopySolid/>
          </Button>
        </div>
      </div>
    {/if}
  </div>
</section>

{#if toastMessage.length > 0}
  <Toast color="green" class="fixed right-10 bottom-10">
    <svelte:fragment slot="icon">
      <CheckCircleSolid class="w-5 h-5" />
      <span class="sr-only">Check icon</span>
    </svelte:fragment>
    {toastMessage}
  </Toast>
{/if}
