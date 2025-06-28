# CryptoContentStore (English)
- API using the Express.js Framework and connecting to a MySQL and/or MSSQL Server database (No ORM usage such as Sequelize 😞).

## Description
CryptoContentStore is an API that allows users to buy digital products using cryptocurrencies. It was originally created for the Full Stack Web Development course at the Technological Institute of Delicias (TecNM).

## Main Features

- **Users and Authentication:**
  - The user has a username, a password encrypted with bcrypt, an optional email, and the amount of tokens available for purchases.
  - Login is managed using JWT (JSON Web Tokens) for secure authentication.

- **Address Management:**
  - Each user can generate new deposit addresses that are associated with their user ID upon creation.

- **Transactions and Cryptocurrencies:**
  - Deposits sent to these addresses are monitored periodically using the Bitcoin RPC API.
  - Transactions are stored in the database and converted into tokens once validated.
  - Each transaction can be checked on any public Testnet block explorer.

- **Digital Products:**
  - Users will be able to exchange their tokens for digital items without relying on a centralized payment gateway.
  - All operations occur on Bitcoin Testnet for development purposes.

## Project Structure

The codebase is organized into simple modules:

- **config/** – Connection settings for MySQL and the Bitcoin Core client.
- **routes/** – Contains user-related endpoints such as login and address creation.
- **app.js** – Initializes the Express server, subscribes to ZeroMQ events from the Bitcoin node and periodically checks transactions.

Routes are separated to keep the API clean and easy to extend.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node app.js
   ```
   The API listens on port **3002** by default.

## Author
- [Mario Lujan](https://github.com/maluxz)

---

# CryptoContentStore (Español)
- API utilizando el Framework Express.js y que conecta a una base de datos MySQL y/o MSSQL Server (No se cuenta con uso de ORM como Sequelize 😞).

## Descripción
CryptoContentStore es una API para adquirir productos digitales con criptomonedas. Surgió como proyecto de la materia de Desarrollo Web Full Stack en el Instituto Tecnológico de Delicias (TecNM).

## Características Principales

- **Usuarios y Autenticación:**
  - El usuario cuenta con un nombre de usuario, una contraseña cifrada con bcrypt, un email opcional y la cantidad de fichas disponibles para hacer compras.
  - El inicio de sesión se gestiona mediante tokens JWT (JSON Web Tokens) para una autenticación segura.

- **Gestión de Direcciones:**
  - Cada usuario puede generar nuevas direcciónes de deposito que al crearse se asocian a su ID de usuario.

- **Transacciones y Criptomonedas:**
  - Los depósitos enviados a estas direcciones se consultan periódicamente mediante la API RPC de Bitcoin.
  - Las transacciones se guardan en la base de datos y, una vez validadas, se convierten en fichas para el usuario.
  - Cada movimiento puede revisarse en un explorador público de la Testnet.

- **Productos Digitales:**
  - Los usuarios podrán intercambiar sus fichas por artículos digitales sin depender de una pasarela de pagos centralizada.
  - Todas las operaciones se realizan sobre Bitcoin Testnet con fines de desarrollo.

## Estructura del Proyecto
El código se organiza en módulos sencillos:

- **config/** – configuraciones de conexión a MySQL y al cliente de Bitcoin Core.
- **routes/** – contiene los endpoints para usuarios, inicio de sesión y creación de direcciones.
- **app.js** – inicializa Express, se suscribe a eventos ZeroMQ del nodo Bitcoin y valida transacciones de forma periódica.

Las rutas están separadas para mantener una API limpia y fácil de extender.

## Primeros Pasos

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor:
   ```bash
   node app.js
   ```
   La API escucha en el puerto **3002** por defecto.

## Autor
- [Mario Lujan](https://github.com/maluxz)
