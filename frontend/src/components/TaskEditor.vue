<script>
export default {
  emits: ['ok', 'cancel', 'error'],
  props: ['task'],
  data() {
    return {
      input: {},
      notes: [],
      projectItems: [],
      personItems: [],
      responsibleOptions: [],
      newNote: {
        type: null,
        content: '',
        file: null
      }

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
    },
    async submitNote() {
      if (![1, 2, 3].includes(this.newNote.type)) return

      const formData = new FormData()
      formData.append('type', this.newNote.type)

      if (this.newNote.type === 1) {
        if (!this.newNote.content.trim()) return
        formData.append('content', this.newNote.content.trim())
      } else {
        if (!this.newNote.file) return
        formData.append('file', this.newNote.file)
      }

      try {
        const res = await fetch(`/api/task/${this.input._id}/notes`, {
          method: 'POST',
          body: formData
        })
        const result = await res.json()
        if (res.ok) {
          this.notes.push(result)
          this.newNote = { type: null, content: '', file: null }
        } else {
          console.error('Błąd:', result.error)
        }
      } catch (e) {
        console.error('Błąd dodawania notatki:', e)
      }
    },
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
      responsible_id: this.task?.responsibleDetails?._id || null,
      project_ids: Array.isArray(this.task.projects) ? [...this.task.projects.map((p) => p._id)] : []
    }
    if (this.input._id) {
      try {
        const notesRes = await fetch(`/api/task/${this.input._id}/notes`)
        this.notes = await notesRes.json()
      } catch (e) {
        console.error('Błąd ładowania notatek:', e)
      }
    }

    try {
      const peopleResponse = await fetch('/api/person?sort=lastName&order=asc')
      const peopleResult = await peopleResponse.json()
      this.personItems = peopleResult.data

      const projectResponse = await fetch('/api/project')
      const projectResult = await projectResponse.json()
      this.projectItems = projectResult.data

      this.updateResponsibleOptions()

    } catch (err) {
      console.error('Błąd ładowania danych:', err)
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

  <v-card class="mx-auto" elevation="8" width="600" height="400" style="overflow-y: auto;">
    <v-card-title class="pb-0">Notatki</v-card-title>
    <v-divider class="mb-2"></v-divider>

    <v-container fluid class="py-0">
      <!-- Список нотаток -->
      <v-row dense no-gutters v-for="note in notes" :key="note._id" class="mb-3">
        <v-col cols="12">
          <v-sheet elevation="1" rounded class="pa-3 mx-2 bg-grey-lighten-3">
            <div class="text-caption text-medium-emphasis mb-2">
              <v-icon :icon="note.type === 1 ? 'mdi-note-text' : note.type === 2 ? 'mdi-image' : 'mdi-volume-high'"
                size="18" class="mr-1" />
              {{ note.type === 1 ? 'Tekst' : note.type === 2 ? 'Obraz' : 'Dźwięk' }}
              – {{ new Date(note.created).toLocaleString() }}
            </div>

            <div v-if="note.type === 1" class="text-body-2">{{ note.content }}</div>

            <v-img v-else-if="note.type === 2" :src="note.content" max-width="100%" max-height="200" contain
              class="my-2 rounded" />

            <audio v-else-if="note.type === 3" controls style="width: 100%" class="my-2">
              <source :src="note.content" type="audio/mpeg" />
            </audio>
          </v-sheet>
        </v-col>
      </v-row>

      <!-- Додавання нової нотатки -->
      <v-row class="mt-4 pa-3 bg-grey-lighten-4 rounded mx-1" no-gutters align="stretch">
        <v-col cols="12" sm="4" class="d-flex">
          <v-select v-model="newNote.type" :items="[
            { title: 'Tekst', value: 1 },
            { title: 'Obraz', value: 2 },
            { title: 'Dźwięk', value: 3 }
          ]" label="Typ notatki" variant="outlined" density="compact" class="h-100" />
        </v-col>

        <v-col cols="12" sm="6" v-if="newNote.type === 1">
          <v-textarea v-model="newNote.content" label="Treść notatki" auto-grow variant="outlined" density="compact" />
        </v-col>

        <v-col cols="12" sm="6" v-else-if="[2, 3].includes(newNote.type)">
          <v-file-input v-model="newNote.file" :label="newNote.type === 2 ? 'Obraz' : 'Dźwięk'" accept="image/*,audio/*"
            show-size variant="outlined" density="compact" />
        </v-col>

        <v-col cols="12" sm="2" class="d-flex">
          <v-btn color="primary" variant="elevated" class="h-100" @click="submitNote" block>
            Dodaj
          </v-btn>
        </v-col>
      </v-row>

    </v-container>
  </v-card>
</template>