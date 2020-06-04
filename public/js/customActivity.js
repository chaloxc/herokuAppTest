define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';
    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};
    var phone;
    var messageId = '';
    var option = '';        
    var schemas = [];  
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
                option += '<option value="'+ split[2] + '">' + split[2] + '</option>';   
               if(data['schema'][i].type === 'Phone'){
                    phone = split[0] + '.' +  split[1] +'.\"' + split[2] + '\"';
                    console.log(phone);
               } 
            }
            $('#var1').append(option);
            $('#var2').append(option);
            $('#var3').append(option);
            $('#var4').append(option);
            $('#var5').append(option);
            connection.trigger('ready');

            connection.trigger('requestTokens');
            connection.trigger('requestEndpoints');            
         });

    }

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

        console.log(inArguments);
        document.getElementById("camp").value = inArguments[0].subject;
        document.getElementById("messageId").innerHTML = inArguments[0].messageId;
        document.getElementById("textarea").value = inArguments[0].message;
        document.getElementById("sender").value = inArguments[0].sender;
        document.getElementById("trackMail").value = inArguments[0].trackMail;        
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                console.log(key + ' ' +  val);
                if (key.localeCompare('phone') == 0 && (val.trim() && !val.includes(phone))) {
                    var r = confirm("El campo telefono en la fuente de entrada cambio, presione OK para actualizar");
                    if (r) {
                        payload['arguments'].execute.inArguments[index][key] = '{{'+ phone + '}}';
                        connection.trigger('updateActivity', payload);  
                    }
                    else {
                        alert("Recuerde guardar antes de salir");
                    }
                } 
            });
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true,
        });
    }

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }

    function save() {
        var options = [];
        var varSF1 = '';
        var varSF2 = '';
        var varSF3 = '';
        var varSF4 = '';
        var varSF5 = '';
        var canSend = $("#canSend").val();
        var limit = $("#limit").val();
        var trackMail = $("#trackMail").val();
        console.log(limit);
        var group = document.getElementById("group").innerHTML;
        messageId = document.getElementById("messageId").innerHTML;
        var subject = document.getElementById("camp").value;
        $("#var1Mail option").each(function(){
            options.push(this.value);
        });
        console.log(schemas);
        for(var i = 0; i < schemas.length; i++) {
            var split = schemas[i].key.split('.');
            console.log($('#var1 option:selected').val() === split[2])
            console.log($('#var1 option:selected').val())
            if($('#var1 option:selected').val() === split[2] && $('#var1 option:selected').val() != '') {
                varSF1 = '{{'+ split[0] + '.' +  split[1] +'.\"' + split[2] + '\"}}';
                console.log(varSF1)
                console.log(phone)
            }
            
            if($('#var2 option:selected').val() === split[2] && $('#var2 option:selected').val() != '') {
                varSF2 = '{{'+ split[0] + '.' +  split[1] +'.\"' + split[2] + '\"}}';
            }

            if($('#var3 option:selected').val() === split[2] && $('#var3 option:selected').val() != '') {
                varSF3 = '{{'+ split[0] + '.' +  split[1] +'.\"' + split[2] + '\"}}';
            }

            if($('#var4 option:selected').val() === split[2] && $('#var4 option:selected').val() != '') {
                varSF4 = '{{' + split[0] + '.' +  split[1] +'.\"' + split[2] + '\"}}';
            }

            if($('#var5 option:selected').val() === split[2] && $('#var5 option:selected').val() != '') {
                varSF5 = '{{'+ split[0] + '.' +  split[1] +'.\"' + split[2] + '\"}}';
            }                                    
            
        }            
            if(canSend === 'true' && phone != null) {
                payload['arguments'].execute.inArguments = [{
                    "tokens": authTokens,
                    "messageId" : messageId,
                    "phone": '{{'+ phone + '}}' ,
                    "limit": limit,                    
                    "field1SF": varSF1 ,
                    "field2SF": varSF2 ,
                    "field3SF": varSF3 ,
                    "field4SF": varSF4 ,
                    "field5SF": varSF5 ,
                    "field1MU": $('#var1Mail option:selected').val(),
                    "field2MU": $('#var2Mail option:selected').val(),
                    "field3MU": $('#var3Mail option:selected').val(),
                    "field4MU": $('#var4Mail option:selected').val(),
                    "field5MU": $('#var5Mail option:selected').val(),
                    "trackMail": trackMail,
                    "subject": subject,
                    "message": document.getElementById("textarea").value,
                    "sender": document.getElementById("sender").value
                }];
                console.log(payload['arguments']);          
                payload['metaData'].isConfigured = true;
                connection.trigger('updateActivity', payload);      

            } else if(canSend === 'false' || phone == null) {
                alert('Presione el boton de Guardar antes de continuar y si lo hizo configure los datos antes del mensaje');
                onRender();     
            }  
    }

});