<script lang="ts">
  import '../app.postcss'
  import {onDestroy} from 'svelte'
  import {Spinner} from 'flowbite-svelte'
  import {UserSettingsSolid} from 'flowbite-svelte-icons'
  import {MENU_LINKS} from '$lib/constants'
  import {loading} from '$lib/store'

  let visibleLoading = false

  const unsubscribe = loading.subscribe(visible => {
    visibleLoading = visible
  })

  onDestroy(() => {
    unsubscribe()
  })
</script>

<div id="contents">
  <header>
    <UserSettingsSolid color="orange"/>
    <span class="text-orange-600">Developer Tool</span>
  </header>
  <div id="body">
    <div id="menu">
      {#each MENU_LINKS as item}
        <div>
          <a href={item.href}>{item.name}</a>
        </div>
      {/each}
    </div>
    <main>
      <slot/>
    </main>
  </div>
</div>

{#if visibleLoading}
  <div class="loading">
    <Spinner color="green" size="20"/>
  </div>
{/if}

<style lang="postcss">
  header {
    @apply flex gap-3 items-center;
  }

  #menu {
    &> div {
      @apply p-3 border-b;
      a {
        @apply font-medium;
      }
    }
  }

  .loading {
    @apply border border-red-900 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black opacity-30;
    z-index: 1000;
  }
</style>
