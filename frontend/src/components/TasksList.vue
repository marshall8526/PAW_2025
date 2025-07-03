<script>
import common from '../mixins/common.js'
import TaskEditor from './TaskEditor.vue'

export default {
  components: { TaskEditor },
  emits: ['saved', 'error'],
  props: ['session'],
  mixins: [common],
  data() {
    return {
      task: {},
      showTaskEditor: false,
      itemsPerPage: 10,
      headers: [
        { title: 'Nazwa', key: 'name' },
        { title: 'Rozpoczęcie', key: 'start_date' },
        { title: 'Zakończenie', key: 'end_date' },
        { title: 'Odpowiedzialny', key: 'responsibleName' },
        { title: '#projektów', key: 'numProjects' },
      ],
      loading: false,
      search: '',
      itemsLength: 0,
      serverItems: [],
      tableKey: 0
    }
  },
  methods: {
    loadItems({ page, itemsPerPage, sortBy }) {
      this.loading = true
      const skip = (page - 1) * itemsPerPage
      let queryString = { skip, limit: itemsPerPage, filter: this.search, ...sortBy }
      if (sortBy?.[0]) {
        queryString.sort = sortBy[0].key
        queryString.order = sortBy[0].order
      }
      fetch('/api/task?' + new URLSearchParams(queryString))
        .then(res => res.json().then(result => {
          this.itemsLength = result.count
          result.data.forEach(el => {
            el.responsibleName = el.responsibleName || '- brak -'
          })
          this.serverItems = result.data
          this.loading = false
        }))
    },
    clickItem(_, data) {
      if (!this.checkIfInRole(this.session, [0])) return
      this.task = data.item
      this.showTaskEditor = true
    },
    saved() {
      this.showTaskEditor = false
      this.tableKey++
      this.$emit('saved', 'Wykonano')
    },
    notsaved(data) {
      this.showTaskEditor = false
      this.$emit('error', data)
    },
    newTask() {
      this.task = {}
      this.showTaskEditor = true
    }
  }
}
</script>

<template>
  <v-card variant="outlined">
    <v-card-title class="d-flex">
      <v-btn variant="elevated" color="primary" @click="newTask" v-if="checkIfInRole(session, [0])">Nowe zadanie</v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey" @update:options="loadItems"
        @click:row="clickItem" itemsPerPageText="# elementów na stronie" pageText="{0}-{1} z {2}" density="compact">
        <template #footer.prepend>
          <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact" placeholder="szukaj..."
            hide-details prepend-icon="mdi-magnify" />
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <v-dialog v-model="showTaskEditor">
    <TaskEditor :task="task" @cancel="showTaskEditor = false" @ok="saved" @error="notsaved" />
  </v-dialog>
</template>