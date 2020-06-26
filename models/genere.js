const Joi = require('joi');
const mongoose = require('mongoose');

const genereSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Genere = mongoose.model('Genere', genereSchema);

function validateGenere(genere) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
    };

    return Joi.validate(genere, schema);
}

exports.genereSchema = genereSchema;
exports.validate = validateGenere;
exports.Genere = Genere;
