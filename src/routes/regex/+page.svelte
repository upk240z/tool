<script lang="ts">
  import {
    FloatingLabelInput, Textarea, Listgroup, ListgroupItem, Indicator, Alert
  } from 'flowbite-svelte'
  import {InfoCircleSolid} from 'flowbite-svelte-icons'

  let matches: string[] = []
  let regText = ''
  let targetText = ''
  let error = ''

  $: if (regText.length > 0 && targetText.length > 0) {
    try {
      const reg = eval(regText) as RegExp
      const result = reg.exec(targetText)
      if (result) {
        matches = result.map(m => m)
        error = ''
      } else {
        error = 'unmatched'
      }
    } catch (e) {
    }
  }
</script>

<h1>Regular expression</h1>

<section>
  <div class="flex flex-col gap-5">
    <FloatingLabelInput style="outlined" class="mt-2" bind:value={regText}>Regex</FloatingLabelInput>
    <Textarea rows="4" placeHolder="Target text" bind:value={targetText}/>

    {#if error.length > 0}
      <Alert>
        <InfoCircleSolid slot="icon" class="w-4 h-4" />
        {error}
      </Alert>
    {/if}

    {#if matches.length > 0}
      <Listgroup>
        {#each matches as item, index}
          <ListgroupItem>
            <Indicator color="green" size="xl">
              <span class="text-white">{index}</span>
            </Indicator>
            <span class="ml-1 text-base">{item}</span>
          </ListgroupItem>
        {/each}
      </Listgroup>
    {/if}
  </div>
</section>
