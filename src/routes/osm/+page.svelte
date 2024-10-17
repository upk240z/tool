<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import 'leaflet/dist/leaflet.css'
  import type {LatLng} from 'leaflet'
  import {Badge, Button} from 'flowbite-svelte'
  import {FileCopyOutline} from 'flowbite-svelte-icons'
  import {copyClip} from '$lib/utils'
  import {setItem, getItem} from '$lib/store'

  let L
  let map
  let marker
  let pin: LatLng
  let zoom = 0

  const updateMapInfo = () => {
    if (!map || !marker) { return }
    pin = marker.getLatLng()
    zoom = map.getZoom()
  }

  const init = async () => {
    if (typeof window !== 'undefined') {
      const leaflet = await import('leaflet')
      L = leaflet.default
      const info = getItem('map-info', {lat: 35.681214840041115, lng: 139.76672452484132, zoom: 15})
      map = L.map('map').setView([info.lat, info.lng], info.zoom)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 22,
      }).addTo(map)
      map.on('zoom', updateMapInfo)

      const pos: LatLng = map.getCenter()
      marker = L.marker([pos.lat, pos.lng], {
        draggable: true,
        title: 'My marker',
        icon: L.icon({iconUrl: 'marker-icon.png'}),
      })
      marker.on('dragend', updateMapInfo)
      marker.addTo(map)

      updateMapInfo()
    }
  }

  onMount(async () => {
    await init()
  })

  onDestroy(() => {
    if (map) {
      const pos: LatLng = marker.getLatLng()
      if (pos) {
        setItem('map-info', {lat: pos.lat, lng: pos.lng, zoom: map.getZoom()})
      }
    }
  })
</script>

<h1>Map(Open street map)</h1>

<section class="mt-5 h-full">
  <div id="map" class="mt-5"></div>
  {#if pin}
  <div class="mt-5 flex gap-3 items-center justify-center">
    <Badge large color="green">Zoom</Badge>
    <span>{zoom}</span>
    <Badge large color="blue">Lat</Badge>
    <span>{pin.lat}</span>
    <Badge large color="blue">Lng</Badge>
    <span>{pin.lng}</span>
    <Button size="sm" on:click={() => copyClip(pin.lat + ' ' + pin.lng)}>
      <FileCopyOutline size="sm"/>
    </Button>
  </div>
  {/if}
</section>

<style lang="postcss">
  #map {
    @apply w-full h-3/4;
  }
</style>
