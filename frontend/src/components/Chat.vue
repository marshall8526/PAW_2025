<script>
export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ],
    data() {
        return {
            isValid: false,
            input: { username: '',recipient: '', message: '' },
            rules: {
                required: value => {
                    return value.length > 0 || 'Pole wymagane'
                }
            }
        }
    },
    methods: {
        send() {}
    }
}
</script>

<template>
    <v-card variant="none">
        <v-card-text>
            <i>wiadomości...</i>
        </v-card-text>
        <v-card-actions>
          <v-form v-model="isValid" style="width: 100%;">
            <v-row>
            <v-col cols="4">
                <i>odbiorca...</i>
            </v-col>
            <v-col>
            <v-text-field variant="solo" label="Wiadomość" v-model="input.message">
                <template #append-inner>
                    <v-btn variant="elevated" color="success" @click="send" type="submit" :disabled="!input.recipient || !input.message">Wyślij</v-btn>
                </template>
            </v-text-field>
            </v-col>
            </v-row>
          </v-form>
        </v-card-actions>  
    </v-card>
</template>
