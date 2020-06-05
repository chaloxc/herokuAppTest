    'use strict';
    var util = require('util');

    // Deps
    const Path = require('path');
    const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
    const express = require('express');
    const app = express();
    const request = require('request');

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
            // decoded contiene los parametros que definimos en el config.json y se completan con nuestra data extension
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                var decodedArgs = decoded.inArguments[0];
                console.log('Decoded arguments', decodedArgs);
                console.log('Token', decodedArgs.token);
                console.log('Ttitle', decodedArgs.title);
                console.log('Message', decodedArgs.message);
                request.post({
                    'headers': {
                        'Authorization': 'key=AAAA6sSylXA:APA91bFT31-TLQq6XVYgrT7IZN4cq3kXKbPl1RKXtx7fgsfzRg_D2VOlRiods3IHHYj09JvFw8YVWZxqZP4F7EeTXgE70VPrggZNXn4Wt-TBHucRZDssmqrnmjwJn_Yrm5zk6RCAStTG',
                        'Content-Type': 'application/json'
                    },
                    'url': 'https://fcm.googleapis.com/fcm/send',
                    'body': `
                        { 
                            "to":"${decodedArgs.token}",
                            "notification":{
                              "title":"${decodedArgs.title + decodedArgs.nombre}",
                              "body":"${decodedArgs.message}"
                            },
                            "data":{
                              "title":"Titulo datos",
                              "body":"Body datos "
                            },
                            "priority":"high"
                        }
                    `
                },(sendError, sendResponse, sendBody) => {
                    res.status(200).end();
                });
                res.status(200).end();
            } else {
                console.error('inArguments invalid.');
                return res.status(400).end();
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
        res.status(200).send('Validate');
    };

    exports.stop = function (req, res) {
        console.log('stop');
        res.status(200).send('Stop');

    }
