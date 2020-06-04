'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
const express = require('express');
const app = express();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { Client } = require('pg')
const client = new Client({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.PORTBD,
    ssl: true
})
    client.connect()
/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    console.log('edit');
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    res.status(200).send('Edit');   
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {

    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {

    // example on how to decode JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            console.log(decodedArgs);
            client.query('INSERT into CLIENTS (MessageId, Phone, FieldMu1, FieldMu2, FieldMu3,' +
                        ' FieldMu4, FieldMu5, FieldSF1, FieldSF2, FieldSF3, FieldSF4, FieldSF5, trackMail, limits, subject)'+
                        ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                        [
                            decodedArgs.messageId, decodedArgs.phone, decodedArgs.field1MU, 
                            decodedArgs.field2MU, decodedArgs.field3MU, decodedArgs.field4MU,
                            decodedArgs.field5MU, decodedArgs.field1SF, decodedArgs.field2SF,
                            decodedArgs.field3SF, decodedArgs.field4SF, decodedArgs.field5SF, 
                            decodedArgs.trackMail, decodedArgs.limit, decodedArgs.subject
                        ])
            res.status(200).send();
        } else {
            res.status(400).end();
        }
    });
};
/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    res.status(200).send();
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    res.status(200).send('Validate');
};

exports.stop = function(req, res) {
    console.log('stop');
    res.status(200).send('Stop');

}