<script>
export default {
  emits: ['ok', 'cancel', 'error'],
  props: ['person'],
  data() {
    return {
      input: { firstName: '', lastName: '', birthDate: '1970-01-01' },
      showConfirmDialog: false  // Controls the visibility of the confirmation dialog
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
    },
    modify() {
      fetch('/api/person', {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.input)
      }).then(res => res.json().then(body => {
        if (body.error) {
          this.$emit('error', body.error)
        } else {
          this.$emit('ok')
        }
      }))
    },
    confirmDelete() {
      // Show confirmation dialog
      this.showConfirmDialog = true;
    },
    remove() {
      fetch('/api/person?_id=' + this.input._id, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json' }
      }).then(res => res.json().then(body => {
        if(body.error) {
          this.$emit('error', body.error)
        } else {
          this.$emit('ok')
        }
      }))
      this.showConfirmDialog = false; // Close the dialog
    }
  },
  mounted() {
    this.person.birthDate = this.person.birthDate.slice(0, 10)
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
      <v-btn variant="elevated" color="error" @click="confirmDelete" v-if="input._id">Usuń</v-btn>
      <v-btn variant="elevated" @click="$emit('cancel')">Anuluj</v-btn>
    </v-card-actions>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Potwierdź usunięcie</v-card-title>
        <v-card-text>Na pewno chcesz usunąć tę osobę?</v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="showConfirmDialog = false">Nie</v-btn>
          <v-btn color="blue darken-1" text @click="remove">Tak</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
</style>
