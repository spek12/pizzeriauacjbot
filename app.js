
//require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
const https = require('https');


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


const model = process.env.LUIS_MODEL;
const recognizer = new builder.LuisRecognizer(model)
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



    intents.matches('Saludar', function (session, results) {
    session.send('Hola, Bienvenido a Dominos Pizza <br/> Cual pizza te gustaria? <br/> Recuerda que cuenta con comandos de ayuda <br> -help <br/> -start over <br/> -good bye,-adios, -bye');
});


intents.onDefault(builder.DialogAction.send('No he entendido lo que quieres decir, intenta de nuevo con una bienvenida'));


