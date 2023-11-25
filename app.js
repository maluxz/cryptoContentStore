// Este código configura un servidor Express en el puerto 3002, habilita el análisis de datos JSON y datos codificados en URL en las solicitudes y utiliza las rutas definidas en el archivo routes/routes.js para manejar las diferentes rutas de la aplicación. Cuando se inicia el servidor con éxito, muestra un mensaje indicando en qué puerto está escuchando.
const jwt = require('jsonwebtoken');
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


// Secret key para firmar el token (puedes cambiar esto en un entorno de producción)
const secretKey = 'Lcu0b37yKvtz94OHYXRSVTWUfqQG8FNg';
// Base de datos de ejemplo (puedes reemplazarla con tu propia implementación)
const usuarios = [
    { idusuario: 1, nombre: 'usuario1', password: 'password1', email: 'usuario1@example.com' },
    // Agrega más usuarios según sea necesario
  ];
  

  const generateToken = (usuario) => {
    return jwt.sign({ idusuario: usuario.idusuario, nombre: usuario.nombre }, secretKey, { expiresIn: '1h' });
  };
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
  
      // Decoded contiene la información del token
      const usuario = usuarios.find((u) => u.idusuario === decoded.idusuario);
  
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
    res.json({ mensaje: 'Este es un endpoint protegido', usuario: req.usuario });
  });
  
  app.post('/login', (req, res) => {
    const { nombre, contraseña } = req.body;
    const usuario = usuarios.find((u) => u.nombre === nombre && u.contraseña === contraseña);
  
    if (usuario) {
      const token = generateToken(usuario);
      res.json({ mensaje: 'Inicio de sesión exitoso', token });
    } else {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  });

// Iniciar el servidor
const server = app.listen(port, (error) => { // Inicia el servidor Express y escucha en el puerto especificado
    if (error) return console.log(`Error: ${error}`); // Si ocurre un error al iniciar el servidor, muestra un mensaje de error en la consola

    console.log(`El servidor escucha en el puerto ${server.address().port}`); // Si el servidor se inicia con éxito, muestra un mensaje indicando en qué puerto está escuchando
});
