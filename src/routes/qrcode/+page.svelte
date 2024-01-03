<script lang="ts">
  import {Textarea} from 'flowbite-svelte'
  import QRCode from 'qrcode'
  import {BrowserQRCodeSvgWriter} from '@zxing/browser'

  let text = ''
  let refCanvas: HTMLCanvasElement
  let refSvg: HTMLDivElement

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
</script>

<h1>QRCode</h1>

<section>
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
