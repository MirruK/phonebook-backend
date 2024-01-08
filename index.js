import { config } from 'dotenv';
import express, { json, static as static_ } from 'express';
import morgan, { token } from 'morgan';
import cors from 'cors';
import { Person } from './mongo.js';
import { connect, disconnect } from 'mongoose';
import Types from 'mongoose';
const ObjectId = Types.Types.ObjectId;

// Dotenv config initializer
config();

const URI = encodeURI(
    `${process.env.MONGODB_URI_START}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}${process.env.MONGODB_URI_END}`,
);
connect(URI)
    .then(() => {
        console.log('Connected');
    })
    .catch((err) => console.log(err));

const app = express();

token('postRes', (req, res) => {
    return req.method === 'POST'
        ? JSON.stringify(req.body)
        : 'Not a POST request';
});

app.use(cors());
app.use(json());
app.use(static_('build'));
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms  POST :postRes',
    ),
);
app.get('/info', (req, res) => {
    console.log('GET request for info inbound');
    const infoObj = {
        personsLength: persons.persons.length,
        time: new Date(),
    };
    res.send(
        `<div>Phonebook has info for ${infoObj.personsLength} people. <br> ${infoObj.time}</div>`,
    );
});

app.get('/api/persons', (req, res) => {
    console.log('GET request for persons inbound');
    Person.find({}).then((persons) => res.json(persons));
});

app.get('/api/persons/:id', (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).send('Invalid object id format').end();
        return;
    }
    Person.findById(req.params.id)
        .then((pers) => {
            if (pers) {
                res.json(pers);
                res.send(200).end();
                return;
            } else {
                res.status(404).end();
            }
        })
        .catch((err) => {
            next(err);
            console.log('No person found with the requested id ', err);
            return;
        });
});

app.delete('/api/persons/:id', (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).send('Invalid object id format').end();
        return;
    }
    Person.findOneAndDelete({ _id: req.params.id }).catch((err) => {
        console.log('Deletion failed. Error: ', err);
        next(err);
    });
    console.log('DELETE request for a person inbound');
    res.sendStatus(204).end();
});

app.post('/api/persons', (req, res) => {
    const newPerson = new Person({
        name: req.body.name,
        number: req.body.number,
    });
    const validationError = newPerson.validateSync();
    if (validationError) {
        res.status(400);
        console.log(`Validation error: ${validationError}`);
        res.send(validationError).end();
        return;
    }
    console.log('POST request to persons inbound');
    Person.exists(req.body).then((err) => {
        if (err) {
            res.status(400);
            res.send(
                'Person with these credentials already exists. Use a PUT request to update',
            ).end();
            return;
        } else {
            newPerson
                .save()
                .then((savedPerson) => {
                    res.status(201);
                    res.send({
                        statusMessage: 'Created new person',
                        newPerson: savedPerson,
                    }).end();
                    return;
                })
                .catch((err) =>
                    console.log('Error when saving new Person: ', err),
                );
        }
    });
});

const server_port = process.env.YOUR_PORT || process.env.PORT || 80;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function () {
    console.log('Listening on port', server_port);
});
process.on('SIGINT', async () => {
    await disconnect();
    process.exit(0);
});
