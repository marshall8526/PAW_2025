<script>
export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ]
}
</script>

<template>
    <h1>PAW 2025</h1>
    <em>Pulpit - {{ session.username || 'niezalogowany' }}</em>
</template>
