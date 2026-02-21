<script lang="ts">
  import {CaretRightSolid} from 'flowbite-svelte-icons'

  export let value: any
  export let key: string | undefined = undefined
  export let depth: number = 0

  $: isObject = typeof value === 'object' && value !== null && !Array.isArray(value)
  $: isArray = Array.isArray(value)
  $: isComplex = isObject || isArray

  let collapsed = depth > 2

  function toggle() {
    collapsed = !collapsed
  }

  $: entries = isObject ? Object.entries(value) : isArray ? value.map((v: any, i: number) => [String(i), v]) : []
  $: count = entries.length
  $: bracket = isArray ? ['[', ']'] : ['{', '}']
</script>

<span class="text-xs">
  {#if key !== undefined}
    <span class="font-medium"
          class:text-red-500={key === 'STATUS_SERVICE_AVAILABILITY'}
          class:text-purple-500={key !== 'STATUS_SERVICE_AVAILABILITY'}>"{key}"</span>
    <span class="text-gray-500">: </span>
  {/if}

  {#if isComplex}
    <button
      class="inline-flex items-center text-gray-500 hover:text-gray-800 focus:outline-none"
      on:click={toggle}
      aria-label={collapsed ? 'expand' : 'collapse'}
    >
      <span class="text-sm mr-0.5" class:-rotate-90={collapsed}>▼</span>
    </button>
    <span class="text-gray-600">{bracket[0]}</span>

    {#if collapsed}
      <span class="text-gray-400 text-xs mx-1 bg-gray-100 px-1 rounded">
        {count} {isArray ? 'items' : 'keys'}
      </span>
      <span class="text-gray-600">{bracket[1]}</span>
    {:else}
      <div class="ml-4">
        {#each entries as [k, v], i}
          <div>
            <svelte:self value={v} key={isObject ? k : undefined} depth={depth + 1} />
            {#if i < count - 1}<span class="text-gray-400">,</span>{/if}
          </div>
        {/each}
      </div>
      <span class="text-gray-600">{bracket[1]}</span>
    {/if}
  {:else if typeof value === 'string'}
    <span class="text-green-700">"{value}"</span>
  {:else if typeof value === 'number'}
    <span class="text-blue-600">{value}</span>
  {:else if typeof value === 'boolean'}
    <span class="text-orange-600">{value}</span>
  {:else}
    <span class="text-gray-500">null</span>
  {/if}
</span>
