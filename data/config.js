const mysql = require('mysql');

const config = {
    host: 'localhost',
    user: 'mario',
    password: 'Abc123',
    database: 'api',
};

const pool = mysql.createPool(config);

module.exports = pool;