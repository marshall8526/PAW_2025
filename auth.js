const crypto = require('crypto')
const mongoose = require('mongoose')
const uuid = require('uuid')

const schema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    username: { type: String, required: true },
    password: { type: String, required: true },
    roles: { type: [Number] }
}, { versionKey: false })

const makeHash = password => {
    return crypto.createHash('sha256').update(password).digest('base64')
}

const getIntersection = (array1, array2) => {
    const lookupSet = new Set(array2)
    return array1.filter(element => lookupSet.has(element))
}

const auth = module.exports = {

    makeHash,
    User: null,

    init: async conn => {
        auth.User = conn.model('user', schema)

        try {
            const user1 = await auth.User.findOne({ username: 'admin' })
            if (!user1) {
                const admin = new auth.User({ username: 'admin', password: makeHash('admin'), roles: [0] })
                await admin.save()
                console.log('User admin created')
            }
        } catch (err) {
            console.error(err.message)
        }

        try {
            const user2 = await auth.User.findOne({ username: 'user' })
            if (!user2) {
                const user = new auth.User({ username: 'user', password: makeHash('user'), roles: [1] })
                await user.save()
                console.log('User user created')
            }
        } catch (err) {
            console.error(err.message)
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await auth.User.find({}, { password: 0 })
            res.json(users)
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    },

    checkCredentials: async (username, password, next) => {
        try {
            const user = await auth.User.findOne({ username, password: makeHash(password) })
            next(null, user || false)
        } catch (_) {
            next(null, false)
        }
    },

    checkIfInRole: roleNums => (req, res, next) => {
        let intersection = getIntersection(roleNums || [], req.user ? (req.user.roles || []) : [])
        if (!req.isAuthenticated()) {
            res.status(401).json({ error: 'Unauthorized my' })
        } else if (intersection.length > 0) {
            return next()
        } else {
            res.status(403).json({ error: 'Permission denied' })
        }
    },

    serialize: (user, next) => next(null, user.username),

    deserialize: async (username, next) => {
        try {
            const user = await auth.User.findOne({ username })
            if (user) {
                next(null, user)
            } else {
                next(new Error('No such user'), null)
            }
        } catch (err) {
            next(new Error(err.message), null)
        }
    },

    login: (req, res) => auth.whoami(req, res),

    logout: (req, res) => req.logout(() => auth.whoami(req, res)),

    whoami: (req, res) => {
        req.session.roles = req.user ? req.user.roles : []
        req.session.save()
        let data = { sessionid: req.session.id }
        if (req.user) {
            data.username = req.user.username
            data.roles = req.user.roles
        }
        res.json(data)
    },

    errorHandler: (err, req, res, next) => res.status(401).json({ error: `Error [${err.message}]'` })
}
