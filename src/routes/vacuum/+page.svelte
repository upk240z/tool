<script lang="ts">
  import {onMount, onDestroy} from 'svelte'
  import {Button, FloatingLabelInput, Alert} from 'flowbite-svelte'
  import {TrashBinOutline, RefreshOutline} from 'flowbite-svelte-icons'
  import dayjs from 'dayjs'
  import {getItem, setItem} from '$lib/store'
  import {copyClip, setMessage} from '$lib/utils'
  import ResultBox from "$lib/components/ResultBox.svelte";

  let url = ''
  let token = ''
  let histories: Record<string, string | number>[] = []

  const headers = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const readHistory = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: headers(),
      })

      const decoded = await response.json()
      if (Array.isArray(decoded)) {
        histories = decoded
      } else {
        histories = []
      }
    } catch (e) {
      console.error(e)
      histories = []
    }
  }

  const init = async () => {
    if (url.length == 0) {
      histories = []
      return
    }

    await readHistory()
  }

  onMount(() => {
    url = getItem('vacuum-url', '')
    token = getItem('vacuum-token', '')
    init()
  })

  onDestroy(() => {
    if (url.length > 0 && token.length > 0) {
      setItem('vacuum-url', url)
      setItem('vacuum-token', token)
    }
  })

  const deleteItem = async (targetIndex: number) => {
    try {
      await fetch(`${url}/${targetIndex}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: headers(),
      })

      await readHistory()

      setMessage('deleted')
    } catch (e) {
      console.error(e)
    }
  }
</script>

<h1>Vacuum</h1>

<section class="mt-5 h-full">
  <div class="flex gap-3 mb-5">
    <div class="grow"><FloatingLabelInput style="outlined" bind:value={url} on:change={init}>Vacuum URL</FloatingLabelInput></div>
    <div class="grow"><FloatingLabelInput style="outlined" bind:value={token} on:change={init}>Vacuum Token</FloatingLabelInput></div>
    <Button color="yellow" on:click={init}><RefreshOutline/></Button>
  </div>

  {#if histories.length == 0}
    <Alert>Empty</Alert>
  {/if}

  <ul class="flex flex-col gap-5">
    {#each histories as history, index}
      <li class="border border-gray-400 rounded-lg p-3 text-sm inline-flex flex-col gap-2 relative shadow-lg">
        <span class="inline-flex gap-2 items-center">
          <span class="text-green-800 bg-green-100 p-2 rounded-lg">{dayjs(history.time).format('YYYY-MM-DD HH:mm:ss')}</span>
          <button type="button" class="text-blue-800 bg-blue-100 p-2 rounded-lg inline-flex gap-2 items-center grow shadow" on:click={() => copyClip(history.hash) }>
            <span class="bg-blue-800 text-white px-2 py-1 rounded-lg text-xs">HASH</span>
            {history.hash}
          </button>
        </span>
        <span class="inline-flex gap-2 items-center">
          <span class="bg-green-500 px-2 py-1 rounded-lg text-white font-medium text-xs">{history.method}</span>
          <span class="text-green-600">{history.uri}</span>
        </span>
        <span class="inline-flex gap-2 items-center">
          <span class="bg-orange-500 px-2 py-1 rounded-lg text-white font-medium text-xs">Content-Type</span>
          <span class="text-orange-600">{history.contentType}</span>
        </span>
        <ResultBox label="Parameters" text={JSON.stringify(history.parameters, null, 2)}/>
        <Button class="p-2 absolute top-[-0.5rem] right-[-0.5rem]" color="red" on:click={() => { deleteItem(index) }}>
          <TrashBinOutline/>
        </Button>
      </li>
    {/each}
  </ul>
</section>

<style lang="postcss">
  #map {
    @apply w-full h-3/4;
  }
</style>
