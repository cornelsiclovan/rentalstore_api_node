const validateObjectId = require('../middleware/validateObjectId');
const { Genere, validate } = require('../models/genere');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


router.get('/',async (req, res) => {
    //throw new Error('Could not get the generes.');
    const generes = await Genere.find().sort('name');
    res.send(generes);
});


router.get('/:id', validateObjectId, async (req, res) => {

    const genere = await Genere.findById(req.params.id);

    //console.log(genere);

    if(!genere) return res.status(404).send('The genere with this id is not foud');
   
    res.send(genere);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if(error)
        return res.status(400).send(error.details[0].message);

    let genere = new Genere({
        name: req.body.name
    });

    await genere.save()

    //generes.push(genere);
    res.send(genere);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if(error)
        return res.status(404).send(error.details[0].message);

    const genere = await Genere.findByIdAndUpdate(req.params.id, { name:  req.body.name}, {
        new: true
    });

    if(!genere)
        return res.status(404).send('The genere with this id is not found');

    res.send(genere);
});

router.delete('/:id', [auth, admin], async (req, res) => {
    const genere = await Genere.findByIdAndRemove(req.params.id);
   
    if(!genere)
        return res.status(404).send('The genere with this id is not found');
    
    res.send(genere);
});


module.exports = router;