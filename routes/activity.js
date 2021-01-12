    'use strict';
    var util = require('util');

    // Deps
    const Path = require('path');
    const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
    const admin = require("firebase-admin");
    //const serviceAccount = require(Path.join(__dirname, '..', 'lib', 'ticketsbayer-firebase-adminsdk-4pkyr-9e4c59b9df.json'));
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
                
                //admin.initializeApp({
                //    credential: admin.credential.cert(serviceAccount),
                //    databaseURL: "https://ticketsbayer.firebaseio.com"
                //});
                
                var jwtClient = new google.auth.JWT(
                    "firebase-adminsdk-4pkyr@ticketsbayer.iam.gserviceaccount.com",
                    null,
                    "----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDc2vAy8HTRA6VR\nDsJS5I/gbW8tIUSFFOwMO6Ky6eqs/BhxBJvro2FnYlKWh1GMTNuteM7O6IwN0vrG\nERNYmqge1PchI9861wJHpORa0xk/0XmzGHkW7PcjZHp62quC2ccM+vbshZeLi9WX\n/jnqnvJTiz8cd8v+2+f3RwEq2J+JpOuk0OM2ZP55R/Gv+Fq99vrgzWg6Tsb0Qk5c\nUR5x4R0urVAdT4Y9tQCZXoM9cPYCckirGlL3U/cjyDEqHY6Ft7Qer2nGw+6x7rW8\nH5YboWTzS4kmNC25QGAqOUD/4O4YNCippdggOLeUA2qL2ByqAbKo5dWw+VUQ9rAk\nADzFthopAgMBAAECggEAJlmOJApE/pZXen/JloNByIK4L2n7b/B2HJmuYsrjiS4t\nQFLAkGZKX51fIexVaLtf2fuETcFrsGrWSNZmOZiBYPkyAHsuJBV5u98SGANX+xDw\nxPyW6jgzod2stvCJn6sZOVPK1L9N1VluuXnXrLn08jTXvKXAsnyVBwc5WKtM6KV7\n6u7Zyc3Rcd9Cy/fcU0WdrFsKfHGPxI9/RT5r5QVxYhpmvS7lwqMdYyeGnACP9h+o\n6oWVZEji0fWsjkz2Zdl9prc9DmmMHFa8vEWPO9fcC2OXpW5phwrcbYu8LtszZd/O\nTu3hXPuo0EESMkkHSNvBQyJtjJvc3ka93qrLfhCAQQKBgQD5CgrjSdR3WSUef7+O\n4X0fgG1OFMqVCbKbvkRiZT5Ibo96KtJeGYVp5/wwi23+KKNa8Mek26wDymxTkCeB\nQ5rmukWAw/OY7uqbS11WQCMyCLrfrEzaPEdocd1ueJ9iyL8EGWAnTcpAFExOdXIw\npjWIB4jteSnss9wR7MTHuhbZVQKBgQDjBzre4sPsuQATohRv1CdpahPStkwKi9OM\nW7HToyWFfHRhP9ZDXxrNWeaOuWimLSP7zlUzmZSI1fkwNLJeigLPAdzpsZdRwpeP\ncJ3/Zf8OZnqjVZgqPlYFenJ1hKkQMLOWJlvR3wGMMmDC7expDEcI6XIgqJ3LS9YM\nUpJr8BZthQKBgQDwOxrDo+2bb1faMtsjRir/31AReQbue9taV1D6JbXOAzDOZU5m\nzXGf9tOUNHvXJ3Zk/E1pnyowwex7M1yYWhGrrlXrX5q1lQqk4S9ZSydoVXmG2FuO\nTYWIoAY9UYhWr1Vr69qQL38BD1OIf8y2Vy7eWH5irXWeyuVoOSCdlcoCvQKBgQCw\ngemCapnbTUZC/WuYOkDeE0wQMg1S0b2KzaunGJvOeaFeDqy+Oo3zBCdd5cb4E/Z7\nCsNxV8GE1Z9knEPlfrWKTi98PcehGIKPUgZ1D87KWmCU5rJkfYyRu86LkbWD0el+\nHpqaxCBG6NAUHbkFPzdnNWC3BYGREof7kqMmakZ1pQKBgEaocnxv2gS9plnkp8tM\np0pVfq9qv9kHbaOMaR74LT9d2umZH8OTT1eVTvidcmMiDdMrO3rV/g3SSxyLqNKB\nY+PB6RxHjvIWba7ByYKot62+PRtN9aCaR4zyxegwOtNp5sXxyNSsYjlIE3q1plru\nNLxaBtObQma357SFwxzW52L2\n-----END PRIVATE KEY-----\n",
                    scopes
                );

                var accessToken = ""

                jwtClient.authorize(function(error, tokens) {
                    if (error) {
                        console.log("Error making request to generate access token:", error);
                    } else if (tokens.access_token === null) {
                        console.log("Provided service account does not have permission to generate access tokens");
                    } else {
                        accessToken = tokens.access_token;
                      // See the "Using the access token" section below for information
                      // on how to use the access token to send authenticated requests to
                      // the Realtime Database REST API.
                    }
                });
                
                request.post({
                    'headers': {
                        'Authorization': 'Bearer '+accessToken,
                        'Content-Type': 'application/json'
                    },
                    'url': 'https://fcm.googleapis.com/v1/projects/ticketsbayer/messages:send',
                    'body': `
                        {
                            "message": {
                                "token": "${decodedArgs.token}",
                                "notification": {
                                    "title":"${customTitle}",
                                    "body":"${customMessage}",
                                    "click_action":"${urlRedirect}"
                                },
                                "webpush": {
                                    "notification": {
                                        "icon":"https://e7.pngegg.com/pngimages/340/745/png-clipart-computer-icons-white-instagram-icon-text-logo.png"
                                    }
                                }
                            }
                        }
                    `
                },(sendError, sendResponse, sendBody) => {
                    res.status(200).end();
                });
                res.status(200).end();
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
        res.status(200).send('Validate');
    };

    exports.stop = function (req, res) {
        console.log('stop');
        res.status(200).send('Stop');

    }
