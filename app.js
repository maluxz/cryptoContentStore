// Require packages and set the port
const express = require('express'); // Importa el módulo Express.js
const port = 3002; // Define el número de puerto en el que se ejecutará el servidor Express

// Para permitir manejo de POST y PUT
const bodyParser = require('body-parser'); // Importa el módulo body-parser para procesar datos de solicitudes HTTP
const routes = require('./routes/routes'); // Importa las rutas definidas en otro archivo
const app = express(); // Crea una instancia de la aplicación Express

// Usar Node.js body parsing middleware
app.use(bodyParser.json()); // Configura Express para analizar datos JSON en las solicitudes
app.use(bodyParser.urlencoded({
    extended: true,
})); // Configura Express para analizar datos codificados en URL en las solicitudes

routes(app); // Llama a la función `routes` pasando la instancia de la aplicación Express como argumento para configurar las rutas

// Iniciar el servidor
const server = app.listen(port, (error) => { // Inicia el servidor Express y escucha en el puerto especificado
    if (error) return console.log(`Error: ${error}`); // Si ocurre un error al iniciar el servidor, muestra un mensaje de error en la consola

    console.log(`El servidor escucha en el puerto ${server.address().port}`); // Si el servidor se inicia con éxito, muestra un mensaje indicando en qué puerto está escuchando
});
