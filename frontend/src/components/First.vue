<script>
  export default {
    data() {
        return {
            input: { firstName: '', lastName: '' }
        }
    },
    methods: {
        send() {
            fetch('/api/person', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => res.json().then(body => {
                alert(JSON.stringify(body))
            }))
        }
    }
  }
</script>

<template>
    <v-card
      class="mx-auto my-8"
      elevation="16"
      max-width="344"
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
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" color="primary" @click="send">Akcja</v-btn>
      </v-card-actions>
    </v-card>
  </template>

<style scoped>
</style>
