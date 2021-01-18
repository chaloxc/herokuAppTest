    'use strict';
    var util = require('util');

    // Deps
    const Path = require('path');
    const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
    const admin = require("firebase-admin");
    const serviceAccount = require(Path.join(__dirname, '..', 'lib', 'ticketsbayer-firebase-adminsdk-4pkyr-9e4c59b9df.json'));
    var { google } = require("googleapis");
    var scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/firebase.database"
      ];
    const express = require('express');
    const app = express();
    const request = require('request');

    /*
     * POST Handler for / route of Activity (this is the edit route).
     */
    exports.edit = function (req, res) {
        console.log('edit');
        JWT(req.body, process.env.jwtSecret, (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).end();
            }
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                console.log("Decoded: "+decoded);
            }
        });
        // Data from the req and put it in an array accessible to the main app.
        //console.log( req.body );
        res.status(200).send('Edit');
    };

    /*
     * POST Handler for /save/ route of Activity.
     */
    exports.save = function (req, res) {
        JWT(req.body, process.env.jwtSecret, (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).end();
            }
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                console.log("Decoded: "+decoded);
            }
        });
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
                let customTitle = decodedArgs.WPNtitle;
                let customMessage = decodedArgs.WPNmessage;
                let urlRedirect = "http://www.agrofy.com.ar";
                if(decodedArgs.urlRedirect && decodedArgs.isChecked){
                    urlRedirect = decodedArgs.urlRedirect;
                }

                if(!decodedArgs.token) {
                    return res.status(200).end();
                };

                for (const key in decodedArgs) {
                    if (key != "WPNtitle" && key != "WPNmessage" && key != "token" && key != "key") { // deberia ser WPNtoken desde el data extension
                        let keyToReplace = new RegExp('%%'+key+'%%',"g");
                        customTitle = customTitle.replace(keyToReplace, decodedArgs[key]);
                        customMessage = customMessage.replace(keyToReplace, decodedArgs[key]);
                    };
                };
                // "image": "url-to-image"
                
                try {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        databaseURL: "https://ticketsbayer.firebaseio.com"
                    });
                    console.log('@ Inicializando por primera vez ...');
                } catch(e) {
                    console.log("error: "+e);
                };
                
                admin.messaging().send(message)
                            .then((response) => {
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.log('Error sending message:', error);
                            });
                
                /*var jwtClient = new google.auth.JWT(
                    serviceAccount.client_email,
                    null,
                    serviceAccount.private_key,
                    scopes
                );

                jwtClient.authorize(function(error, tokens) {
                    if (error) {
                        console.log("Error making request to generate access token:", error);
                    } else if (tokens.access_token === null) {
                        console.log("Token: "+token);
                        console.log("Provided service account does not have permission to generate access tokens");
                    } else {
                        console.log("@ Access token: "+tokens.access_token);
                        
                        var message = {
                            token: `${decodedArgs.token}`,
                            notification: {
                                title:`${customTitle}`,
                                body:`${customMessage}`,
                            },
                            webpush: {
                                notification: {
                                    icon:`https://www.agrofy.com.ar/favicon.ico`,
                                    click_action:`${urlRedirect}`
                                }
                            }
                        };

                        admin.messaging().send(message)
                            .then((response) => {
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.log('Error sending message:', error);
                            });
                    }
                })
                */
                
            } else {
                console.error('inArguments invalid.');
                return res.status(400).end();
            };
            
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
        JWT(req.body, process.env.jwtSecret, (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).end();
            }
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                console.log("Decoded: "+decoded);
            }
        });

        
        res.status(200).send('Validate');
    };

    exports.stop = function (req, res) {
        console.log('stop');
        res.status(200).send('Stop');

    }
