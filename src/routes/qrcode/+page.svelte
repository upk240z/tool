<script lang="ts">
  import {Dropzone, Textarea} from 'flowbite-svelte'
  import QRCode from 'qrcode'
  import {BrowserQRCodeSvgWriter, BrowserQRCodeReader} from '@zxing/browser'
  import {prevent, setMessage} from '$lib/utils'
  import ResultBox from '$lib/components/ResultBox.svelte'

  let text = ''
  let refCanvas: HTMLCanvasElement
  let refSvg: HTMLDivElement
  let qrImageUri = ''
  let decoded = ''

  const writer = new BrowserQRCodeSvgWriter()

  $:if (text.length > 0 && refCanvas) {
    QRCode.toCanvas(refCanvas, text, (err: any) => {
      if (err) {
        console.log(err)
      } else {
        const svg = writer.write(text, refCanvas.width, refCanvas.height)
        if (refSvg.children.length > 0) {
          refSvg.removeChild(refSvg.children[0])
        }
        refSvg.append(svg)
      }
    })
  }

  const readFile = async (file: File) => {
    qrImageUri = ''
    decoded = ''
    const reader = new FileReader()
    reader.onload = async (e: ProgressEvent) => {
      qrImageUri = e.target.result
      try {
        const codeReader = new BrowserQRCodeReader()
        const result = await codeReader.decodeFromImageUrl(qrImageUri)
        decoded = result.text
      } catch (err: any) {
        setMessage(err.toString())
      }
    }
    reader.readAsDataURL(file)
  }

  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      readFile(target.files[0])
    }
  }

  const onDrop = (e: DragEvent) => {
    prevent(e)
    if (!e.dataTransfer) { return }
    if (e.dataTransfer.items) {
      const file = e.dataTransfer.items[0].getAsFile()
      if (file) {
        readFile(file)
      }
    }
  }
</script>

<h1>QRCode</h1>

<section>
  <h2 class="font-medium text-lg mb-3">Create</h2>
  <Textarea rows="4" placeHolder="Text" bind:value={text}/>
  {#if text.length > 0}
    <div class="results">
      <div class="box">
        <canvas bind:this={refCanvas}/>
        <h5 class="font-medium">PNG</h5>
      </div>
      <div class="box">
        <div bind:this={refSvg}></div>
        <h5 class="font-medium">SVG</h5>
      </div>
    </div>
  {/if}
</section>

<hr class="my-3">

<section>
  <h2 class="font-medium text-lg mb-3">Decode</h2>
  <Dropzone
    on:drop={onDrop} on:change={onChange} on:dragover={prevent}
    class="h-28">
    <svg aria-hidden="true" class="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
  </Dropzone>

  <ResultBox label="decoded text" text={decoded}/>

  {#if qrImageUri.length > 0}
    <div class="border border-gray-300 rounded-lg mt-3 flex justify-center">
      <img src={qrImageUri} alt="">
    </div>
  {/if}
</section>

<style lang="postcss">
  div.results {
    @apply grid grid-cols-2 gap-5 mt-5;
    div.box {
      @apply border shadow rounded-lg p-5 flex flex-col items-center;
    }
    h5 {
      @appt font-medium;
    }
  }
</style>
