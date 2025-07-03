const uuid = require('uuid')
const mongoose = require('mongoose')
require('dotenv').config()

const auth = require('./auth')

const schema = {
  person: new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    created: { type: Date, required: false, default: new Date() },
    firstName: {
      type: String, required: true, validate: {
        validator: v => /^\p{L}/u.test(v),
        message: props => `${props.value} does not start from a letter`
      }
    },
    lastName: {
      type: String, required: true, validate: {
        validator: v => /^\p{L}/u.test(v),
        message: props => `${props.value} does not start from a letter`
      }
    },
    birthDate: { type: Date, required: true, transform: v => v.toISOString().substr(0, 10) }
  }, {
    versionKey: false,
    additionalProperties: false
  }),
  project: new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    created: { type: Date, required: false, default: new Date() },
    name: {
      type: String, required: true, validate: {
        validator: v => /^\p{L}/u.test(v),
        message: props => `${props.value} does not start from a letter`
      }
    },
    manager_id: { type: String },
    worker_ids: [{ type: String }],
    coords: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    },
    task_ids: [{ type: String }]  // Завдання, що належать цьому проекту
  }, {
    versionKey: false,
    additionalProperties: false
  }),
  task: new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    name: {
      type: String,
      required: true,
      validate: {
        validator: v => /^\p{L}/u.test(v),
        message: props => `${props.value} does not start from a letter`
      }
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: false },
    responsible_id: { type: String },
    // Не потрібно зберігати project_ids у завданні
  }, {
    versionKey: false,
    additionalProperties: false
  }),
}

const model = {}

const extraAggr = {
  project: [
    { $lookup: { from: 'people', localField: 'manager_id', foreignField: '_id', as: 'manager' } },
    { $lookup: { from: 'people', localField: 'worker_ids', foreignField: '_id', as: 'workers' } }
  ],
}

const url = process.env.MDB_URL

async function connectAndInit() {
  try {
    const conn = await mongoose.connect(url)
    console.log(`Połączenie z ${url.split('/')[3]} zestawione`)
    auth.init(conn)
    for (const schemaKey in schema) {
      model[schemaKey] = conn.model(schemaKey, schema[schemaKey])
    }
  } catch (err) {
    console.error(`Połączenie z ${url} nie może być zestawione: ${err.message}`)
    process.exit(0)
  }
}

connectAndInit()

const db = module.exports = {
  model,
  async save(modelKey, res, input) {
    const obj = new model[modelKey](input);
    console.log(input);

    const err = obj.validateSync();
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    try {
      const newObj = await obj.save();  // Спочатку зберігаємо завдання

      // Тепер додаємо ID завдання до проектів
      if (modelKey === 'task') {

        await model.project.updateMany(
          { _id: { $in: input.project_ids } },
          { $push: { task_ids: newObj._id } }
        );
      }

      res.json(newObj);
    } catch (err) {
      res.status(400).json({ error: err.errmsg });
    }
  },

  async modify(modelKey, res, input) {
    const _id = input._id;
    delete input._id;

    try {
      // Оновлення завдання
      const updatedObj = await model[modelKey].findOneAndUpdate(
        { _id },
        { $set: input },
        { runValidators: true, new: true }
      );

      if (!updatedObj) {
        throw new Error("Not modified!");
      }

      // Оновлення проектів для завдання
      if (modelKey === 'task') {
        const oldProjectIds = await model.project.aggregate([
          {
            $match: { task_ids: _id }  // Фільтруємо проекти, де task_ids містить зазначене завдання
          },
          {
            $project: { _id: 1 }  // Повертаємо тільки ID проектів
          }
        ])
        oldProjectIds.map(project => project._id);
        const newProjectIds = input.project_ids || [];  // Нова інформація про проект

        // Видаляємо завдання з усіх старих проектів
        const resu = await model.project.updateMany(
          { _id: { $in: oldProjectIds } },
          { $pull: { task_ids: _id } }
        );
        console.log(resu);

        // Додаємо завдання до нових проектів
        await model.project.updateMany(
          { _id: { $in: newProjectIds } },
          { $addToSet: { task_ids: _id } }  // Додаємо завдання тільки, якщо воно ще не існує в проекті
        );
      }

      res.json(updatedObj);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(modelKey, res, _id) {
    try {
      const deletedObj = await model[modelKey].findOneAndDelete({ _id })
      if (!deletedObj) {
        throw new Error("Not deleted!")
      }
      res.json(deletedObj)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },

  async retrieve(modelKey, res, matching, order, skip, limit) {
    const data = [
      { '$sort': order },
      { '$skip': skip },
      { '$limit': limit }
    ]
    if (extraAggr[modelKey]) {
      data.unshift(...extraAggr[modelKey])
    }
    try {
      const facet = await model[modelKey].aggregate([
        { '$match': matching },
        {
          '$facet': {
            count: [{ $count: 'count' }],
            data
          }
        }
      ])
      const result = facet[0]
      result.count = result.count[0]?.count || 0
      res.json(result)
    } catch (err) {
      console.log(err)
      res.status(400).json({ error: err.message })
    }
  },

  get(modelKey, req, res, matching) {
    const order = { created: 1 }
    if (req.query.sort) {
      delete order.created
      order[req.query.sort] = req.query.order == 'desc' ? -1 : 1
    }
    let skip = +req.query.skip || 0
    if (skip < 0) skip = 0
    let limit = +req.query.limit
    if (!limit || limit < 0 || limit > 1000) limit = 1000
    db.retrieve(modelKey, res, matching, order, skip, limit)
  },

  async checkPersonRelations(res, _id) {
    // Перевірка, чи особа є керівником проекту чи виконавцем
    const projects = await model.project.find({
      $or: [
        { manager_id: _id },  // Керівник проекту
        { worker_ids: { $in: [_id] } }  // Виконавець проекту
      ]
    });

    if (projects.length > 0) {
      return {
        error: 'Osoba jest przypisana do projektów. Zmień przypisanie przed usunięciem.',
        projects: projects
      };
    }

    // Перевірка завдань, де особа є відповідальною
    const tasks = await model.task.find({
      responsible_id: _id  // Перевірка, чи особа відповідальна за завдання
    });

    if (tasks.length > 0) {
      return {
        error: 'Osoba jest przypisana do zadań. Zmień odpowiedzialność przed usunięciem.',
        tasks: tasks
      };
    }

    return { success: true };  // Якщо перевірка пройдена успішно
  },

  async checkTaskRelations(res, _id) {
    // Перевірка, чи завдання пов'язане з проектами
    const projects = await model.project.find({
      task_ids: { $in: [_id] }  // Перевірка наявності завдання в масиві task_ids проекту
    });

    if (projects.length > 0) {
      return {
        error: 'Zadanie jest przypisane do projektów. Zmień przypisanie przed usunięciem.',
        projects: projects
      };
    }

    return { success: true };  // Якщо завдання не прив'язане до проектів
  }
}
