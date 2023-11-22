// const { response } = require('express');
const bcrypt = require('bcrypt');
const { response } = require('express');
const pool = require('../data/config'); // Asegúrate de proporcionar la ruta correcta al archivo config.js



const router = app => {
     app.get('/', (request, response) => {
         response.send({
            message: 'Bienvenido a Node.js'
            });
     });

     app.get('/usuarios', (request, response) => {
        pool.query('SELECT * FROM usuarios',
        (error, result) => {
            if (error) throw error;

            response.send(result);
        });
    });

    // Ruta para consultar un ID específico en la tabla
    app.get('/usuarios/:id', (req, res) => {
        const id = req.params.id;

        // Verifica si el parámetro de ID es un número válido
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El ID debe ser un número válido' });
        }

        pool.getConnection((error, connection) => {
            if (error) {
                return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
            }

            // Realiza la consulta a la base de datos para obtener el registro con el ID especificado
            const query = 'SELECT * FROM usuarios WHERE idusuario = ?';
            connection.query(query, [id], (error, results) => {
                connection.release(); // Libera la conexión

                if (error) {
                    return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                }

                // Verifica si se encontró un registro con el ID especificado
                if (results.length === 0) {
                    return res.status(404).json({ mensaje: 'No se encontró ningún registro con el ID especificado' });
                }

                res.json(results[0]); // Envia el primer resultado como respuesta JSON (suponiendo que id es único)
            });
        });
    });

    app.post('/usuarios', async (req, res) => {
        const { nombre, pass } = req.body;

        if (!nombre || !pass) {
            return res.status(400).json({ error: 'Se requieren nombre y contraseña' });
        }

        // Genera un salt y hashea la contraseña
        const saltRounds = 4;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        pool.getConnection((error, connection) => {
            if (error) {
                return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
            }

            // Realiza la inserción en la base de datos
            const query = 'INSERT INTO usuarios (nombre, password) VALUES (?, ?)';
            connection.query(query, [nombre, hashedPassword], (error, results) => {
                connection.release(); // Libera la conexión

                if (error) {
                    return res.status(500).json({ error: 'Error al insertar datos en la base de datos' });
                }

                res.json({ mensaje: 'Datos insertados correctamente. ID Usuario: ' });
            });
        });
    });

    // app.put('/usuarios/:id', (request, response) => {
    //     const id = request.params.id;

    //     pool.query('UPDATE usuarios SET ? WHERE idusuario = ?', [request, body, id], (error, result) => {
    //         {
    //             if (error) throw error;

    //             response.send('Usuario actualizado correctamente');
    //         }
    //     });
    // });

    app.put('/usuarios/:id', (req, res) => {
        const usuarioId = req.params.id;
        const nuevoCorreo = req.body.nuevoCorreo;

        // Validaciones de datos
        if (!nuevoCorreo || !usuarioId) {
            return res.status(400).json({ error: 'El nuevo correo y el ID de usuario son obligatorios' });
        }

        try {
            // Realiza la operación de actualización en la base de datos
            pool.getConnection((error, connection) => {
                if (error) {
                    return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
                }

                const updateQuery = 'UPDATE usuarios SET email = ? WHERE idusuario = ?';
                const queryValues = [nuevoCorreo, usuarioId];

                connection.query(updateQuery, queryValues, async (error, results) => {
                    connection.release(); // Libera la conexión

                    if (error) {
                        return res.status(500).json({ error: 'Error al actualizar el correo electrónico en la base de datos' });
                    }

                    // Verifica si se actualizó algún registro
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
                    }

                    res.json({ mensaje: 'Correo electrónico actualizado correctamente' });
                });
            });
        } catch (error) {
            return res.status(500).json({ error: 'Error en la actualización del correo electrónico' });
        }
    });

    app.delete('/usuarios', (request, response) => {
        response.send({
           message: 'Debe específicar el ID a eliminar'
           });
    });

    // Ruta para eliminar un usuario por su ID
    app.delete('/usuarios/:id', (req, res) => {
        const usuarioId = req.params.id;

        // Verifica si el ID proporcionado es un número entero
        if (isNaN(usuarioId) || !Number.isInteger(Number(usuarioId))) {
            return res.status(400).json({ error: 'ID de usuario no válido' });
        }

        // Realiza la operación de eliminación en la base de datos
        pool.getConnection((error, connection) => {
            if (error) {
                return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
            }

            const query = 'DELETE FROM usuarios WHERE idusuario = ?';
            connection.query(query, [usuarioId], (error, results) => {
                connection.release(); // Libera la conexión

                if (error) {
                    return res.status(500).json({ error: 'Error al eliminar el usuario de la base de datos' });
                }

                // Verifica si se eliminó algún registro
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }

                res.json({ mensaje: 'Usuario eliminado correctamente' });
            });
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

