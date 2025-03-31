const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const db = require('./db')

const config = {
    port: 8000,
    frontend: './frontend/dist'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())

app.use(express.static(config.frontend))

app.get('/api/test', (req, res) => {
    res.json({ test: true })
})

app.get('/api/person', (req, res) => {
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

app.post('/api/person', (req, res) => {
    const err = db.savePerson(req.body)
    if(err) {
        res.status(400).json({ error: err })
    } else {
        res.json({ ok: true })
    }
})

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})