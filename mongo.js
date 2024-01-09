import { Schema, model } from 'mongoose';

const personSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Providing a name is required.'],
        minLength: 3,
    },
    number: {
        type: String,
        validate: {
            minLength: 8,
            // validator: function (v) {
            //     return /((\+{1}\d{3})|0)\d{9}/.test(v);
            // },
            validator: function (v) {
                return /^\d{2,3}-\d+$/.test(v);
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
