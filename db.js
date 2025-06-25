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
        validator: v => {
          return /^\p{L}/u.test(v)
        },
        message: props => `${props.value} does not start from a letter`
      }
    },
    lastName: {
      type: String, required: true, validate: {
        validator: v => {
          return /^\p{L}/u.test(v)
        },
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
        validator: v => {
          return /^\p{L}/u.test(v)
        },
        message: props => `${props.value} does not start from a letter`
      }
    },
    manager_id: { type: String },
    worker_ids: [ { type: String } ],
    coords: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    }  
  }, {
    versionKey: false,
    additionalProperties: false
  })
}

const model = {}

const extraAggr = {
  project: [
    { $lookup: { from: 'people', localField: 'manager_id', foreignField: '_id', as: 'manager' } },
    { $lookup: { from: 'people', localField: 'worker_ids', foreignField: '_id', as: 'workers' } }
  ]
}

const url = process.env.MDB_URL
mongoose.connect(url)
.then(conn => {
    console.log(`Połączenie z ${url.split('/')[3]} zestawione`)
    auth.init(conn)
    for(const schemaKey in schema) {
      model[schemaKey] = conn.model(schemaKey, schema[schemaKey])
    }
})
.catch(err => {
    console.error(`Połączenie z ${url} nie może być zestawione: ${err.message}`)
    process.exit(0)
})

const db = module.exports = {
  save(modelKey, res, input) {
    const obj = new model[modelKey](input)
    const err = obj.validateSync()
    if(err) {
      res.status(400).json({ error: err.message })
      return
    }
    obj.save().then(newObj => {
      res.json(newObj)
    }).catch(err => {
      res.status(400).json({ error: err.errmsg })
    })
  },
  modify(modelKey, res, input) {
    const _id = input._id
    delete input._id
    model[modelKey].findOneAndUpdate({ _id }, { $set: input }, { runValidators: true, new: true }).then(updatedObj => {
      res.json(updatedObj)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  },
  remove(modelKey, res, _id) {
    model[modelKey].findOneAndDelete({ _id }).then(deletedObj => {
      res.json(deletedObj)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  },
  retrieve(modelKey, res, matching, order, skip, limit) {
    const data = [
      {
        '$sort': order
      }, {
        '$skip': skip
      }, {
        '$limit': limit
      }
    ]
    if(extraAggr[modelKey]) {
      data.unshift(...extraAggr[modelKey])
    }
    model[modelKey].aggregate([
      {
        '$match': matching  
      }, {
        '$facet': {
          count: [ { $count: 'count' } ],
          data 
        }
      }, 
    ]).then(facet => {
      const result = facet[0]
      result.count = result.count[0]?.count || 0
      res.json(result)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  },
  get(modelKey, req, res, matching) {
      const order = { created: 1 }
      if(req.query.sort) {
          delete order.created
          order[req.query.sort] = req.query.order == 'desc' ? -1 : 1
      }
      let skip = +req.query.skip || 0
      if(skip < 0) skip = 0
      let limit = +req.query.limit
      if(!limit || limit < 0 || limit > 1000) limit = 1000
      db.retrieve(modelKey, res, matching, order, skip, limit)
  }
}