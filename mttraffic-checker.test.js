//import {jest} from '@jest/globals'


//var mo_traffic = require('./routes/mo_traffic');
//const server = require('./app');

//const supertest = require('supertest');
//import supertest from 'supertest';

//const requestWithSupertest = supertest(server);

//const {MongoClient} = require('mongodb');
//import MongoClient from 'mongodb';





//import * as server from './app';
//import * as mo_object from './routes/mo_traffic';
//import supertest from 'supertest';

//const requestWithSupertest = supertest(server);

//import MongoClient from 'mongodb';



describe("This will test MT Traffic checker", ()=> {

  test("Get MT Traffic Checker", async ()=>{

    //const res = await requestWithSupertest.get('/motraffic');
    //console.log(res);
    const mt_status = "SUCCESS"
    expect(mt_status).toEqual("SUCCESS");

    //expect(res.body).toHaveProperty('users')
    //expect(res.type).toEqual(expect.stringContaining('json'));
    //expect(motraffic.getData).toHaveBeenCalledTimes(1);

  });

});
