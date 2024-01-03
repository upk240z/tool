<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import {Badge, Button, FloatingLabelInput} from 'flowbite-svelte'
  import {CopySolid} from 'flowbite-svelte-icons'
  import Map from '$lib/map'
  import {copyClip} from '$lib/utils'
  import {setItem, getItem} from '$lib/store'

  let map: Map
  let pin = {lat: 0, lng: 0}
  let apiKey = ''

  const writePinPosition = () => {
    const pos = map.pinPosition()
    if (pos) {
      pin.lat = pos.lat()
      pin.lng = pos.lng()
    }
  }

  const init = async () => {
    if (apiKey.length == 0) { return }
    const info = getItem('map-info', {lat: 35.681214840041115, lng: 139.76672452484132, zoom: 15})
    map = new Map('map', {
      center: {lat: info.lat, lng: info.lng},
      zoom: info.zoom
    }, apiKey)
    await map.init(writePinPosition)
    writePinPosition()
  }

  onMount(() => {
    apiKey = getItem('map-key', '')
    init()
  })

  onDestroy(() => {
    if (map) {
      setItem('map-key', apiKey)
      const pos = map.pinPosition()
      if (pos) {
        setItem('map-info', {lat: pos.lat(), lng: pos.lng(), zoom: map.zoom()})
      }
    }
  })
</script>

<h1>Map</h1>

<section class="mt-5 h-full">
  <FloatingLabelInput style="outlined" bind:value={apiKey} on:change={init}>API key</FloatingLabelInput>
  <div id="map" class="mt-5"></div>
  <div class="mt-5 flex gap-3 items-center justify-center">
    <Badge large color="blue">Lat</Badge>
    <span>{pin.lat}</span>
    <Badge large color="blue">Lng</Badge>
    <span>{pin.lng}</span>
    <Button size="sm" on:click={() => copyClip(pin.lat + ' ' + pin.lng)}>
      <CopySolid size="sm"/>
    </Button>
  </div>
</section>

<style lang="postcss">
  #map {
    @apply w-full h-3/4;
  }
</style>
