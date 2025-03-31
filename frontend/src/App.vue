<script>
  import PersonsList from './components/PersonsList.vue'

  export default {
    components: { PersonsList },
    data() {
      return {
        popup: {
          on: false,
          color: 'success',
          text: ''
        }
      }
    },
    methods: {
      ok(data) {
        this.popup.color = 'success'
        this.popup.text = data
        this.popup.on = true
      },
      error(data) {
        this.popup.color = 'error'
        this.popup.text = data
        this.popup.on = true
      }
    }
  }
</script>

<template>
  <main>
    <PersonsList @saved="ok" @error="error"/>
</main>

  <v-snackbar v-model="popup.on" :color="popup.color">
    <div style="width: 100%; text-align: center;">{{ popup.text }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>
