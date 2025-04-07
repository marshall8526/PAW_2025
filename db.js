const uuid = require('uuid')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    created: { type: Date, required: false, default: new Date() },
    firstName: { type: String, required: true, validate: {
        validator: v => {
          return /^\p{L}/u.test(v)
        },
        message: props => `${props.value} does not start from a letter`
      }
    },
    lastName: { type: String, required: true, validate: {
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
})

const url = 'mongodb://localhost:27017/paw'
let Person = null

mongoose.connect(url)
.then(conn => {
    console.log(`Connection to ${url} established`)
    Person = conn.model('Person', schema)
})
.catch(err => {
    console.error(`Connection to ${url} cannot be established`)
    process.exit(0)
})

module.exports = {
  savePerson(res, input) {
    const person = new Person(input)
    const err = person.validateSync()
    if(err) {
      res.status(400).json({ error: err.message })
      return
    }
    person.save().then(newPerson => {
      res.json(newPerson)
    }).catch(err => {
      res.status(400).json({ error: err.errmsg })
    })
  },
  modifyPerson(res, input) {
    const _id = input._id
    delete input._id
    Person.findOneAndUpdate({ _id }, { $set: input }, { runValidators: true, new: true }).then(updatedPerson => {
      res.json(updatedPerson)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  },
  removePerson(res, _id) {
    Person.findOneAndDelete({ _id }).then(deletedPerson => {
      res.json(deletedPerson)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  },
  getPersons(res, filter, order, skip, limit) {
    Person.aggregate([
      {
        '$match': { 
          $or: [
            { firstName: { $regex: filter } },
            { lastName: { $regex: filter } }
          ]
        }  
      }, {
        '$facet': {
          count: [ { $count: 'count' } ],
          data: [
            {
              '$sort': order
            }, {
              '$skip': skip
            }, {
              '$limit': limit
            }
          ]
        }
      }, 
    ]).then(facet => {
      const result = facet[0]
      result.count = result.count[0].count
      result.data = result.data.map(item => {
        const newItem = new Person(item).toObject()
        return newItem
      })
      res.json(result)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  }
}