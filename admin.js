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

getSession = (req, res) => {
    req.sessionStore.all((err, sessions) => {
        const websockets = Array.from(ws.getClients()).map(client => ({ sessionID: client.sessionID, ip: client._socket.remoteAddress, state: client.readyState }))
        for(let session in sessions) {
            sessions[session].websocket = websockets.find(w => w.sessionID == session)
        }
        res.json(sessions)
    })
}

module.exports = (req, res) => {
    const selector = req.method + ' ' + req.params.what
    switch(selector) {
        case 'GET session':
            return getSession(req, res)
        case 'GET user':
            return auth.getUsers(req, res)
        default:
            return res.status(404).json({ error: `endpoint ${selector} not found` })
    }
}