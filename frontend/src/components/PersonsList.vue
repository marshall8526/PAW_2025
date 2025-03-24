<script>
    export default {
        data() {
            return {
                persons: {},
                person: {},
                editor: false,
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
                let queryString = { skip, limit: itemsPerPage, filter: this.search }
                if(sortBy && sortBy[0]) {
                    queryString.sort = sortBy[0].key
                    queryString.order = sortBy[0].order
                } else {
                    queryString.sort = 'lastName'
                    queryString.order = 'asc'
                }           
                fetch('/api/person?' + 
                    new URLSearchParams(queryString).toString())
                .then(res => res.json().then(data => {
                    this.itemsLength = 1000
                    this.serverItems = data
                    this.loading = false
                }))
            },
            clickItem() {
                alert('clickItem')
            }
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex">
            Osoby
        </v-card-title>
        <v-card-text>
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey"
                @update:options="loadItems" @click:row="clickItem"
                itemsPerPageText="# elementów na stronie" pageText="{0}-{1} z {2}">
                <template #item.birthDate="{ item }">
                    {{ new Date(item.birthDate).toLocaleDateString() }}
                </template>
                <template #footer.prepend>
                    <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact" placeholder="szukaj..."
                        hide-details prepend-icon="mdi-magnify"></v-text-field>                   
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>
</template>

<style scoped>
</style>