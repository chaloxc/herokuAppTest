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
    let variableActivity = [];
    let nombre = "";
    let apellido = "";
    let email = "";
    let token = "";
    let key = "";
    let mapLabelValue = new Map();
    $(window).ready(onRender);
    
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', save);
   
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'

        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            // save schema
            schemas = data['schema'];
            console.log(schemas);
            for(var i = 0; i < data['schema'].length; i++) {
                var split = data['schema'][i].key.split('.');                
                mapLabelValue.set(data['schema'][i].key.split('.')[2],data['schema'][i].key);
                if(data['schema'][i].type === 'token'){
                    console.log("TOKEN ",split[0] + '.' +  split[1] +'.\"' + split[2] + '\"');
                
               }       
            }
            
            console.log(mapLabelValue);
            
            console.log(mapLabelValue);
            if(mapLabelValue.get("nombre")) {
                nombre = mapLabelValue.get("nombre");
            }
            if(mapLabelValue.get("apellido")) {
                apellido = mapLabelValue.get("apellido");
            }
            if(mapLabelValue.get("email")) {
                email = mapLabelValue.get("email");
            }
            if(mapLabelValue.get("token")) {
                token = mapLabelValue.get("token");
            }
            if(mapLabelValue.get("key")) {
                key = mapLabelValue.get("key");
            }

            connection.trigger('ready');
            connection.trigger('requestTokens');
            connection.trigger('requestEndpoints');            
         });

    };

    function initialize(data) {
        console.log(data);
        if (data) {
            payload = data;
        }
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};
        
        let title = inArguments[0].title?inArguments[0].title:"";
        let message = inArguments[0].message?inArguments[0].message:"";
        
        document.getElementById("title").value = title;
        document.getElementById("textarea").value = message;
        
        
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
               console.log(inArguments); 
            });
        });

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
        let message = document.getElementById("textarea").value?document.getElementById("textarea").value:"";
        let title = document.getElementById("title").value?document.getElementById("title").value:"";
        payload['arguments'].execute.inArguments = [{
            "title": title,
            "message": message,
            "nombre": "{{" + nombre + "}}",
            "email": "{{" + email + "}}",
            "apellido": "{{" + apellido + "}}",
            "token": "{{" + token + "}}",
            "key": "{{" + key + "}}"
        }];          
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);  
        let ARGUMENTOS = {
            title,
            message,
            nombre: "{{" + nombre + "}}",
            email: "{{" + email + "}}",
            apellido: "{{" + apellido + "}}",
            token: "{{" + token + "}}",
            key: "{{" + key + "}}"
        };          
        console.log("*** ARGUMENTS *** ",ARGUMENTOS);
    }

});