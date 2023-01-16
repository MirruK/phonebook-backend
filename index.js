require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./mongo').Person
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId;

const URI = process.env.MONGODB_URI
mongoose
    .connect(URI)
    .then(()=>{
        console.log("Connected")
    })
    .catch((err)=>console.log(err))

const app = express()

const getNewId = () => Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)

const checkNewPerson = (requestBody) => requestBody.hasOwnProperty('name') && requestBody.hasOwnProperty('number') ? true : false

morgan.token('postRes', (req, res)=>{
    return req.method === 'POST' ? JSON.stringify(req.body) : "Not a POST request"
})

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms  POST :postRes'))
app.get('/info', (req, res)=>{
    console.log("GET request for info inbound")
    const infoObj = {
        personsLength : persons.persons.length, 
        time : new Date()
    }
    res.send(`<div>Phonebook has info for ${infoObj.personsLength} people. <br> ${infoObj.time}</div>`)
})

app.get('/api/persons', (req, res)=>{
    console.log("GET request for persons inbound")
    Person.find({}).then((persons)=>res.json(persons))
})

app.get('/api/persons/:id', (req, res)=>{
    if(!ObjectId.isValid(req.params.id)){
        res.sendStatus(400).end()   
        return
    }
    Person.findById(req.params.id)
    .then(pers => {
      if (pers){
          res.json(pers)
          res.send(200).end()
          return
      }else{
          res.status(404).end()
      }}
    )
    .catch((err)=>{console.log("No person found with the requested id ", err); return})
})

app.delete('/api/persons/:id', (req, res)=>{
    if(!ObjectId.isValid(req.params.id)){
        res.sendStatus(400).end()   
        return
    }
    Person.findOneAndDelete({_id : req.params.id})
    .catch(err => {
         console.log("Deletion failed. Error: ", err) 
      })
    console.log("DELETE request for a person inbound")
    res.sendStatus(204).end()
})

app.post('/api/persons', (req, res)=>{
    //LINES .,+8 REFACTOR TO MONGO
    if(!checkNewPerson(req.body)){
        res.status(400)
        res.send("Please provide both a name and number for your new person").end()
        return;
    }
    console.log("POST request to persons inbound")
    Person.exists(req.body, (err)=>{
        if(err){
            res.status(400)
            res.send("Person with these credentials already exists. Use a PUT request to update").end()
            return;
        }
        else{
            const newPerson = new Person({name : req.body.name, number: req.body.number})
            newPerson.save((err, savedPerson)=> {
                if (err) return;
                else{
                    res.status(201)
                    res.send({statusMessage : "Created new person", newPerson: savedPerson}).end()
                    return;
                }
            })
        }
    }) 
})

const server_port = process.env.YOUR_PORT || process.env.PORT || 80;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port', server_port);
});
process.on ("SIGINT", async() => {
  await mongoose.connection.close ();
  process.exit (0)
});
