<script lang="ts">
  import '../app.postcss'
  import {UserSettingsSolid} from 'flowbite-svelte-icons'
  import {MENU_LINKS} from '$lib/constants'
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
</style>
