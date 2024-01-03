<script lang="ts">
  import { Textarea } from 'flowbite-svelte'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let encodeTarget = ''
  let encoded = ''
  let decodeTarget = ''
  let decoded = ''

  $: if (encodeTarget.length > 0) {
    encoded = encodeURIComponent(encodeTarget)
  } else {
    encoded = ''
  }

  $: if (decodeTarget.length > 0) {
    decoded = decodeURIComponent(decodeTarget)
  } else {
    decoded = ''
  }
</script>

<h1>URL encode/decode</h1>

<section>
  <Textarea rows="4" placeHolder="Encode target" bind:value={encodeTarget}/>
  <ResultBox label="Encoded" text={encoded}/>
</section>

<hr class="my-5">

<section>
  <Textarea rows="4" placeHolder="Decode target" bind:value={decodeTarget}/>
  <ResultBox label="Decoded" text={decoded}/>
</section>
