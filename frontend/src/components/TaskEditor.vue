<script>
export default {
  emits: ['ok', 'cancel', 'error'],
  props: ['task'],
  data() {
    return {
      input: {},
      projectItems: [],
      personItems: [],
      responsibleOptions: []
    }
  },
  methods: {
    save() {
      fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.input)
      }).then(res => res.json().then(body => {
        if (body.error) this.$emit('error', body.error)
        else this.$emit('ok')
      }))
    },
    modify() {
      fetch('/api/task', {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.input)
      }).then(res => res.json().then(body => {
        if (body.error) this.$emit('error', body.error)
        else this.$emit('ok')
      }))
    },
    remove() {
      fetch('/api/task?_id=' + this.input._id, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json' }
      }).then(res => res.json().then(body => {
        if (body.error) this.$emit('error', body.error)
        else this.$emit('ok')
      }))
    },
    updateResponsibleOptions() {
      const selectedWorkerIds = new Set()
      for (const project of this.projectItems) {
        if (this.input.project_ids?.includes(project._id)) {
          for (const id of project.worker_ids) {
            selectedWorkerIds.add(id)
          }
        }
      }
      this.responsibleOptions = this.personItems.filter(p => selectedWorkerIds.has(p._id))
    }
  },
  watch: {
    'input.project_ids': {
      handler() {
        this.updateResponsibleOptions()
      },
      deep: true
    }
  },
  async mounted() {
    this.input = {
      _id: this.task._id || undefined,
      name: this.task.name || '',
      start_date: this.task.start_date?.substring(0, 10) || new Date().toISOString().substring(0, 10),
      end_date: this.task.end_date?.substring(0, 10) || '',
      responsible_id: this.task.responsible_id || null,
      project_ids: Array.isArray(this.task.project_ids) ? [...this.task.project_ids] : []
    }
    console.log(this.task);

    try {
      const peopleResponse = await fetch('/api/person?sort=lastName&order=asc')
      const peopleResult = await peopleResponse.json()
      this.personItems = peopleResult.data

      const projectResponse = await fetch('/api/project')
      const projectResult = await projectResponse.json()
      this.projectItems = projectResult.data

      // тільки після обох запитів
      this.updateResponsibleOptions()

    } catch (err) {
      console.error('Błąd ładowania danych:', err)
      console.log('errrrorrrrrrrrrr', err);
      this.$emit('error', err)
    }
  }
}
</script>

<template>
  <v-card class="mx-auto my-4" elevation="16" width="600">
    <v-card-item>
      <v-card-title>Zadanie</v-card-title>
      <v-card-subtitle>Dane</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-text-field label="Nazwa" variant="outlined" v-model="input.name" />
      <v-text-field label="Data rozpoczęcia" variant="outlined" type="date" v-model="input.start_date" />
      <v-text-field label="Data zakończenia" variant="outlined" type="date" v-model="input.end_date" />

      <v-autocomplete variant="outlined" label="Projekty" v-model="input.project_ids" :items="projectItems"
        item-title="name" item-value="_id" multiple chips closable-chips />

      <v-autocomplete variant="outlined" label="Odpowiedzialny" v-model="input.responsible_id"
        :items="responsibleOptions" :item-title="item => item.firstName + ' ' + item.lastName" item-value="_id" chips
        closable-chips />
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