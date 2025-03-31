<script>
  export default {
    emits: [ 'ok', 'cancel', 'error' ],
    props: [ 'person' ],
    data() {
        return {
            input: { firstName: '', lastName: '', birthDate: '1970-01-01' }
        }
    },
    methods: {
        save() {
            fetch('/api/person', {
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
        }
    },
    mounted() {
      Object.assign(this.input, this.person)
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
          Osoba
        </v-card-title>
  
        <v-card-subtitle>
          Dane personalne
        </v-card-subtitle>
      </v-card-item>
  
      <v-card-text>
        <v-text-field label="Imię" variant="outlined" v-model="input.firstName"></v-text-field>
        <v-text-field label="Nazwisko" variant="outlined" v-model="input.lastName"></v-text-field>
        <v-text-field label="Data urodzenia" type="date" variant="outlined" v-model="input.birthDate"></v-text-field>
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
