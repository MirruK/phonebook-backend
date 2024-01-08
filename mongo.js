import { Schema, model } from 'mongoose';

const personSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Phone number required.'],
    },
    number: {
        type: String,
        validate: {
            validator: function (v) {
                return /((\+{1}\d{3})|0)\d{9}/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number.`,
        },
        required: [true, 'Phone number required.'],
    },
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
export const Person = model('Person', personSchema);
