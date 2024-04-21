<script lang="ts">
  import {Button} from 'flowbite-svelte'
  import {CheckOutline, CloseOutline} from 'flowbite-svelte-icons'
  import Bingo from '$lib/bingo'

  let bingo = new Bingo()

  const onTake = () => {
    const _bingo = bingo
    _bingo.open()
    _bingo.mark()
    bingo = _bingo
  }
</script>

<h1>Bingo</h1>

<section>
  <div class="grid grid-cols-5 gap-2">
    {#each bingo.cells as cell}
      <div class="cell-{cell.state} flex flex-col justify-center py-3 md:py-10 text-center">
        <span class="number grow text-white font-bold text-xl md:text-5xl">{cell.no}</span>
      </div>
    {/each}
  </div>
</section>

<div class="fixed right-5 bottom-5 flex flex-col gap-2">
  <Button color="blue" pill={true} class="py-4"
          on:click={onTake}>
    <CheckOutline/>
  </Button>
  <Button pill={true} class="py-4 bg-orange-400"
    on:click={() => bingo = new Bingo()}>
    <CloseOutline/>
  </Button>
</div>

<style lang="postcss">
  .cell-close {
    @apply bg-gray-200;
  }

  .cell-open {
    @apply bg-blue-500;
  }

  .cell-reach {
    @apply bg-orange-400;
  }

  .cell-bingo {
    @apply bg-red-500;
  }
</style>
