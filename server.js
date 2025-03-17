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