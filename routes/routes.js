// const { response } = require('express');
// Este código configura un servidor Express en el puerto 3002, habilita el análisis de datos JSON y datos codificados en URL en las solicitudes y utiliza las rutas definidas en el archivo routes/routes.js para manejar las diferentes rutas de la aplicación. Cuando se inicia el servidor con éxito, muestra un mensaje indicando en qué puerto está escuchando.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { response } = require('express');
const pool = require('../data/config'); // Asegúrate de proporcionar la ruta correcta al archivo config.js
const bitcoinFunctions = require('../bitcoinFuntions');

const BitcoinCore = require('bitcoin-core');

const config = {
  username: 'mario',
  password: 'Abc123',
  host: '127.0.0.1', // Aquí especificas la dirección IP del nodo Bitcoin Core
  port: 18332, // Puerto RPC de Testnet
  wallet: 'contentStore',
};


const bitcoin = new BitcoinCore(config);

const router = app => {
    app.get('/about', (req, res) => {
        const apiInfo = {
          name: 'Mi API',
          version: '1.0.0',
          description: 'Una API simple para ...', // Agrega una breve descripción de tu API
          author: 'Tu Nombre',
          contact: 'tucorreo@example.com',
          documentation: 'Enlace a la documentación de la API',
          endpoints: {
            about: '/about',
            login: '/login',
            protected: '/protected',
            // ... otros endpoints de tu API
          },
        };
      
        res.json(apiInfo);
      });


    app.get('/', (request, response) => {
        const apiInfo = {
            name: 'ContentStore API',
            version: '1.0.0',
            description: 'API para comprar contenido digital utilizando Bitcoin en la red de prueba (Testnet).',
            author: 'Mario Luján',
            contact: 'contacto@mariolujan.com',
            documentation: 'Enlace a la documentación de la API',
            endpoints: {
              about: '/',
              users: '/usuarios',
              login: '/login',
              // ... otros endpoints de tu API
            },
          };
        
          response.json(apiInfo);
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

    // Secret key para firmar el token (puedes cambiar esto en un entorno de producción)
    const secretKey = 'Lcu0b37yKvtz94OHYXRSVTWUfqQG8FNg';

    const generateToken = (usuario) => {
        return jwt.sign({ idusuario: usuario.idusuario, nombre: usuario.nombre }, secretKey, { expiresIn: '1h' });
      };

    app.post('/login', (req, res) => {
        const { nombre, password } = req.body;
      
        const sql = 'SELECT * FROM usuarios WHERE nombre = ?';
      
        pool.query(sql, [nombre], (err, result) => {
          if (err) {
            console.error('Error al realizar la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
          }
      
          if (result.length > 0) {
            const usuario = result[0];
            // Verificar la contraseña utilizando bcrypt
            bcrypt.compare(password, usuario.password, (compareErr, match) => {
              if (compareErr) {
                console.error('Error al comparar contraseñas con bcrypt:', compareErr);
                return res.status(500).json({ mensaje: 'Error interno del servidor.' });
              }
      
              if (match) {
                const token = generateToken(usuario);
                res.json({ mensaje: 'Inicio de sesión exitoso', token });
              } else {

                res.status(401).json({ mensaje: 'Credenciales inválidas' });
              }
            });
          } else {
            res.status(401).json({ mensaje: 'Credenciales inválidas' });
          }
        });
    });


    // Middleware de autenticación
    const authenticate = (req, res, next) => {
        const token = req.headers.authorization;
    
        if (!token) {
        return res.status(401).json({ mensaje: 'Acceso no autorizado. Token no proporcionado.' });
        }
    
        // Verifica el token
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
            return res.status(401).json({ mensaje: 'Acceso no autorizado. Token inválido.' });
            }
        
            const usuario = decoded;
        
            if (usuario) {
            req.usuario = usuario;
            next();
            } else {
            res.status(401).json({ mensaje: 'Acceso no autorizado. Usuario no encontrado.' });
            }
        });
    };

    // Endpoint protegido
    app.get('/protegido', authenticate, (req, res) => {
        res.json({ mensaje: 'Este es un endpoint protegido', usuario: req.usuario.idusuario });
    });

    app.get('/crearDireccion', async(request, response) => {
        const newAddress = await bitcoin.getNewAddress();
        response.json(newAddress);
    });

}

module.exports = router;