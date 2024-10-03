import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { StyleControl } from '../../../models/stylecontrol';
import * as turf from '@turf/turf';
import { GeoserverDataService } from '../../../services/geoserver/geoserver-data.service';
import { environment } from '../../../environments/environment.dev';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() defaultCenter: [number, number] = [100.5018, 13.7563];
  @Input() defaultZoom: number = 8;
  map!: maplibregl.Map;
  currentRoute: string = '';
  constructor(private GeoDataService: GeoserverDataService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.currentRoute = this.route.snapshot.routeConfig?.path || ''; // Get the current route path
    this.initializeMap();
    this.setMapHeight(); // Set initial map height
  }

  //#region  Initailize Map libre
  initializeMap(): void {
    const savedZoom = localStorage.getItem('mapZoom');
    const savedCenter = localStorage.getItem('mapCenter');

    if (this.currentRoute === 'live-monitor') {
      this.map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=89niYR6Aow3J66RlqxlA', // Default style
        center: savedCenter ? JSON.parse(savedCenter) : this.defaultCenter,
        zoom: savedZoom ? parseFloat(savedZoom) : this.defaultZoom,
      });
      this.loadRoadData();
    } else if (this.currentRoute === 'editor-map') {
      this.map = new maplibregl.Map({
        container: 'map',
        style: { // Custom style for the editor map
          'version': 8,
          'sources': {
            'raster-tiles': {
              'type': 'raster',
              'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              'tileSize': 256,
              'minzoom': 0,
              'maxzoom': 19
            }
          },
          'layers': [
            {
              'id': 'background',
              'type': 'background',
              'paint': { 'background-color': '#e0dfdf' }
            },
            {
              'id': 'simple-tiles',
              'type': 'raster',
              'source': 'raster-tiles'
            }
          ]
        },
        center: [-87.61694, 41.86625],
        zoom: 15.99,
        pitch: 40,
        bearing: 20,
        antialias: true
      });

      this.map.on('load', () => {
        this.map.addSource('floorplan', {
          // GeoJSON Data source used in vector tiles, documented at
          // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
          'type': 'geojson',
          'data': 'https://maplibre.org/maplibre-gl-js/docs/assets/indoor-3d-map.geojson'
        });
        this.map.addLayer({
          'id': 'room-extrusion',
          'type': 'fill-extrusion',
          'source': 'floorplan',
          'paint': {
            // See the MapLibre Style Specification for details on data expressions.
            // https://maplibre.org/maplibre-style-spec/expressions/

            // Get the fill-extrusion-color from the source 'color' property.
            'fill-extrusion-color': ['get', 'color'],

            // Get fill-extrusion-height from the source 'height' property.
            'fill-extrusion-height': ['get', 'height'],

            // Get fill-extrusion-base from the source 'base_height' property.
            'fill-extrusion-base': ['get', 'base_height'],

            // Make extrusions slightly opaque for see through indoor walls.
            'fill-extrusion-opacity': 0.5
          }
        });
      });
    }

    this.initialMapController();
    this.mapEvents();
  }

  initialMapController() {
    this.map.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right');
    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    this.map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
    }), 'bottom-right');
    this.map.addControl(new StyleControl(), 'bottom-left');
  }

  mapEvents(): void {
    this.map.on('zoomend', () => {
      const zoomLevel = this.map.getZoom();
      localStorage.setItem('mapZoom', zoomLevel.toString());
    });
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      localStorage.setItem('mapCenter', JSON.stringify([center.lng, center.lat]));
    });
  }

  //#endregion


  //#region  Initialize Raster Layer && Road 
  addRasterOnMap(): void {
    const rasterSourceId = 'my-raster-source'; // Define a unique ID for the source
    const rasterLayerId = 'my-raster-layer'; // Define a unique ID for the layer
    const name = '02';
    const url = `http://138.197.163.159:8000/geoserver/gis/wms?service=WMS&version=1.1.0&request=GetMap&layers=gis%3A${name}&bbox={bbox-epsg-3857}&width=512&height=512&srs=EPSG%3A3857&styles=&format=image%2Fpng&TRANSPARENT=true` // Adjust the URL to use 'image/png' for raster tiles

    // Add the WMS source
    this.map.addSource(rasterSourceId, {
      type: 'raster',
      tiles: [
        url
      ],
      tileSize: 512, // Define tile size
    });

    // Add the raster layer using the source
    this.map.addLayer({
      id: rasterLayerId,
      type: 'raster',
      source: rasterSourceId,
      minzoom: 0,
      maxzoom: 22,
    });

    // Retrieve the BBOX of the added raster layer
    this.getRasterLayerBbox(rasterSourceId, name);
  }

  getRasterLayerBbox(sourceId: string, name: string): void {
    const source = this.map.getSource(sourceId);
    let bbox = ''
    if (source) {
      this.GeoDataService.GetLayerDetail(`${environment.geosever}/geoserver/rest/workspaces/gis/coveragestores/${name}/coverages/${name}.json`).subscribe(res => {
        bbox = [
          res.coverage.nativeBoundingBox.minx,  // minX
          res.coverage.nativeBoundingBox.miny, // minY
          res.coverage.nativeBoundingBox.maxx,  // maxX
          res.coverage.nativeBoundingBox.maxy   // maxY
        ].join(','); // Format as "minX,minY,maxX,maxY"
        // console.log('BBOX of the raster layer:', bbox);
        this.setRoadOnMap(bbox)
      })
      // If the source exists, calculate the BBOX based on the current map bounds
      // const bounds = this.map.getBounds();

    } else {
      console.error(`Source "${sourceId}" does not exist.`);
    }
  }


  loadRoadData(): void {
    this.map.on('load', () => {
      this.addRasterOnMap();
    });
  }

  setRoadOnMap(bbox: string) {
    const data = `http://138.197.163.159:8080/geoserver/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gis:thailand_road&BBOX=${bbox}&outputFormat=application/json`
    fetch(data)
      .then(response => response.json())
      .then(data => {
        // Decode the road names
        data.features.forEach((feature: any) => {
          if (feature.properties.name) {
            feature.properties.name = decodeUtf8Text(feature.properties.name); // Decode the name
          }
        });
        
        // Add the decoded data as a source to the map
        this.map.addSource('thailand-roads', {
          type: 'geojson',
          data: data
        });

        // Add the layer to display the roads
        this.map.addLayer({
          id: 'roads-layer',
          type: 'line',
          source: 'thailand-roads',
          paint: {
            'line-color': 'rgba(255, 255, 255, 0.7)',
            'line-width': 2
          }
        });
        

        // Add a layer to display the road names
        this.map.addLayer({
          id: 'roads-name-layer',
          type: 'symbol',
          source: 'thailand-roads',
          layout: {
            'text-field': ['get', 'name'], // Use the decoded name field
            // 'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 12,
            'symbol-placement': 'line',
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 2
          }
        });
      })
      .catch(error => {
        console.error('Error fetching or processing the data:', error);
      });

    // Function to decode UTF-8 text
    function decodeUtf8Text(text: string): string {
      try {
        return decodeURIComponent(escape(text));
      } catch (e) {
        console.error('Error decoding text:', e);
        return text; // Fallback to the original if decoding fails
      }
    }
  }

  //#endregion

  // Listen for window resize events to adjust map height
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.setMapHeight();
  }

  setMapHeight(): void {
    // const navbarHeight = document.querySelector('.navbar')?.clientHeight || 0; // Get navbar height
    // const mapContainer = document.getElementById('map');
    // if (mapContainer) {

    //   mapContainer.style.height = `${window.innerHeight - navbarHeight}px`; // Set map height
    // }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}


