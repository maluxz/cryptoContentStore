const pool = require('../data/config'); // Asegúrate de proporcionar la ruta correcta al archivo config.js

module.exports = function (app) {
    // Ruta de inicio
    app.get('/', (req, res) => {
        res.send('¡Bienvenido a la página de inicio!');
    });

    // Ruta para mostrar un mensaje personalizado
    app.get('/saludo/:nombre', (req, res) => {
        const nombre = req.params.nombre;
        res.send(`Hola, ${nombre}!`);
    });

    // Ruta para consultar la tabla en la base de datos
    app.get('/consultar-tabla', (req, res) => {
        pool.getConnection((error, connection) => {
            if (error) {
                return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
            }

            // Realiza la consulta a la base de datos
            const query = 'SELECT * FROM tabla';
            connection.query(query, (error, results) => {
                connection.release(); // Libera la conexión

                if (error) {
                    return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                }

                res.json(results); // Envia los resultados como respuesta JSON
            });
        });
    });

    // Ruta de error 404 (no se encontró la página)
    app.use((req, res) => {
        res.status(404).send('Página no encontrada');
    });


};
