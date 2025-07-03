<script>
import common from '../mixins/common.js'
import PersonEditor from './PersonEditor.vue'

export default {
    components: { PersonEditor },
    emits: ['saved', 'error'],
    props: ['session'],
    mixins: [common],
    data() {
        return {
            person: {},
            showPersonEditor: false,
            itemsPerPage: 10,
            headers: [
                { title: 'Imię', key: 'firstName', align: 'start', sortable: true },
                { title: 'Nazwisko', key: 'lastName', align: 'start', sortable: true },
                { title: 'Data urodzenia', key: 'birthDate', align: 'end', sortable: true }
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
            if (sortBy && sortBy[0]) {
                queryString.sort = sortBy[0].key
                queryString.order = sortBy[0].order
            }
            fetch('/api/person?' +
                new URLSearchParams(queryString).toString())
                .then(res => res.json().then(result => {
                    this.itemsLength = result.count
                    this.serverItems = result.data
                    this.loading = false
                }))
        },
        clickItem(_, data) {
            if (!this.checkIfInRole(this.session, [0])) return
            Object.assign(this.person, data.item)
            this.showPersonEditor = true
        },
        saved() {
            this.showPersonEditor = false
            this.tableKey++
            this.$emit('saved', 'Wykonano')
        },
        notsaved(data) {
            this.showPersonEditor = false
            this.$emit('error', data)
        },
        newPerson() {
            this.person = {}
            this.showPersonEditor = true
        }
    }
}
</script>

<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex">
            <v-btn variant="elevated" color="primary" @click="newPerson" v-if="checkIfInRole(session, [0])">Nowa
                osoba</v-btn>
        </v-card-title>
        <v-card-text>
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey"
                @update:options="loadItems" @click:row="clickItem" itemsPerPageText="# elementów na stronie"
                pageText="{0}-{1} z {2}" density="compact">
                <template #item.birthDate="{ item }">
                    {{ new Date(item.birthDate).toLocaleDateString() }}
                </template>
                <template #footer.prepend>
                    <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact"
                        placeholder="szukaj..." hide-details prepend-icon="mdi-magnify"></v-text-field>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

    <v-dialog v-model="showPersonEditor">
        <PersonEditor :person="person" @cancel="showPersonEditor = false" @ok="saved" @error="notsaved" />
    </v-dialog>
</template>

<style scoped></style>