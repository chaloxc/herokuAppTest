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
    let dataObject = {
        title: "",
        message: ""
    };
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

        // pedimos el nombre de la data extension para poder mapear estos datos
        // al momento de correr el journey y se autocompleten con los datos que
        // corresponde en cada iteracion
        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            schemas = data['schema'];
            console.log(schemas);
            for(var i = 0; i < data['schema'].length; i++) {
                var split = data['schema'][i].key.split('.');
                let key = data['schema'][i].key.split('.')[2];                
                mapLabelValue.set(data['schema'][i].key.split('.')[2],data['schema'][i].key);
                dataObject = { ...dataObject, key : ""  }
                if(data['schema'][i].type === 'token'){
                    console.log("TOKEN ",split[0] + '.' +  split[1] +'.\"' + split[2] + '\"');
                
               }       
            }
            
            // este caso particular trabaja con una data extension que tiene los siguientes campos
            // asi que los sacamos del mapa y los asignamos a las variables para agregarlos luego
            // cuando guardemos los datos a inArguments(que se va a procesar en el execute).
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
        let allowedData = 'Datos dinamicos disponibles: [';
        for (const key in inArguments[0]) {
            if (key!="tilte" && key!="message") {
                allowedData += "%" + key + "%, ";
            }
        }
        allowedData = allowedData.slice(0,-2) + "]";

        document.getElementById("title").value = title;
        document.getElementById("textarea").value = message;
        document.getElementById('allowVariables').innerHTML = allowedData;
        
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

    // Funcion que se ejecuta cuando apretamos en "done" desde marketing cloud
    // aca guardamos los datos que despues se van a enviar a nuestra app y se
    // van a procesar con execute()
    function save() {
        let message = document.getElementById("textarea").value?document.getElementById("textarea").value:"";
        let title = document.getElementById("title").value?document.getElementById("title").value:"";
        console.log("Dinamic dataobject", dataObject);
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