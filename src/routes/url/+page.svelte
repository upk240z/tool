<script lang="ts">
  import { Textarea } from 'flowbite-svelte'
  import ResultBox from '$lib/components/ResultBox.svelte'
  import {encodeUrlWithEncoding, setMessage} from '$lib/utils'

  let encodeTarget = ''
  let encoded = ''
  let encodedSJIS = ''
  let encodedEuc = ''
  let decodeTarget = ''
  let decoded = ''

  $: if (encodeTarget.length > 0) {
    encoded = encodeURIComponent(encodeTarget)
    encodedSJIS = encodeUrlWithEncoding(encodeTarget, 'Shift_JIS')
    encodedEuc = encodeUrlWithEncoding(encodeTarget, 'EUC-JP')
  } else {
    encoded = encodedSJIS = encodedEuc = ''
  }

  $: if (decodeTarget.length > 0) {
    try {
      decoded = decodeURIComponent(decodeTarget)
    } catch (e) {
      decoded = ''
      setMessage(e.toString())
    }
  } else {
    decoded = ''
  }
</script>

<h1>URL encode/decode</h1>

<section>
  <Textarea rows="4" placeHolder="Encode target" bind:value={encodeTarget}/>
  <ResultBox label="Encoded" text={encoded}/>
  <ResultBox label="Encoded(Shift-JIS)" text={encodedSJIS}/>
  <ResultBox label="Encoded(EUC)" text={encodedEuc}/>
</section>

<hr class="my-5">

<section>
  <Textarea rows="4" placeHolder="Decode target" bind:value={decodeTarget}/>
  <ResultBox label="Decoded" text={decoded}/>
</section>
