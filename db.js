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
  savePerson(input) {
    try {
      const person = new Person(input)
      const err = person.validateSync()
      if(err) return err.message
      person.save()
      return null
    } catch(err) {
      return err.message
    }
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
      res.json(result)
    }).catch(err => {
      res.status(400).json({ error: err.message })
    })
  }
}