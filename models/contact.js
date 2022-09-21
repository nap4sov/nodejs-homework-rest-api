const { Schema, model } = require('mongoose');
const handleSchemaValidationError = require('../helpers/handleSchemaValidationError');

const contactSchema = Schema(
    {
        name: {
            type: String,
            required: [true, 'Set name for contact'],
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
            unique: true,
        },
        favorite: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

contactSchema.post('save', handleSchemaValidationError);

const Contact = model('contact', contactSchema);

module.exports = Contact;
