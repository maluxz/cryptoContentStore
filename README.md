# CryptoContentStore

## Descripción

CryptoContentStore es un proyecto de tienda de contenido que permite a los usuarios realizar compras de productos digitales utilizando criptomonedas. Este proyecto fue iniciado como parte de la materia de Desarrollo Web Full Stack del Instituto Tecnológico de Delicias (TecNM).

## Características Principales

- **Usuarios y Autenticación:**
  - El usuario cuenta con un nombre de usuario, una contraseña cifrada con bcrypt, un email opcional y la cantidad de fichas disponibles para hacer compras.
  - El inicio de sesión se gestiona mediante tokens JWT (JSON Web Tokens) para una autenticación segura.

- **Gestión de Direcciones:**
  - Cada usuario puede generar nuevas direcciónes de deposito que al crearse se asocian a su ID de usuario.

- **Transacciones y Criptomonedas:**
  - Una vez que el usuario haya generado alguna dirección de deposito y haga un deposito la base de datos registra y procesa la transacción agregando la cantidad de fichas correspondiente a la cantidad de criptomoneda depositada en la dirección, además esta transacción se puede verificar desde cualquier explorador de bloques de la red pública.
 
- **Productos Digitales:**
  - La tienda planea ofrecer productos digitales para compra desde cualquier parte del mundo sin necesidad de intermediarios gracias a la red.

## Estructura del Proyecto

El proyecto ha sido organizado cuidadosamente para mejorar la claridad y mantenibilidad del código. La estructura incluye:

- **Carpetas:**
  - Las carpetas están distribuidas de manera lógica para albergar componentes específicos del proyecto (por ejemplo, autenticación, transacciones, productos, etc.).

- **Rutas y Endpoints:**
  - Las rutas y endpoints han sido definidos de manera clara para facilitar la navegación y comprensión del flujo de la aplicación.

## Autor
- [Mario Lujan](https://github.com/maluxz)