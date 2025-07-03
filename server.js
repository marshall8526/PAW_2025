const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')
const db = require('./db')
const ws = require('./ws')
const auth = require('./auth')
const admin = require('./admin')
require('dotenv').config()

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())

app.use(express.static('./frontend/dist'))

const session = expressSession({ secret: 'paw2025', resave: false, saveUninitialized: true, cookie: { maxAge: 24 * 60 * 60 * 1000 } })
app.use(session)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

const taskRouter = require('./task');
app.use('/api/task', taskRouter)

app.get('/api/auth', auth.whoami)
app.post('/api/auth', passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete('/api/auth', auth.logout)

app.use('/api/admin/:what', auth.checkIfInRole([0]), admin)

app.get('/api/person', auth.checkIfInRole([0, 1]), (req, res) => {
    const filter = req.query.filter || ''
    db.get('person', req, res, {
        $or: [
            { firstName: { $regex: filter } },
            { lastName: { $regex: filter } }
        ]
    })
})

app.post('/api/person', auth.checkIfInRole([0]), (req, res) => {
    db.save('person', res, req.body)
})

app.put('/api/person', auth.checkIfInRole([0]), (req, res) => {
    db.modify('person', res, req.body)
})

app.delete('/api/person', auth.checkIfInRole([0]), async (req, res) => {
    const { _id } = req.query;
    const relations = await db.checkPersonRelations(res, _id);

    if (relations.error) {
        return res.status(400).json(relations);
    }

    // Якщо перевірка пройшла успішно, видаляємо особу
    db.remove('person', res, _id);
})

app.get('/api/project', (req, res) => {
    const filter = req.query.filter || ''
    db.get('project', req, res, { name: { $regex: filter } })
})

app.post('/api/project', auth.checkIfInRole([0]), (req, res) => {
    db.save('project', res, req.body)
})

app.put('/api/project', auth.checkIfInRole([0]), (req, res) => {
    db.modify('project', res, req.body)
})

app.delete('/api/project', auth.checkIfInRole([0]), (req, res) => {
    db.remove('project', res, req.query._id)
})

ws.init(app)
app.ws('/ws', ws.handler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Backend słucha na porcie', PORT)
})