<script>
  export default {
    emits: [ 'ok', 'cancel', 'error' ],
    props: [ 'project' ],
    data() {
        return {
            input: { name: '', manager_id: null, worker_ids: [] },
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
        }
    },
    mounted() {
      const queryString = { sort: 'lastName', order: 'asc' }
      fetch('/api/person?' + new URLSearchParams(queryString).toString())
      .then(res => res.json().then(result => {
          this.personItems = result.data
      }))
      Object.assign(this.input, this.project)
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
            chips closable-chips label="Workers" multiple
            :items="personItems" :item-title="item => item.firstName + ' ' + item.lastName" item-value="_id"
        ></v-autocomplete>
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
