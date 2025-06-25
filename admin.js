const auth = require('./auth')
const ws = require('./ws')

notImplementedYet = (req, res) => {
    res.status(200).json({
        message: 'Admin endpoint is working',
        sessionID: req.sessionID,
        user: (req.user && req.user.username) || null,
        method: req.method,
        what: req.params.what || null
    })
}

getSession = async (req, res) => {
    try {
        const sessions = await new Promise((resolve, reject) => {
            req.sessionStore.all((err, sessions) => {
                if (err) return reject(err)
                resolve(sessions)
            })
        })

        const websockets = Array.from(ws.getClients()).map(client => ({
            sessionID: client.sessionID,
            ip: client._socket.remoteAddress,
            state: client.readyState
        }))

        for (let session in sessions) {
            sessions[session].websocket = websockets.find(w => w.sessionID == session)
        }

        res.json(sessions)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = async (req, res) => {
    const selector = req.method + ' ' + req.params.what
    switch (selector) {
        case 'GET session':
            return await getSession(req, res)
        case 'GET user':
            return await auth.getUsers(req, res)
        default:
            return res.status(404).json({ error: `endpoint ${selector} not found` })
    }
}