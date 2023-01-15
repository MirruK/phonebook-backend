const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const persons = {
    persons:[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]}

const app = express()
const PORT = 3001

const getNewId = () => Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)

const checkNewPerson = (requestBody) => requestBody.hasOwnProperty('name') && requestBody.hasOwnProperty('number') ? true : false

morgan.token('postRes', (req, res)=>{
    return req.method === 'POST' ? JSON.stringify(req.body) : "Not a POST request"
})

app.use(cors())
app.use(express.json())
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
    res.json(persons)
})

app.get('/api/persons/:id', (req, res)=>{
    const reqId = Number(req.params.id)
    console.log("GET request for a person inbound")
    const requestPerson = persons.persons.find((person)=>person.id === reqId)
    if (!requestPerson){
        res.status(400)
        res.send("No person found for the given id")
    } 
    else res.send(requestPerson)
})

app.delete('/api/persons/:id', (req, res)=>{
    const reqId = Number(req.params.id)
    console.log("DELETE request for a person inbound")
    persons.persons = persons.persons.filter((person)=>person.id !== reqId)
    res.sendStatus(204).end()
})

app.post('/api/persons', (req, res)=>{
    const newId = getNewId()
    console.log("Object keys: ",Object.keys(req.body))
    if(checkNewPerson(req.body)){
        const newPerson = {name : req.body.name, number: req.body.number, id:newId}
        console.log("POST request to persons inbound")
        if(persons.persons.find((person)=>person.name === newPerson.name)){
            res.status(400)
            res.send(`A person with the name ${newPerson.name} already exists`)
            return
        }
        persons.persons = persons.persons.concat(newPerson)
        res.status(201)
        res.send("Created new person")
    }
    else {
        res.status(400)
        res.send("Please provide both a name and number for your new person")
    }
})
const server_port = process.env.YOUR_PORT || process.env.PORT || 80;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port', server_port);
});

