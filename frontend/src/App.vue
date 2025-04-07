<script>
  import Dashboard from './components/Dashboard.vue'
  import PersonsList from './components/PersonsList.vue'

  export const routes = [
    { path: '/', component: Dashboard, title: 'Dashboard', icon: 'mdi-home' },
    { path: '/persons', component: PersonsList, title: 'Persons', icon: 'mdi-account-multiple-outline' }
  ]

  export default {
    components: { Dashboard, PersonsList },
    data() {
      return {
        routes,
        operational: false,
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
    },
    mounted() {
      fetch('/api/test')
      .then(res => res.json()
        .then(_ => { this.operational = true })
        .catch(err => { this.error('Uszkodzona odpowiedź z backendu') }))
      .catch(err => {
        this.error(err.message)
      })
    }
  }
</script>

<template>
  <v-app v-if="operational">
    <v-navigation-drawer permanent density="compact">
      <v-list nav>
        <v-list-item v-for="route in routes" :prepend-icon="route.icon" :title="route.title" :to="route.path"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view @saved="ok" @error="error"/>
    </v-main>
  </v-app>

  <v-snackbar v-model="popup.on" :color="popup.color">
    <div style="width: 100%; text-align: center;">{{ popup.text }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>
