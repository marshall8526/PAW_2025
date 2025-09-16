const express = require('express')
const router = express.Router()
const db = require('./db')
const auth = require('./auth')
const ws = require('./ws')
const upload = require('./upload');

// GET /api/task
// admin and users
router.get('/', auth.checkIfInRole([0, 1]), async (req, res) => {
  const filter = req.query.filter || '';
  try {
    const tasks = await db.model.task.aggregate([
      {
        $match: { name: { $regex: filter, $options: 'i' } }
      },
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
          from: 'projects', 
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
          numProjects: { $size: '$projects' }, 
          projects: {
            $map: {
              input: '$projects',
              as: 'project',
              in: {
                _id: '$$project._id', 
                name: '$$project.name',
                manager_id: '$$project.manager_id',
                task_ids: '$$project.task_ids' 
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

  db.remove('task', res, _id);
  ws.broadcastInfo(`Usunięto zadanie (ID: ${_id})`, req.sessionID)
})

// GET /api/task/:taskId/notes — przeglądanie notatek
router.get('/:taskId/notes', auth.checkIfInRole([0, 1]), async (req, res) => {
  const notes = await db.model.note
    .find({ task_id: req.params.taskId })
    .sort({ created: 1 });
  const host = `${req.protocol}://${req.get('host')}`

  const result = notes.map(note => ({
    ...note.toObject(),
    content: note.type === 1 ? note.content : `${host}${note.content}`
  }));
  res.json(result);
});

// POST /api/task/:taskId/notes — dodawanie notatki
router.post('/:taskId/notes', auth.checkIfInRole([0, 1]), upload.single('file'), async (req, res) => {
  req.user = { _id: 'someIdOfAdmin' }
  try {
    const type = parseInt(req.body.type);
    console.log(req.body);
    console.log(req.file);


    if (![1, 2, 3].includes(type)) {
      return res.status(400).json({ error: 'Nieprawidłowy typ notatki' });
    }

    let content;

    if (type === 1) {
      if (!req.body.content?.trim()) {
        return res.status(400).json({ error: 'Treść notatki jest wymagana' });
      }
      content = req.body.content.trim();
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'Plik jest wymagany dla typu 2 i 3' });
      }
      content = `/uploads/${req.params.taskId}/${req.file.filename}`;
    }

    const note = new db.model.note({
      task_id: req.params.taskId,
      author_id: req.user._id,
      type,
      content
    });

    const saved = await note.save();
    ws.broadcastInfo(`Dodano notatkę do zadania ${req.params.taskId}`, req.sessionID);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
