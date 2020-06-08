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
    let dataObject = `{ "title":"", "message":""`;
    
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
        let title       = inArguments[0].title?inArguments[0].title:"";
        let message     = inArguments[0].message?inArguments[0].message:"";
        let allowedData = 'Datos disponibles: ';
        let getVariablesFrom = dataObject ? dataObject : inArguments[0];
        let tokenExists = false;
        
        for (const key in getVariablesFrom) {
            if (key === "token") {
                document.getElementById("variablesInfo").style.display = 'block';
                tokenExists = true;
            }
            if (key != "title" && key != "message" && key != "token" && key != "key") {
                allowedData += key + ", ";
            }
        };

        allowedData = allowedData.slice(0,-2) + ".";
        
        if (!tokenExists) {
            document.getElementById("error").style.display = 'block';
            document.getElementById("variablesInfo").style.display = 'none';
            document.getElementById("title").value = "";
            document.getElementById("textarea").value = "";
            document.getElementById("title").readOnly = true;
            document.getElementById("textarea").readOnly = true;
            return;
        };
        
        if (Object.keys(getVariablesFrom).length > 3) {
            document.getElementById("allowVariables").innerHTML = allowedData;
        };

        document.getElementById("title").value = title;
        document.getElementById("textarea").value = message;
        
        
        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true,
        });
    };

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    };

    function save() {
        let message = document.getElementById("textarea").value ? document.getElementById("textarea").value : "";
        let title = document.getElementById("title").value ? document.getElementById("title").value : "";
        let args = [{ ...dataObject, title, message }];          
        payload['arguments'].execute.inArguments = args;
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);  
    }

});