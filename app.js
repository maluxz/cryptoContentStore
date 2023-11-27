const BitcoinCore = require('bitcoin-core');

const config = {
  username: 'mario',
  password: 'Abc123',
  host: '127.0.0.1', // Aquí especificas la dirección IP del nodo Bitcoin Core
  port: 18332, // Puerto RPC de Testnet
  wallet: 'contentStore',
};


const bitcoin = new BitcoinCore(config);

// Require packages and set the port
const express = require('express'); // Importa el módulo Express.js
const port = 3002; // Define el número de puerto en el que se ejecutará el servidor Express
const pool = require('./data/config');

// Para permitir manejo de POST y PUT
const bodyParser = require('body-parser'); // Importa el módulo body-parser para procesar datos de solicitudes HTTP
const routes = require('./routes/routes'); // Importa las rutas definidas en otro archivo
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

        console.log('Direcciones en la base de datos:', walletAddresses);
        getTransactionsForAddresses(walletAddresses);
        // getAddressesAndBalances();
        // getBalancesForAddresses(walletAddresses);
        getLatestBlockInfo()

      });
  }
  
  // Llamar a la función cada 5 segundos (5000 milisegundos)
  const intervalId = setInterval(miFuncionPeriodica, 30000);

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
        getBalancesForAddresses(walletAddresses);

        getLatestBlockInfo()

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
// Función para obtener direcciones y saldos
async function getAddressesAndBalances() {
    try {
      const addresses = await bitcoin.listReceivedByAddress(0, true); // Listar direcciones
      console.log('Direcciones y saldos:');
      addresses.forEach((addressInfo) => {
        const address = addressInfo.address;
        const balance = addressInfo.amount;
        console.log(`Dirección: ${address}, Saldo: ${balance} BTC`);
      });
    } catch (error) {
      console.error('Error al obtener las direcciones y saldos:', error);
    }
  }

  // Función para consultar el saldo de un array de direcciones
async function getBalancesForAddresses(addresses) {
    try {
      const balances = await Promise.all(
        addresses.map(async (address) => {
          const balance = await bitcoin.getReceivedByAddress(address, 0);
          return { address, balance };
        })
      );
  
      console.log('Saldos de las direcciones:');
      balances.forEach((entry) => {
        console.log(`Dirección: ${entry.address}, Saldo: ${entry.balance} BTC`);
      });
    } catch (error) {
      console.error('Error al obtener los saldos de las direcciones:', error);
    }
  }

  // Función para obtener información del último bloque
async function getLatestBlockInfo() {
    try {
      const blockInfo = await bitcoin.getBlockchainInfo();
      const latestBlockHash = blockInfo.bestblockhash;
      const latestBlock = await bitcoin.getBlock(latestBlockHash);
  
      console.log('Información del último bloque:');
      console.log(`Altura del bloque: ${latestBlock.height}`);
      console.log(`Hash del bloque: ${latestBlock.hash}`);
      console.log(`Número de confirmaciones: ${latestBlock.confirmations}`);
      console.log(`Timestamp: ${new Date(latestBlock.time * 1000).toUTCString()}`);
    } catch (error) {
      console.error('Error al obtener información del último bloque:', error);
    }
  }

// Función para obtener transacciones de un array de direcciones
async function getTransactionsForAddresses(addresses) {
    try {
      const transactions = await Promise.all(
        addresses.map(async (address) => {
          const addressInfo = await bitcoin.listReceivedByAddress(1, true, true, address);
          const addressTransactions = addressInfo[0].txids.map(async (txid) => {
            const transaction = await bitcoin.getTransaction(txid);
            return transaction;
          });
          return { address, transactions: await Promise.all(addressTransactions) };
        })
      );
  
      console.log('Transacciones de las direcciones:');
      transactions.forEach((entry) => {
        console.log(`Dirección: ${entry.address}`);
        console.log('Transacciones:');
        entry.transactions.forEach((transaction) => {
          console.log(`  ID de Transacción: ${transaction.txid}`);
          console.log(`  Categoría: ${transaction.details[0].category}`);
          console.log(`  Cantidad: ${transaction.details[0].amount} BTC`);
          console.log('  ----------------------------------------');
        });
      });
    } catch (error) {
      console.error('Error al obtener las transacciones de las direcciones:', error);
    }
  }