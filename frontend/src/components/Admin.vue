<script>
export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ],
    data() {
        return {
            sessions: [],
        }
    },
    mounted() {
        fetch('/api/admin/session')
        .then(res => res.json().then(result => {
            this.sessions = result
        }))
    },
}
</script>

<template>
    <v-table>
        <thead>
            <tr>
                <th>Id sesji</th>
                <th>Użytkownik</th>
                <th>IP</th>
                <th>Stan websocketu</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(data, sessionID) in sessions" :key="sessionID">
                <td>{{ sessionID }}</td>
                <td>{{ data.passport.user }}</td>
                <td>{{ data.websocket && data.websocket.ip }}</td>
                <td>{{ data.websocket && data.websocket.state }}</td>
            </tr>
        </tbody>
    </v-table>
</template>
