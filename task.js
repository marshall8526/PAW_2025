const express = require('express')
const router = express.Router()
const db = require('./db')
const auth = require('./auth')
const ws = require('./ws')

// GET /api/task
// admin and users
router.get('/', auth.checkIfInRole([0]), async (req, res) => {
  const filter = req.query.filter || '';
  try {
    const tasks = await db.model.task.aggregate([
      {
        $match: { name: { $regex: filter, $options: 'i' } }  // Фільтрація за назвою завдання
      },
      {
        $lookup: {
          from: 'people',  // Для отримання інформації про відповідальну особу
          localField: 'responsible_id',
          foreignField: '_id',
          as: 'responsible'
        }
      },
      {
        $lookup: {
          from: 'projects',  // Включаємо проекти, до яких відноситься завдання
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
          responsibleDetails: {
            _id: { $arrayElemAt: ['$responsible._id', 0] },
            firstName: { $arrayElemAt: ['$responsible.firstName', 0] },
            lastName: { $arrayElemAt: ['$responsible.lastName', 0] },
          },
          numProjects: { $size: '$projects' },  // Підрахунок кількості проектів
          projects: {
            $map: {
              input: '$projects',
              as: 'project',
              in: {
                _id: '$$project._id',  // ID проекту
                name: '$$project.name', // Назва проекту
                manager_id: '$$project.manager_id', // ID менеджера проекту
                task_ids: '$$project.task_ids' // Завдання, що належать проекту
              }
            }
          }
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
router.post('/', auth.checkIfInRole([0]), (req, res) => {
  db.save('task', res, req.body)
  ws.broadcastInfo(`Dodano nowe zadanie: ${req.body.name}`, req.sessionID);
})

// PUT /api/task
// admin only
router.put('/', auth.checkIfInRole([0]), (req, res) => {
  db.modify('task', res, req.body)
  ws.broadcastInfo(`Zmieniono zadanie: ${req.body.name}`, req.sessionID)
})

// DELETE /api/task?_id=...
// admin only
router.delete('/', auth.checkIfInRole([0]), async (req, res) => {
  const { _id } = req.query;
  const relations = await db.checkTaskRelations(res, _id);

  if (relations.error) {
    return res.status(400).json(relations);
  }

  // Якщо перевірка пройшла успішно, видаляємо завдання
  db.remove('task', res, _id);
  ws.broadcastInfo(`Usunięto zadanie (ID: ${_id})`, req.sessionID)
})

module.exports = router
