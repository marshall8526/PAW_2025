const express = require('express')
const router = express.Router()
const db = require('./db')
const auth = require('./auth')

// GET /api/task
// admin and users
// Використовуємо model.task для агрегацій та запитів
router.get('/', async (req, res) => {
  const filter = req.query.filter || '';
  try {
    const tasks = await db.model.task.aggregate([
      { $match: { name: { $regex: filter, $options: 'i' } } },  // Фільтрація за назвою завдання
      {
        $lookup: {
          from: 'people',
          localField: 'responsible_id',
          foreignField: '_id',
          as: 'responsible'
        }
      },
      {
        $lookup: {
          from: 'projects',  // Змінено 'project' на 'projects', якщо ваша колекція називається projects
          localField: '_id',
          foreignField: 'task_ids',
          as: 'projects'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          start_date: 1,
          end_date: 1,
          responsibleName: {
            $cond: {
              if: { $gt: [{ $size: '$responsible' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$responsible.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$responsible.lastName', 0] }
                ]
              },
              else: '- brak -'
            }
          },
          numProjects: { $size: '$projects' }  // Підрахунок кількості проектів
        }
      }
    ]);

    res.json({ count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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
