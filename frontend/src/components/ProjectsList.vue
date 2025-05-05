<script>
    import common from '../mixins/common.js'
    import ProjectEditor from './ProjectEditor.vue'

    export default {
        components: { ProjectEditor },
        emits: [ 'saved', 'error' ],
        props: [ 'session' ],
        mixins: [ common ],
        data() {
            return {
                project: {},
                showProjectEditor: false,
                itemsPerPage: 10,
                headers: [
                        { title: 'Nazwa', key: 'name', align: 'start', sortable: true },
                        { title: 'Manager', key: 'managerName', align: 'start', sortable: true },
                        { title: '#pracowników', key: 'numWorkers', align: 'end', sortable: true }
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
                if(sortBy && sortBy[0]) {
                    queryString.sort = sortBy[0].key
                    queryString.order = sortBy[0].order
                }           
                fetch('/api/project?' + 
                    new URLSearchParams(queryString).toString())
                .then(res => res.json().then(result => {
                    this.itemsLength = result.count
                    result.data.forEach(element => {
                        element.managerName = element.manager[0] ? element.manager[0].firstName + ' ' + element.manager[0].lastName : '- bez przydziału -'
                        element.numWorkers = element.worker_ids.length
                    })
                    this.serverItems = result.data
                    this.loading = false
                }))
            },
            clickItem(_, data) {
                if(!this.checkIfInRole(this.session, [ 0 ])) return
                Object.assign(this.project, data.item)
                this.showProjectEditor = true
            },
            saved() {
                this.showProjectEditor = false
                this.tableKey++
                this.$emit('saved', 'Wykonano')
            },
            notsaved(data) {
                this.showProjectEditor = false
                this.$emit('error', data)
            },
            newProject() {
                this.project = {}
                this.showProjectEditor = true
            }
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex">
            <v-btn variant="elevated" color="primary" @click="newProject" v-if="checkIfInRole(session, [ 0 ])">Nowy projekt</v-btn>
        </v-card-title>
        <v-card-text>
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey"
                @update:options="loadItems" @click:row="clickItem"
                itemsPerPageText="# elementów na stronie" pageText="{0}-{1} z {2}" density="compact">
                <template #footer.prepend>
                    <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact" placeholder="szukaj..."
                        hide-details prepend-icon="mdi-magnify"></v-text-field>                   
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

    <v-dialog v-model="showProjectEditor">
        <ProjectEditor :project="project" @cancel="showProjectEditor = false" @ok="saved" @error="notsaved"/>
    </v-dialog>
</template>

<style scoped>
</style>