// bitcoinFunctions.js

const BitcoinCore = require('bitcoin-core');

const config = {
  username: 'mario',
  password: 'Abc123',
  host: '127.0.0.1', // Aquí especificas la dirección IP del nodo Bitcoin Core
  port: 18332, // Puerto RPC de Testnet
};


const bitcoin = new BitcoinCore(config);

async function generateNewReceivingAddress() {
  try {
    const newAddress = await bitcoin.getNewAddress();
    return newAddress;
  } catch (error) {
    console.error('Error al generar la nueva dirección de recepción:', error);
    throw error;
  }
}

async function getAddressesAndBalances() {
  try {
    const addresses = await bitcoin.listReceivedByAddress(0, true);
    const result = addresses.map((addressInfo) => ({
      address: addressInfo.address,
      balance: addressInfo.amount,
    }));
    return result;
  } catch (error) {
    console.error('Error al obtener las direcciones y saldos:', error);
    throw error;
  }
}

async function getRecentTransactions() {
  try {
    const transactions = await bitcoin.listTransactions('*', 10);
    const result = transactions.map((transaction) => ({
      txid: transaction.txid,
      category: transaction.category,
      amount: transaction.amount,
    }));
    return result;
  } catch (error) {
    console.error('Error al obtener las últimas transacciones:', error);
    throw error;
  }
}

module.exports = {
  generateNewReceivingAddress,
  getAddressesAndBalances,
  getRecentTransactions,
};
