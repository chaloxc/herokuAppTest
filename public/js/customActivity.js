const { document } = require("window-or-global");

define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';
    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};    
    var schemas = [];  
    let dataObject = `{ "WPNtitle":"", "WPNmessage":""`;
    
    $(window).ready(onRender);
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', save);
   
    function onRender() {
        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            schemas = data['schema'];

            for(var i = 0; i < schemas.length; i++) {
                let key     = schemas[i].key.split('.')[2]; 
                let value   = schemas[i].key;
                dataObject += `, "${key}":"{{${value}}}"`;   
            };

            dataObject +=  `}`;    
            dataObject = JSON.parse(dataObject);
            connection.trigger('ready');
            connection.trigger('requestTokens');
            connection.trigger('requestEndpoints');            
         });

    };

    function initialize(data) {
        if (data) {
            payload = data;
        };

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        let inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [{}];
        let title       = inArguments[0].WPNtitle?inArguments[0].WPNtitle:"";
        let message     = inArguments[0].WPNmessage?inArguments[0].WPNmessage:"";
        let urlRedirect = inArguments[0].urlRedirect?inArguments[0].urlRedirect:"";
        let allowedData = 'Datos disponibles: ';
        let getVariablesFrom = dataObject ? dataObject : inArguments[0];
        let tokenExists = false;
        
        for (const key in getVariablesFrom) {
            if (key === "token") {
                document.getElementById("variablesInfo").style.display = 'block';
                tokenExists = true;
            }
            if (key != "WPNtitle" && key != "WPNmessage" && key != "token" && key != "key") { // token deberia ser WPNtoken desde la data extension
                allowedData += key + ", ";
            }
        };

        allowedData = allowedData.slice(0,-2) + ".";
        
        if (!tokenExists) {
            document.getElementById("error").style.display = 'block';
            document.getElementById("variablesInfo").style.display = 'none';
            document.getElementById("title").value = "";
            document.getElementById("textarea").value = "";
            document.getElementById("urlRedirect").value = "";
            document.getElementById("title").readOnly = true;
            document.getElementById("textarea").readOnly = true;
            document.getElementById("urlRedirect").readOnly = true;
            return;
        };
        
        if (Object.keys(getVariablesFrom).length > 3) {
            document.getElementById("allowVariables").innerHTML = allowedData;
        };

        document.getElementById("title").value = title;
        document.getElementById("textarea").value = message;
        let urlInput = document.getElementById("urlRedirect");   
        urlInput.value = urlRedirect ? urlRedirect : "";
        if(document.getElementById("redirect").checked){     
            urlInputstyle.display = "block";
        } else {
            urlInputstyle.display = "none";
        }
        

        
        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true,
        });
    };

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    };

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    };

    function save() {
        let WPNmessage = document.getElementById("textarea").value ? document.getElementById("textarea").value : "";
        let WPNtitle = document.getElementById("title").value ? document.getElementById("title").value : "";
        let urlRedirect = document.getElementById("urlRedirect").value ? document.getElementById("urlRedirect").value : "";
        let isCustomRedirect = document.getElementById("redirect").checked;
        let args = [{ ...dataObject, WPNtitle, WPNmessage, urlRedirect, isCustomRedirect }];          
        payload['arguments'].execute.inArguments = args;
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);  
    };

});