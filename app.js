// Require packages and set the port
const express = require('express'); // Importa el módulo Express.js
const port = 3002; // Define el número de puerto en el que se ejecutará el servidor Express
const pool = require('./config/mysql');
const bitcoin = require('./config/bitcoin');

// Para permitir manejo de POST y PUT
const bodyParser = require('body-parser'); // Importa el módulo body-parser para procesar datos de solicitudes HTTP
const routes = require('./routes/userRoutes'); // Importa las rutas definidas en otro archivo
const app = express(); // Crea una instancia de la aplicación Express

const zmq = require('zeromq');
const subscriber = new zmq.Subscriber;

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




subscriber.connect('tcp://127.0.0.1:28332');
subscriber.subscribe('hashblock');
// subscriber.subscribe('hashtx');

function miFuncionPeriodica() {
  pool.query('SELECT direccion FROM direcciones', (error, result) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return;
    }

    // Utiliza directamente result para acceder a las filas
    const walletAddresses = result.map(row => row.direccion);

    // console.log('Direcciones en la base de datos:', walletAddresses);

    // Llama a la función para obtener transacciones de las direcciones
    // Llama a la función para obtener transacciones de las direcciones
    getTransactionsForAddresses(walletAddresses)
      .then(async (transactions) => {
        // console.log('Transacciones obtenidas:', transactions);
        // Llama a la función para comparar y actualizar transacciones en la base de datos
        await updateTransactions(transactions);
        // Puedes continuar con tu código después de actualizar las transacciones en la base de datos
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // Llama a la función para validar transacciones
    validarTransacciones()
      .then(() => {
        // Puedes continuar con tu código después de validar las transacciones
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    // getNewTransactionsAndUpdateDatabase(walletAddresses);
    // getTransactionsForAddresses(walletAddresses);
    // getAddressesAndBalances();
    // getBalancesForAddresses(walletAddresses);
    // getLatestBlockInfo()

  });
}

// Llamar a la función cada 5 segundos (5000 milisegundos)
const intervalId = setInterval(miFuncionPeriodica, 5000);

async function run() {
  for await (const [topic, message] of subscriber) {
    const hexMessage = message.toString('hex');
    if (topic.toString() === 'hashtx') {
      pool.query('SELECT direccion FROM direcciones', (error, result) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          return;
        }

        // Utiliza directamente result para acceder a las filas
        const walletAddresses = result.map(row => row.direccion);

        console.log('Direcciones en la base de datos:', walletAddresses);

        // getAddressesAndBalances();


        getLatestBlockInfo();

        const isWalletTransaction = walletAddresses.some(address =>
          hexMessage.includes(address.toLowerCase())
        );
        console.log(` ${hexMessage}`);
        if (isWalletTransaction) {
          console.log(`Nueva transacción relacionada con una dirección de tu wallet: ${hexMessage}`);
          // Procesa la transacción aquí
        }
      });
    }
  }
}

run().catch(error => console.error(error));

// Función para obtener transacciones de un array de direcciones
async function getTransactionsForAddresses(addresses) {
  try {
    const transactions = await Promise.all(
      addresses.map(async (address) => {
        const addressInfo = await bitcoin.listReceivedByAddress(1, true, true, address);
        const addressTransactions = addressInfo[0].txids.map(async (txid) => {
          const transaction = await bitcoin.getTransaction(txid);
          return {
            address,
            transactionId: transaction.txid,
            category: transaction.details[0].category,
            amount: transaction.details[0].amount,
          };
        });
        return await Promise.all(addressTransactions);
      })
    );

    // Flatten the array of transactions
    return transactions.flat();
  } catch (error) {
    console.error('Error al obtener las transacciones de las direcciones:', error);
    throw error;
  }
}

// Función para comparar y actualizar transacciones en la base de datos
async function updateTransactions(transactions) {
  try {
    for (const transaction of transactions) {
      const { address, transactionId, category, amount } = transaction;

      // Consulta si la transacción ya existe en la base de datos
      const query = `SELECT * FROM transacciones WHERE hash = '${transactionId}'`;
      const result = await queryDatabase(query);

      if (result.length === 0) {
        const idDireccion = await getDireccionId(address);
        // Si la transacción no existe, inserta la nueva transacción
        const insertQuery = `INSERT INTO transacciones (id_direccion, hash, importe, fecha) VALUES ('${idDireccion}', '${transactionId}', ${amount}, NOW())`;
        await queryDatabase(insertQuery);
        console.log(`Nueva transacción insertada en la base de datos. ID: ${transactionId}`);
      } else {
        // console.log(`La transacción ya existe en la base de datos. ID: ${transactionId}`);
      }
    }
  } catch (error) {
    console.error('Error al actualizar transacciones en la base de datos:', error);
  }
}

// Función auxiliar para realizar consultas a la base de datos
function queryDatabase(query) {
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Función para obtener las direcciones desde la base de datos
async function getWalletAddressesFromDB() {
  const query = 'SELECT id, direccion FROM tu_tabla'; // Ajusta tu consulta SQL según tu esquema
  try {
    const result = await queryDatabase(query);
    // Utiliza directamente result para acceder a las filas
    const walletAddresses = result.map(row => ({ id: row.id, address: row.direccion }));
    return walletAddresses;
  } catch (error) {
    console.error('Error al obtener direcciones desde la base de datos:', error);
    throw error;
  }
}

// Función para obtener el ID de una dirección desde la base de datos
async function getDireccionId(direccion) {
  const query = `SELECT iddireccion FROM direcciones WHERE direccion = '${direccion}'`;
  try {
    const result = await queryDatabase(query);

    if (result.length > 0) {
      // Retorna el ID de la dirección si existe en la base de datos
      return result[0].iddireccion;
    } else {
      // Retorna null si la dirección no existe en la base de datos
      return null;
    }
  } catch (error) {
    console.error('Error al obtener ID de la dirección desde la base de datos:', error);
    throw error;
  }
}

// Función para validar transacciones
async function validarTransacciones() {
  const query = 'SELECT * FROM transacciones WHERE validada IS false';
  try {
    const transaccionesSinValidar = await queryDatabase(query);

    for (const transaccion of transaccionesSinValidar) {
      const { idtransaccion, id_direccion, importe, fecha, hash } = transaccion;

      // Obtiene el ID del usuario asociado a la dirección
      const idUsuario = await getUsuarioIdFromDireccionId(id_direccion);

      if (idUsuario !== null) {
        // Convierte el importe de satoshis a fichas
        const importeFichas = satoshisToFichas(importe);

        // Actualiza la transacción como validada y establece la fecha de validación
        const updateQuery = `UPDATE transacciones SET validada = 1, fecha_validacion = NOW() WHERE idtransaccion = ${idtransaccion}`;
        await queryDatabase(updateQuery);
        console.log(importeFichas + '|' + idUsuario);
        // Actualiza el saldo de fichas del usuario
        const updateSaldoQuery = `UPDATE usuarios SET fichas = fichas + ${importeFichas} WHERE idusuario = ${idUsuario}`;
        await queryDatabase(updateSaldoQuery);

        console.log(`Transacción validada: ${hash}`);
      } else {
        console.log(`No se pudo encontrar el ID de usuario para la dirección asociada a la transacción: ${hash}`);
      }
    }
  } catch (error) {
    console.error('Error al validar transacciones:', error);
  }
}

// Función para obtener el ID de usuario desde el ID de dirección
async function getUsuarioIdFromDireccionId(idDireccion) {
  const query = `SELECT id_usuario FROM direcciones WHERE iddireccion = ${idDireccion}`;
  try {
    const result = await queryDatabase(query);

    if (result.length > 0) {
      return result[0].id_usuario;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener ID de usuario desde el ID de dirección:', error);
    throw error;
  }
}

// Función para convertir satoshis a fichas (ajusta según tu lógica de conversión)
function satoshisToFichas(satoshis) {
  // Ajusta esta lógica según la conversión específica en tu aplicación
  const tasaConversion = 1000; // Ejemplo: 1 Bitcoin = 1,000,000 fichas
  return satoshis * tasaConversion;
}
