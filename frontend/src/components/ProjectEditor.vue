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
    emits: [ 'ok', 'cancel', 'error' ],
    props: [ 'project' ],
    components: { VMap, VMapOsmTileLayer, VMapZoomControl, VMapIconMarker },
    data() {
        return {
            markerIconUrl, markerIconRetinaUrl, markerShadowUrl,
            center: {},
            input: {},
            personItems: []
        }
    },
    methods: {
        save() {
            fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => res.json().then(body => {
                if(body.error) {
                  this.$emit('error', body.error)
                } else {
                  this.$emit('ok')
                }
            }))
        },
        modify() {
            fetch('/api/project', {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => res.json().then(body => {
                if(body.error) {
                  this.$emit('error', body.error)
                } else {
                  this.$emit('ok')
                }
            }))
        },
        remove() {
            fetch('/api/project?_id=' + this.input._id, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            }).then(res => res.json().then(body => {
                if(body.error) {
                  this.$emit('error', body.error)
                } else {
                  this.$emit('ok')
                }
            }))
        },
        setMarker(event) {
          this.input.coords = event.latlng
        }
    },
    mounted() {
      const queryString = { sort: 'lastName', order: 'asc' }
      fetch('/api/person?' + new URLSearchParams(queryString).toString())
      .then(res => res.json().then(result => {
          this.personItems = result.data
      }))
      Object.assign(this.input, this.project)
      this.input.coords = {}
      if(!this.project.coords || !this.project.coords.lat || !this.project.coords.lng) {
        Object.assign(this.input.coords, defaultCoords) 
      } else {
        Object.assign(this.input.coords, this.project.coords)
      }
      Object.assign(this.center, this.input.coords)
    }
  }
</script>

<template>
    <v-card
      class="mx-auto my-4"
      elevation="16"
      width="600"
    >
      <v-card-item>
        <v-card-title>
          Projekt
        </v-card-title>
  
        <v-card-subtitle>
          Dane
        </v-card-subtitle>
      </v-card-item>
  
      <v-card-text>
        <v-text-field label="Nazwa" variant="outlined" v-model="input.name"></v-text-field>
        <v-autocomplete variant="outlined" v-model="input.manager_id"
            chips closable-chips label="Manager"
            :items="personItems" :item-title="item => item.firstName + ' ' + item.lastName" item-value="_id"
        ></v-autocomplete>
        <v-autocomplete variant="outlined" v-model="input.worker_ids"
            chips closable-chips label="Pracownicy" multiple
            :items="personItems" :item-title="item => item.firstName + ' ' + item.lastName" item-value="_id"
        ></v-autocomplete>
        <VMap ref="vmap" style="height: 200px;" :center="center" zoom="15" @click="setMarker">
            <VMapIconMarker ref="vmarker" v-model:latlng="input.coords"
              :icon-url="markerIconUrl"
              :icon-retina-url="markerIconRetinaUrl"
              :icon-shadow-url="markerShadowUrl"
              :icon-size="[28, 46]"
              :icon-anchor="[17, 46]"
              draggable
            ></VMapIconMarker>
            <VMapOsmTileLayer/>
            <VMapZoomControl/>
          </VMap>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" color="primary" @click="save" v-if="!input._id">Zapisz</v-btn>
        <v-btn variant="elevated" color="primary" @click="modify" v-if="input._id">Zmień</v-btn>
        <v-btn variant="elevated" color="error" @click="remove" v-if="input._id">Usuń</v-btn>
        <v-btn variant="elevated" @click="$emit('cancel')">Anuluj</v-btn>
      </v-card-actions>
    </v-card>
  </template>

<style scoped>
</style>
