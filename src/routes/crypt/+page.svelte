<script lang="ts">
  import { Select, Textarea } from 'flowbite-svelte'
  import ResultBox from '$lib/components/ResultBox.svelte'
  import {hash} from '$lib/utils'

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

  $: {
    if (algorithm.length > 0 && text.length > 0) {
      hash(algorithm, text).then(r => result = r)
    } else {
      result = ''
    }
  }
</script>

<h1>Crypt</h1>

<section>
  <div class="flex flex-col gap-5">
    <Select class="mt-2" placeholder="Choose Algorithm" items={algorithms} bind:value={algorithm}/>
    <Textarea rows="4" placeHolder="Target text" bind:value={text}/>
    <ResultBox label={algorithm} text={result}/>
  </div>
</section>
