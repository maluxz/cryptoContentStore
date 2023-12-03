const BitcoinCore = require('bitcoin-core');

const config = {
  username: 'mario',
  password: 'Abc123',
  host: '127.0.0.1', // Aquí especificas la dirección IP del nodo Bitcoin Core
  port: 18332, // Puerto RPC de Testnet
  wallet: 'contentStore',
};

const bitcoin = new BitcoinCore(config);

module.exports = bitcoin;