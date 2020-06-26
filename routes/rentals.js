
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {Rental, validate} = require('../models/rental')
const {Movie} = require('../models/movie');
const {Customer} = require('../models/customer');
const Fawn = require('fawn');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.body.id);

    if(!rental) return res.status(404).send('The movie with the given ID was not found');

    res.send(rental);
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if(!mongoose.Types.ObjectId.isValid(req.body.customerId)) {
    //     return res.status(400).send('Invalid customer.');
    // }

    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer');

    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie');

    if(movie.numberInStock === 0) return res.status(400).send('Movie not in stock');

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();

        res.send(rental);
    } 
    catch(ex) {
        res.status(500).send('Something failed.');
    }

    

   
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if( error ) return res.status(400).send(error.details[0].message)
    
    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie');
    
    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer');

    const rental = await Rental.findByIdAndUpdate(req.params.id,
        {
            movie: {
                _id: movie._id,
                title: movie.title
            },
            customer: {
                _id: customer._id,
                name: customer.name
            },
            description: req.body.description,
            date: new Date()
        }, { new: true });
    
      if (!rental) return res.status(404).send('The movie with the given ID was not found.');
      
      res.send(rental);
});

router.delete('/:id', async (req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);

    if (!rental) return res.status(404).send('The movie with the given ID was not found.');

    res.send(rental);
});

module.exports = router;