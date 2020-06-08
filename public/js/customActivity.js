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
        // JB will respond the first time 'ready' is called with 'initActivity'

        // pedimos el nombre de la data extension para poder mapear estos datos
        // al momento de correr el journey y se autocompleten con los datos que
        // corresponde en cada iteracion
        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            schemas = data['schema'];
            
            for(var i = 0; i < data['schema'].length; i++) {
                let key = data['schema'][i].key.split('.')[2]; 
                let value = data['schema'][i].key;
                dataObject +=  `, "${key}":"{{${value}}}"`;   
            }

            dataObject +=  `}`;    
            dataObject = JSON.parse(dataObject);
            // este caso particular trabaja con una data extension que tiene los siguientes campos
            // asi que los sacamos del mapa y los asignamos a las variables para agregarlos luego
            // cuando guardemos los datos a inArguments(que se va a procesar en el execute).
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
        let title       = inArguments[0].title?inArguments[0].title:"";
        let message     = inArguments[0].message?inArguments[0].message:"";
        let allowedData = 'Datos dinamicos disponibles: [';
        let getVariablesFrom = dataObject?dataObject:inArguments[0];
        
        for (const key in getVariablesFrom) {
            if (key != "title" && key != "message" && key != "token") {
                allowedData += "%" + key + "%, ";
            }
        }
        allowedData = allowedData.slice(0,-2) + "]";

        document.getElementById("title").value = title;
        document.getElementById("textarea").value = message;
        document.getElementById('allowVariables').innerHTML = allowedData;
        
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

    // Funcion que se ejecuta cuando apretamos en "done" desde marketing cloud
    // aca guardamos los datos que despues se van a enviar a nuestra app y se
    // van a procesar con execute()
    function save() {
        let message = document.getElementById("textarea").value?document.getElementById("textarea").value:"";
        let title = document.getElementById("title").value?document.getElementById("title").value:"";
        let args = [{ ...dataObject, title, message }];          
        payload['arguments'].execute.inArguments = args;
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);  
    }

});