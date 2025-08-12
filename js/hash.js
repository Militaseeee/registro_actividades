// npm init -y
// npm install bcrypt
// node hash.js

// Definimos la contraseña que queremos encriptar
const bcrypt = require('bcrypt');
const password = 'admin123*';

// Generamos el hash usando bcrypt con un "salt" de 10 rondas
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err; // Si ocurre un error al generar el hash, detenemos el programa
    console.log("Hash generado:", hash);
});