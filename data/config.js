const mysql = require('mysql');

const config = {
    host: 'localhost',
    user: 'mario',
    password: 'Abc123',
    database: 'contentstore',
};

const pool = mysql.createPool(config);

module.exports = pool;