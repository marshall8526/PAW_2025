const auth = require('./auth')

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
        res.json(sessions)
    })
}

getWebsocket = (req, res, wsInstance) => {
    res.json(Array.from(wsInstance.getWss().clients).map(client => ({ sessionID: client.sessionID, ip: client._socket.remoteAddress })))
}

module.exports = wsInstance => (req, res) => {
    const selector = req.method + ' ' + req.params.what
    switch(selector) {
        case 'GET session':
            return getSession(req, res)
        case 'GET websocket':
            return getWebsocket(req, res, wsInstance)
        case 'GET user':
            return auth.getUsers(req, res)
        default:
            return res.status(404).json({ error: `endpoint ${selector} not found` })
    }
}