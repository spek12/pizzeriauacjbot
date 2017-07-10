
//Librerias
var builder = require('botbuilder');
var restify = require('restify');


//crear connector de chat, msg, skype, etc
var connector = new builder.ChatConnector ({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//Creo el bot
var bot = new builder.UniversalBot(connector);






// Crearmos el servidor
var server =restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listen to %s', server.name, server.url);

});
server.post('/api/messages', connector.listen());

//Creamos la conexion con LUIS

const recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/aa8663b3-153a-4190-81b0-deaa1dcba418?subscription-key=1b32aced334346dcb4d40613fac774fe&verbose=true&timezoneOffset=-420&q=');
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', intents); 




bot.dialog('help', function (session, args, next) {
    session.endDialog("Este bot te ayudara a crear una orden en una Pizzeria.");
})
.triggerAction({
    matches: /^-help$/i,
});




// Dialog to ask for a date and time
bot.dialog('tiempo', [
    function (session) {
        builder.Prompts.time(session, "Porfavor introduce la fecha deseada (e.g.: June 6th at 5pm)");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])

.beginDialogAction('tiempoHelpAction', 'tiempoHelp', { matches: /^ayuda$/i });

// Context Help dialog for party size
bot.dialog('tiempoHelp', function(session, args, next) {
    var msg = "Ayuda de entrega: La fecha debe de estar en un formato de MM/DD/AAAA HH:MM:SS.";
    session.endDialog(msg);
});

bot.dialog('entrega', [
    function (session) {
        builder.Prompts.text(session, "Porfavor, introduce tu domicilio");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);



// Context Help dialog for party size
/*bot.dialog('pizzaHelp', function(session, args, next) {
    session.send("Pizza de ayuda: El costo de la pizza %(nombre)s, tiene un costo de %(costo)s. <br/>", salesData.canelazo);
    session.send("Pizza de ayuda: El costo de la pizza %(nombre)s, tiene un costo de %(costo)s.<br/>", salesData.newyork);
    session.send("Pizza de ayuda: El costo de la pizza %(nombre)s, tiene un costo de %(costo)s.<br/>", salesData.chicago);
    session.endDialog("Pizza de ayuda: El costo de la pizza %(nombre)s, tiene un costo de %(costo)s.<br/>", salesData.chorizo);
    
}); */



// Dialog to ask for the reservation name.
bot.dialog('nombre', [
    function (session) {
        builder.Prompts.text(session, "A que nombre, sera la reservacion.");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);




var salesData = {
    "newyork": {
        nombre: "newyork",
        costo: "$260",
        descripcion: "Contiene queso y peperoni"
    },
    "hawai": {
        nombre: "hawai",
        costo: "$200",
        descripcion: "Contiene pina y peperoni"
    },
    "chicago": {
        nombre: "chicago",
        costo: "$200",
        descripcion: "Contiene aceitunas y peperoni"
    },

    "chorizo": {
        nombre: "chorizo",
        costo: "$200",
        descripcion: "Contiene queso y chorizo"
    },
    "jamon": {
        nombre: "jamon",
        costo: "$200",
        descripcion: "Contiene jamon y  peperoni"
    },
    "tres quesos": {
        nombre: "tres quesos",
        costo: "$200",
        descripcion: "Contiene 3 quesos"
    },
    "canelazo": {
        nombre: "canelazo",
        costo: "$200",
        descripcion: "Es un postre de canela"
    }

};







//LUIS

intents.matches('Saludar', [
    function (session) {
    session.send('Hola, Bienvenido a Dominos Pizza <br/> Cual pizza te gustaria? <br/> Recuerda que cuenta con comandos de ayuda <br> -help <br/> -start over <br/> -good bye,-adios, -bye');
    session.beginDialog('pizzas');
    },

    function (session, results) {
        session.send("Gracias escojiste la pizza %(nombre)s con un costo de %(costo)s , y su descrpcion es: %(descripcion)s",results);
        
        session.beginDialog('entrega');
    },
    function (session, results) {
        session.dialogData.domicilio = results.response;
        session.beginDialog('tiempo');
    },

    function (session, results) {
        session.dialogData.tiempo = builder.EntityRecognizer.resolveTime([results.response]);
        session.beginDialog('nombre');
    },
    function (session, results, next) {
        
        session.dialogData.nombre = results.response;
        // Process request and display reservation details
        session.send("Reservacion completada. Detalles de reservacion: <br/>Date/Time: %s <br/> Nombre: %s <br/> Domicilio: %s <br/> ",
            session.dialogData.tiempo, session.dialogData.nombre, session.dialogData.domicilio);
         session.endDialog();
    }
])
.endConversationAction(
    "endPizza", "Ok. Goodbye.",
    {
        matches: /^-goodbye$|^adios$|^bye$/i,
        confirmPrompt: "Esto terminara la conversacion. Estas seguro?"
    }
)
.reloadAction(
    "restartOrderDinner", "Ok. Empecemos de nuevo.",
    {
        matches: /^-start over$/i,
        confirmPrompt: "This wil cancel your order. Are you sure?"
    }
);



intents.matches('Cancelar', function (session, results) {
    session.send('Pedido cancelado correctamente. ¡Vuelva pronto!');
});

intents.onDefault(builder.DialogAction.send('No he entendido lo que quieres decir'));


bot.dialog('pizzas', [ 
    function (session) {
        builder.Prompts.choice(session, "Aqui tienes nuestro menu", salesData,{listStyle: builder.ListStyle.button});
    },
    function (session, results) {
        if (results.response) {
            if(results.response.entity.match(/^chorizo$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "http://www.grandbaby-cakes.com/wp-content/uploads/2014/04/chorizo-mexican-pizza-4-1024x682.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
        }
        



           else if(results.response.entity.match(/^newyork$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "https://img.grouponcdn.com/deal/M8axAkXEr7MHZYTfLh6EyoJhuFf/M8-900x540/v1/c700x420.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
        }
        

        else if(results.response.entity.match(/^canelazo$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "https://www.peterpiperpizza.com/new/images/menuItems/canelazo.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
            }

         else if(results.response.entity.match(/^hawai$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "https://i.ytimg.com/vi/KyaCyJrh_zI/maxresdefault.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
        }
               else if(results.response.entity.match(/^jamon$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "http://www.pisscopiero.com/wp-content/uploads/2015/04/IMG_20150304_125007.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
            }
           else if(results.response.entity.match(/^jamon$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "http://vancamps.com/dynamics/recipes/bo/pizza-tres-quesos--video.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
        }
        
        else if(results.response.entity.match(/^jamon$/i)){
             var msg = new builder.Message(session)
            .text("Espera un momento.....")
            .attachments([{
                contentType: "image/jpg",
                contentUrl: "http://www.scottspizzatours.com/images/temphome.jpg"
            }]);
              session.send(msg);
            var results = salesData[results.response.entity];
            session.endDialogWithResult(results); 
            }





        } else {
            session.send("OK");
        }
    }
 ])