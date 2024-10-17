import * as MapLoader from '@googlemaps/js-api-loader'

type MAP_POSITION = {
  lat: number,
  lng: number,
}

type MAP_OPTION = {
  center: MAP_POSITION,
  zoom?: number
}

export default class Map {
  private _map: google.maps.Map | null = null
  private readonly elementId: string
  private readonly option: MAP_OPTION
  private loader: MapLoader.Loader
  private markerPin: google.maps.Marker | undefined

  constructor(
    elementId: string,
    option: MAP_OPTION,
    apiKey: string
  ) {
    if (option.zoom === undefined) {
      option.zoom = 15
    }

    this.elementId = elementId
    this.option = option

    this.loader = new MapLoader.Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    })
  }

  public async init(onChange: () => void) {
    const {Map} = await this.loader.importLibrary('maps')
    this._map = new Map(document.getElementById(this.elementId) as HTMLElement, this.option)

    this.markerPin = new google.maps.Marker({
      map: this._map,
      position: this._map.getCenter(),
      draggable: true,
    })

    this.markerPin.addListener('dragend', onChange)
    this._map.addListener('zoom_changed', onChange)
  }

  public center() {
    if (!this._map) { return undefined }
    return this._map.getCenter()
  }

  public pinPosition() {
    if (!this.markerPin) { return undefined }
    return this.markerPin.getPosition()
  }

  public zoom() {
    if (!this._map) { return 0 }
    return this._map.getZoom()
  }

  public markerWithIcon(lat: number, lng: number, url: string, size: number) {
    if (this._map === null) {
      console.log('failed initialization')
      return
    }

    const icon: google.maps.Icon = {
      url,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    }

    new google.maps.Marker({
      map: this._map,
      position: new google.maps.LatLng(
        lat, lng
      ),
      icon,
    })
  }

  public markerWithCircle(lat: number, lng: number, url: string, size: number, color: string) {
    if (this._map === null) {
      console.log('failed initialization')
      return
    }

    this.markerWithIcon(lat, lng, url, size)

    new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.2,
      map: this._map,
      center: new google.maps.LatLng(
        lat, lng
      ),
      radius: size * 3
    })
  }
}
