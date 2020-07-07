const express = require('express');
const router = express.Router();
const { Rental } = require('../models/rental');
const auth = require('../middleware/auth');

const { Movie } = require('../models/movie');
const Joi = require('joi');
const validate = require('../middleware/validate');


router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) {
        return res.status(404).send('No rental found for the customer/movie');
    }

    if(rental.dateReturned) {
        return res.status(400).send('Return is already processed');
    }
    
    rental.return();
    await rental.save();

    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1}
    })    

    return res.send(rental);
});

function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;