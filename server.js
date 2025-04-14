const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')

const db = require('./db')
const auth = require('./auth')

const config = {
    port: 8000,
    frontend: './frontend/dist'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())

const session = expressSession({ secret: 'paw2025', resave: false , saveUninitialized: true })
app.use(session)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)
const authEndpoint = '/api/auth'
app.get(authEndpoint, auth.whoami)
app.post(authEndpoint, passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete(authEndpoint, auth.logout)

app.use(express.static(config.frontend))

app.get('/api/person', auth.checkIfInRole([ 0, 1 ]), (req, res) => {
    const filter = req.query.filter || ''
    const order = { created: 1 }
    if(req.query.sort) {
        delete order.created
        order[req.query.sort] = req.query.order == 'desc' ? -1 : 1
    }
    let skip = +req.query.skip || 0
    if(skip < 0) skip = 0
    let limit = +req.query.limit
    if(!limit || limit < 0 || limit > 1000) limit = 1000
    db.getPersons(res, filter, order, skip, limit)
})

app.post('/api/person', auth.checkIfInRole([ 0 ]), (req, res) => {
    db.savePerson(res, req.body)
})

app.put('/api/person', auth.checkIfInRole([ 0 ]), (req, res) => {
    db.modifyPerson(res, req.body)
})

app.delete('/api/person', auth.checkIfInRole([ 0 ]), (req, res) => {
    db.removePerson(res, req.query._id)
})

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})