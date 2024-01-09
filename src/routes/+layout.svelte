<script lang="ts">
  import '../app.postcss'
  import {onDestroy} from 'svelte'
  import type {Unsubscriber} from 'svelte/store'
  import {Spinner, Toast} from 'flowbite-svelte'
  import {UserSettingsSolid, CheckCircleSolid} from 'flowbite-svelte-icons'
  import {MENU_LINKS} from '$lib/constants'
  import {loading, toastMessage} from '$lib/store'

  let visibleLoading = false
  let toast = ''

  const unsubscribes: Unsubscriber[] = []

  unsubscribes.push(loading.subscribe(visible => {
    visibleLoading = visible
  }))

  unsubscribes.push(toastMessage.subscribe(item => {
    toast = item.text
    setTimeout(() => {
      toast = ''
    }, item.ttl)
  }))

  onDestroy(() => {
    unsubscribes.forEach(unsubscribe => {
      unsubscribe()
    })
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

{#if toast.length > 0}
  <Toast color="green" class="fixed right-10 bottom-10">
    <svelte:fragment slot="icon">
      <CheckCircleSolid class="w-5 h-5" />
      <span class="sr-only">Check icon</span>
    </svelte:fragment>
    {toast}
  </Toast>
{/if}

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
