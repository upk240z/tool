<script lang="ts">
  import { Listgroup, ListgroupItem } from 'flowbite-svelte'
  import {MENU_LINKS} from '$lib/constants'
</script>

<h1>Home</h1>

<section>
  <Listgroup active>
    {#each MENU_LINKS as item}
      <ListgroupItem href={item.href}>{item.name}</ListgroupItem>
    {/each}
  </Listgroup>
</section>
