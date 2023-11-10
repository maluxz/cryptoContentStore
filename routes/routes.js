// const { response } = require('express');
const { response } = require('express');
const pool = require('../data/config'); // Asegúrate de proporcionar la ruta correcta al archivo config.js

const router = app => {
     app.get('/', (request, response) => {
         response.send({
            message: 'Bienvenido a Node.js'
            });
     });

     app.get('/usuarios', (request, response) => {
        pool.query('SELECT * FROM users',
        (error, result) => {
            if (error) throw error;

            response.send(result);
        });
    });

    app.get('/usuarios/:id', (request, response) => {
        pool.query('SELECT * FROM users WHERE id = ?', id, (error, result) => {
            if (error) throw error;

            response.send(result);
        });
    });

    app.post('/usuarios', (request, response) => {
        pool.query('INSERT INTO users SET ?',
        request.body, (error, result) => {
            if (error) throw error;

            response.status(201).send(`User added with ID: ${result.insertId}`);
        });
    });
}

module.exports = router;


// module.exports = function (app) {
//     // Ruta de inicio
//     app.get('/', (req, res) => {
//         res.send('¡Bienvenido a la página de inicio!');
//     });

//     // Ruta para mostrar un mensaje personalizado
//     app.get('/saludo/:nombre', (req, res) => {
//         const nombre = req.params.nombre;
//         res.send(`Hola, ${nombre}!`);
//     });

//     // Ruta para consultar la tabla en la base de datos
//     app.get('/consultar-tabla', (req, res) => {
//         pool.getConnection((error, connection) => {
//             if (error) {
//                 return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
//             }

//             // Realiza la consulta a la base de datos
//             const query = 'SELECT * FROM tabla';
//             connection.query(query, (error, results) => {
//                 connection.release(); // Libera la conexión

//                 if (error) {
//                     return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
//                 }

//                 res.json(results); // Envia los resultados como respuesta JSON
//             });
//         });
//     });

//     app.post('/insertar-dato', (req, res) => {
//         const { nombre, valor } = req.body; // Obtén los datos del cuerpo de la solicitud
    
//         // Realiza la inserción en la base de datos
//         const query = 'INSERT INTO tabla (nombre, valor) VALUES (?, ?)';
//         pool.query(query, [nombre, valor], (error, results) => {
//             if (error) {
//                 return res.status(500).json({ error: 'Error en la inserción en la base de datos' });
//             }
    
//             res.json({ message: 'Inserción exitosa' });
//         });
//     });
    

//     // Ruta de error 404 (no se encontró la página)
//     app.use((req, res) => {
//         res.status(404).send('Página no encontrada');
//     });


// };
