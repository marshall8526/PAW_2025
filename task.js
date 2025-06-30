const express = require('express')
const router = express.Router()
const db = require('./db')
const auth = require('./auth')

// GET /api/task
// admin and users
router.get('/', /*auth.checkIfInRole([0,1]),*/ (req, res) => {
    const filter = req.query.filter || ''
    db.get('task', req, res, { name: { $regex: filter } })
})

// POST /api/task
// admin only
router.post('/', /*auth.checkIfInRole([0]),*/ (req, res) => {
    db.save('task', res, req.body)
})

// PUT /api/task
// admin only
router.put('/', /*auth.checkIfInRole([0]),*/ (req, res) => {
    db.modify('task', res, req.body)
})

// DELETE /api/task?_id=...
// admin only
router.delete('/', /*auth.checkIfInRole([0]),*/ (req, res) => {
    db.remove('task', res, req.query._id)
})

module.exports = router
