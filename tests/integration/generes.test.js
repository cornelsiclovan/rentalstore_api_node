const { User } = require('../../models/user');
const { Genere } = require('../../models/genere');
const request = require('supertest');
const mongoose = require('mongoose');

let server;

describe('/api/generes', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => { 
        await server.close(); 
        await Genere.remove({});
    });
    
    describe('GET /', () => {
        it('should return all generes', async () => {
            
            await Genere.collection.insertMany([
                {name: 'genere1'},
                {name: 'genere2'},
            ])

            const res = await request(server).get('/api/generes');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genere1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genere2')).toBeTruthy();
        })
    });

    describe('GET /:id', () => {
        it('should return genere if valid id is passed', async () => {

            const genere = new Genere({ name: 'genere1' })
            await genere.save();

            const res = await request(server).get('/api/generes/' + genere._id);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genere.name);
        });

        it('should return 404 if invalid id is passed', async () => {

            const res = await request(server).get('/api/generes/1');
            
            expect(res.status).toBe(404);
        });

        it('should return 404 if no genere with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/generes/' + id);
            
            expect(res.status).toBe(404);
        })
    });

    describe('POST /', () => {

        // Define the happy path, and then in each test, we change
        // one parameter that clearly aligns with the name of the 
        // test.
        let token;
        let name;

        const exec = () => {
            return request(server)
                .post('/api/generes')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genere1';
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genere is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();
        
            expect(res.status).toBe(400);
        });

        it('should return 400 if genere is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();
        
            expect(res.status).toBe(400);
        });


        it('should save the genere if it is valid', async () => {
            await exec();
        
            const genere = await Genere.find({ name: 'genere1' });
            
            expect(genere).not.toBeNull();
        });

        it('should should return genere if it is valid', async () => {
            const res = await exec();
            
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genere1');
        });
    });

    describe('PUT /:id', () => {

        let name;
        let id;

        const exec = async () => {
            return await request(server)
                .put('/api/generes/' + id)
                .send({ name });
        }

        beforeEach(async () => {
            name = 'gebere1';
            id = mongoose.Types.ObjectId();

            const genere = new Genere({ name: 'genere1' });
            await genere.save();

        }); 

        it('should return 400 if genere is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();
        
            expect(res.status).toBe(400);
        });

        it('should return 400 if genere is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();
        
            expect(res.status).toBe(400);
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if send id is not found', async () => {
            id = mongoose.Types.ObjectId();
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should save the genere if id exists and is valid and the data is valid', async () => {
            const genere = new Genere({ name: 'genere2' });
            await genere.save();

            id = genere._id;
            name = genere.name;

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genere.name)
        });
    });

    describe('DELETE /:id', () => {
        let id;
        let token;
        let user;

        const exec = async () => {
            return await request(server)
                .delete('/api/generes/' + id)
                .set('x-auth-token', token);
        }

        beforeEach(async () => {
            id = mongoose.Types.ObjectId();
            
            user = { 
                _id: mongoose.Types.ObjectId().toHexString(), 
                isAdmin: true 
            };

            token = new User(user).generateAuthToken();

            const genere = new Genere({ name: 'genere1' });
            await genere.save();
        }); 

        it('should return 401 if client is not logged in', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if client is not authorized', async() => {
            user = { 
                _id: mongoose.Types.ObjectId().toHexString(), 
                isAdmin: false 
            };

            token = new User(user).generateAuthToken();

            const res = await exec();
            expect(res.status).toBe(403);
        })


        it('should return 404 if invalid id is passed', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if id is not found', async () => {
            id = mongoose.Types.ObjectId();
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200 id exists user is authorized and id is found', async () => {
            const genere = new Genere({ name: 'genere2' });
            await genere.save();

            id = genere._id;

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genere.name);
        });
    });
});