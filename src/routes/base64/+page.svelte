<script lang="ts">
  import {Base64} from 'js-base64'
  import { Textarea } from 'flowbite-svelte'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let encodeTarget = ''
  let encoded = ''
  let decodeTarget = ''
  let decoded = ''

  $: if (encodeTarget.length > 0) {
    encoded = Base64.encode(encodeTarget)
  } else {
    encoded = ''
  }

  $: if (decodeTarget.length > 0) {
    decoded = Base64.decode(decodeTarget)
  } else {
    decoded = ''
  }
</script>

<h1>Base64</h1>

<section>
  <Textarea rows="4" placeHolder="Encode target" bind:value={encodeTarget}/>
  <ResultBox label="Encoded" text={encoded}/>
</section>

<hr class="my-5">

<section>
  <Textarea rows="4" placeHolder="Decode target" bind:value={decodeTarget}/>
  <ResultBox label="Decoded" text={decoded}/>
</section>
