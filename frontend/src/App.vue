<script>
  import PersonEditor from './components/PersonEditor.vue'
  import PersonsList from './components/PersonsList.vue'

  export default {
    components: { PersonEditor, PersonsList },
    data() {
      return {
        showPersonEditor: false,
        popup: {
          on: false,
          color: 'success',
          text: ''
        }
      }
    },
    methods: {
      saved() {
        this.showPersonEditor = false
        this.popup.color = 'success'
        this.popup.text = 'Zapisano'
        this.popup.on = true
      },
      notsaved(data) {
        this.showPersonEditor = false
        this.popup.color = 'error'
        this.popup.text = data
        this.popup.on = true
      }
    }
  }
</script>

<template>
  <main>
    <v-btn variant="elevated" color="primary" @click="showPersonEditor = true">Nowa osoba</v-btn>
    <PersonsList/>
</main>

  <v-dialog v-model="showPersonEditor">
    <PersonEditor @cancel="showPersonEditor = false" @ok="saved" @error="notsaved"/>
  </v-dialog>

  <v-snackbar v-model="popup.on" :color="popup.color">
    <div style="width: 100%; text-align: center;">{{ popup.text }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>
