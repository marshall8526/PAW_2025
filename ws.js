const expressWs = require('express-ws')

let wsInstance = null

const ws = module.exports = {
    wsInstance: null,
    init: app => {
        wsInstance = expressWs(app)
    },
    getClients: () => wsInstance.getWss().clients,
    handler: async (wsock, req) => {
        wsock.on('message', async rawData => {
            let data = {}
            try {
                data = JSON.parse(rawData)
            } catch (err) {
                console.error(err.message, rawData)
                return
            }

            wsock.sessionID = req.sessionID

            try {
                const sessions = await new Promise((resolve, reject) => {
                    req.sessionStore.all((err, sessions) => {
                        if (err) return reject(err)
                        resolve(sessions)
                    })
                })

                ws.getClients().forEach(client => {
                    try {
                        const username = sessions[client.sessionID]?.passport?.user || null
                        if (username == data.recipient) {
                            client.send(JSON.stringify(data))
                        }
                    } catch (_) { }
                })

            } catch (err) {
                console.error('Błąd w analizie sessionStore:', err)
            }
        })
    },
    broadcast: (data, excludeSessionID = null) => {
        const json = JSON.stringify(data);
        ws.getClients().forEach(client => {
            if (excludeSessionID && client.sessionID === excludeSessionID) return;
            try {
                client.send(json);
            } catch (_) { }
        });
    },
    broadcastInfo: (message, excludeSessionID = null) => {
        ws.broadcast({ type: 'notification', text: message }, excludeSessionID)
    },
}