<script>
export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ],
    data() {
        return {
            isValid: false,
            input: { recipient: '', message: '' },
            rules: {
                required: value => {
                    return value.length > 0 || 'Pole wymagane'
                }
            }
        }
    },
    methods: {
        send() {
            this.session.ws.send(JSON.stringify({ sessionid: this.session.sessionid, message: this.input.message }))
        }
    }
}
</script>

<template>
    <v-card variant="flat">
        <v-card-text>
            <i>wiadomości...</i>
        </v-card-text>
        <v-card-actions>
          <v-form v-model="isValid" style="width: 100%;">
            <v-row>
            <v-col cols="4">
                <v-text-field variant="outlined" label="Odbiorca" v-model="input.recipient" :rules="[ rules.required ]"></v-text-field>    
            </v-col>
            <v-col>
            <v-text-field variant="outlined" label="Wiadomość" v-model="input.message">
                <template #append-inner>
                    <v-btn variant="elevated" color="success" @click="send" type="submit" :disabled="!isValid">Wyślij</v-btn>
                </template>
            </v-text-field>
            </v-col>
            </v-row>
          </v-form>
        </v-card-actions>  
    </v-card>
</template>
