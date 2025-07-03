const express = require('express')
const router = express.Router()
const db = require('./db')
const auth = require('./auth')

// GET /api/task
// admin and users
router.get('/', /*auth.checkIfInRole([0,1]),*/(req, res) => {
    const filter = req.query.filter || ''
    db.get('task', req, res, { name: { $regex: filter, $options: 'i' } }); // Викликаємо db.get з агрегацією
})

// POST /api/task
// admin only
router.post('/', /*auth.checkIfInRole([0]),*/(req, res) => {
    db.save('task', res, req.body)
})

// PUT /api/task
// admin only
router.put('/', /*auth.checkIfInRole([0]),*/(req, res) => {
    db.modify('task', res, req.body)
})

// DELETE /api/task?_id=...
// admin only
router.delete('/', /*auth.checkIfInRole([0]),*/ async (req, res) => {
    const { _id } = req.query;
    const relations = await db.checkTaskRelations(res, _id);

    if (relations.error) {
        return res.status(400).json(relations);
    }

    // Якщо перевірка пройшла успішно, видаляємо завдання
    db.remove('task', res, _id);
})

module.exports = router
