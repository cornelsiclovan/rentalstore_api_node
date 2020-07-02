const { Movie, validate } = require('../models/movie');
const { Genere } = require('../models/genere');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    
    const movies = await Movie.find().sort('title');
   
    res.send(movies);
});


router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    //console.log(genere);

    if(!movie) return res.status(404).send('The genere with this id is not foud');
   
    res.send(movie);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);

    const genere = await Genere.findById(req.body.genereId);
        if(!genere) return res.status(400).send('Invalid genere.');

    const movie = new Movie({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genere: {
            _id: genere._id,
            name: genere.name
        }
    });

    await movie.save()

    //generes.push(genere);
    res.send(movie);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if(error)
        return res.status(404).send(error.details[0].message);
    
    const genere = await Genere.findById(req.body.genereId);
        if(!genere) return res.status(400).send('Invalid genere.');    

    const movie = await Movie.findByIdAndUpdate(req.params.id, 
        { 
            title:  req.body.title,
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate,
            genere: {
                _id: genere._id,
                name: genere.name
            }
        }, {
        new: true
    });

    if(!movie)
        return res.status(404).send('The genere with this id is not found');

    res.send(movie);
});

router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
   
    if(!movie)
        return res.status(404).send('The genere with this id is not found');
    
    res.send(movie);
});

module.exports = router;