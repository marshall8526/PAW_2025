<script>
  import common from './mixins/common.js' 
  import LoginDialog from './components/LoginDialog.vue'
  import LogoutDialog from './components/LogoutDialog.vue'
  import Dashboard from './components/Dashboard.vue'
  import PersonsList from './components/PersonsList.vue'

  export const routes = [
    { path: '/', component: Dashboard, title: 'Pulpit', icon: 'mdi-home' },
    { path: '/persons', component: PersonsList, title: 'Osoby', icon: 'mdi-account-multiple-outline', roles: [ 0, 1 ] }
  ]

  export default {
    mixins: [ common ],
    components: { LoginDialog, LogoutDialog, Dashboard, PersonsList },
    data() {
      return {
        routes,
        operational: false,
        session: {},
        loginDialog: false,
        logoutDialog: false,
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
      error(data, timeout = 3000) {
        this.popup.color = 'error'
        this.popup.text = data
        this.popup.timeout = timeout
        this.popup.on = true
      },
      whoami() {
        fetch('/api/auth')
        .then(res => res.json()
          .then(data => { 
            this.operational = true
            this.session = data 
          })
          .catch(err => { this.error('Uszkodzona odpowiedź z backendu', -1) }))
        .catch(err => {
        this.error(err.message, -1)
      })},
      onLogin() {
        this.loginDialog = false
        this.whoami()
        this.$router.push('/')
      },
      onLogout() {
        this.logoutDialog = false
        this.whoami()
        this.$router.push('/')
      }
    },
    mounted() {
      this.whoami()
    }
  }
</script>

<template>
  <v-app v-if="operational">
    <v-navigation-drawer permanent density="compact">
      <v-list nav>
        <v-list-item v-for="route in routes" :prepend-icon="route.icon" :title="route.title" :to="route.path" v-show="!route.roles || checkIfInRole(session, route.roles)"></v-list-item>
        <v-list-item prepend-icon="mdi-login" title="Login" @click="loginDialog = true" v-if="!session.username"></v-list-item>
        <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logoutDialog = true" v-if="session.username"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view @saved="ok" @error="error" :session="session"/>
    </v-main>
  </v-app>

  <v-dialog v-model="loginDialog" width="33%">
      <LoginDialog @close="onLogin" />
    </v-dialog>

    <v-dialog v-model="logoutDialog" width="33%">
      <LogoutDialog @close="onLogout" />
    </v-dialog>

  <v-snackbar v-model="popup.on" :color="popup.color" :timeout="popup.timeout">
    <div style="width: 100%; text-align: center;">{{ popup.text }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>
