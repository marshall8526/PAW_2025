const expressWs = require('express-ws')

let wsInstance = null

const ws = module.exports = {
    wsInstance: null,
    init: app => {
        wsInstance = expressWs(app)
    },
    getClients: () => wsInstance.getWss().clients,
    handler: (wsock, req) => {
        wsock.on('message', rawData => {
            let data = {}
            try {
                data = JSON.parse(rawData)
            } catch(err) {
                console.error(err.message, rawData)
                return
            }
            wsock.sessionID = req.sessionID
            req.sessionStore.all((err, sessions) => {
                if(err) {
                    console.error('Błąd w analizie sessionStore')
                    return
                }
                ws.getClients().forEach(client => {
                    try {
                        const username = sessions[client.sessionID].passport ? sessions[client.sessionID].passport.user : null
                        if(username == data.recipient) {
                            client.send(JSON.stringify(data))
                        }
                    } catch(err) {}
                })    
            })
        })
    }
}