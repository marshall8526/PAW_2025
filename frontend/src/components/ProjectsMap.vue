    
<script>
import 'leaflet/dist/leaflet.css'
import 'vue-map-ui/dist/normalize.css'
import 'vue-map-ui/dist/style.css'
import 'vue-map-ui/dist/theme-all.css'

import { VMap, VMapOsmTileLayer, VMapZoomControl, VMapIconMarker } from 'vue-map-ui'

import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const defaultCoords = { lat: 52.2297, lng: 21.0122 }  

export default {
  components: { VMap, VMapOsmTileLayer, VMapZoomControl, VMapIconMarker },
  data() {
    return {
      markerIconUrl, markerIconRetinaUrl, markerShadowUrl,
      center: defaultCoords,
      zoom: 12,
      markers: [],
      selected: 0
    }
  },
  methods: {
    selectProject() {
      this.center = { lat: this.markers[this.selected].lat, lng: this.markers[this.selected].lng }
      this.$refs.vmap.map.flyTo(this.center)
    },
    onMarkerClick(marker, index) {
      this.selected = index
      this.selectProject()
    },
    onViewChanged(event) {
      this.center = event.center
    }
  },
  mounted() {
    const queryString = { sort: 'created', order: 'asc', limit: 100 }
    fetch('/api/project?' + new URLSearchParams(queryString).toString())
      .then(res => res.json())
      .then(result => { 
        this.markers = result.data.map(project => ({
          title: project.name,
          lat: !(project.coords && project.coords.lat) ? defaultCoords.lat : project.coords.lat,
          lng: !(project.coords && project.coords.lng) ? defaultCoords.lng : project.coords.lng
        }))
        if(this.markers.length) {
          this.center = this.markers[0]
        }
      })
  }
}
</script>

<template>
  <div v-if="markers.length > 0">
    <v-select variant="outlined" label="Projekt"
          v-model="selected"
          :items="markers.map((item, index) => ({ value: index, title: item.title }))"
          @update:model-value="selectProject"
    />
    <VMap ref="vmap" style="height: 700px;" :center="center" :zoom="zoom" @view-changed="onViewChanged">
      <template v-for="(marker, index) in markers" :key="index">
        <VMapIconMarker ref="vmarker" v-model:latlng="markers[index]"
          :icon-url="markerIconUrl"
          :icon-retina-url="markerIconRetinaUrl"
          :icon-shadow-url="markerShadowUrl"
          :icon-size="[28, 46]"
          :icon-anchor="[17, 46]"
          :opacity="index == selected ? 1 : 0.5"
          @mousedown="onMarkerClick(marker, index)"
        ></VMapIconMarker>
      </template>
      <VMapOsmTileLayer/>
      <VMapZoomControl/>
    </VMap>

    <div v-if="markers.length == 0">
      Brak projektów
    </div>

</div>
</template>

<style scoped>
</style>