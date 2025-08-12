import express, { json } from 'express';
import pkg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(json());

// Configuración de PostgreSQL con datos reales
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // Supabase requiere SSL
});

// Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM usuario');
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Contar usuarios
app.get('/usuarios/count', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT COUNT(*) AS num_usuarios FROM usuario');
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Agregar usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, correo, rol } = req.body;
    try {
        await db.query('INSERT INTO usuario (nombre, correo, rol) VALUES ($1, $2, $3)', [nombre, correo, rol || 'user']);
        res.json({ message: 'Usuario agregado' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Actualizar usuario
app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;
    try {
        const result = await db.query(
            'UPDATE usuario SET nombre = $1, correo = $2, rol = $3 WHERE id_usuario = $4',
            [nombre, correo, rol, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM usuario WHERE id_usuario = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json(err);
    }
});


// Ruta para registrar nuevos usuarios con hash
app.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const existe = await db.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ message: 'Correo ya registrado' });
        }

        const resultadoUsuario = await db.query(
            'INSERT INTO usuario (nombre, correo, rol) VALUES ($1, $2, $3) RETURNING id_usuario',
            [nombre, correo, 'user'] // Aquí se asigna el rol por defecto
        );

        const id_usuario = resultadoUsuario.rows[0].id_usuario;

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO credenciales (id_usuario, hash_contrasena) VALUES ($1, $2)',
            [id_usuario, hash]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});


// Ruta de login
app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Buscar usuario por correo
        const userRes = await db.query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        const id_usuario = userRes.rows[0].id_usuario;

        // Buscar hash de contraseña
        const credRes = await db.query('SELECT hash_contrasena FROM credenciales WHERE id_usuario = $1', [id_usuario]);

        if (credRes.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales no configuradas' });
        }

        const hash = credRes.rows[0].hash_contrasena;

        const esValido = await bcrypt.compare(contrasena, hash);

        if (esValido) {
            // Buscar todos los datos que necesites, incluyendo el rol
            const usuarioRes = await db.query(
                'SELECT id_usuario, nombre, correo, rol FROM usuario WHERE id_usuario = $1',
                [id_usuario]
            );
        
            return res.status(200).json({
                mensaje: 'Login exitoso',
                usuario: usuarioRes.rows[0] // Objeto con id_usuario, nombre, correo y rol
            });
        } else {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});





// Obtener todas las actividades registradas (unión de varias tablas) - Usuario
app.get('/actividades', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                r.id_registro,
                u.nombre AS nombre_usuario,
                a.nombre AS nombre_actividad,
                c.nombre AS categoria,
                r.fecha,
                r.duracion_min,
                r.descripcion
            FROM registrodiario r
            JOIN usuario u ON r.id_usuario = u.id_usuario
            JOIN actividad a ON r.id_actividad = a.id_actividad
            JOIN categoriaactividad c ON a.id_categoria = c.id_categoria
            ORDER BY r.fecha DESC;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({ error: 'Error al obtener actividades' });
    }
});


// Actualizar actividades registrada de un usuario específico
app.put('/registro-actividad/:id_registro', async (req, res) => {
    const { id_registro } = req.params;
    const { nombre_actividad, fecha, duracion_min, descripcion } = req.body;

    try {
      // 1. Buscar id_actividad por nombre
        const resultActividad = await db.query(
            'SELECT id_actividad FROM actividad WHERE nombre = $1',
            [nombre_actividad]
        );

        if (resultActividad.rows.length === 0) {
            return res.status(400).json({ message: 'Actividad no encontrada' });
        }

        const id_actividad = resultActividad.rows[0].id_actividad;

        // 2. Actualizar el registro diario
        const resultUpdate = await db.query(
            `UPDATE registrodiario
            SET id_actividad = $1, fecha = $2, duracion_min = $3, descripcion = $4
            WHERE id_registro = $5`,
            [id_actividad, fecha, duracion_min, descripcion, id_registro]
        );

        if (resultUpdate.rowCount === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.json({ message: 'Actividad actualizada exitosamente' });

        } catch (error) {
        console.error('Error al actualizar actividad:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


// Obtener actividades de un usuario específico
app.get('/actividades/usuario/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const result = await db.query(`
            SELECT 
                r.id_registro,
                u.nombre AS nombre_usuario,
                a.nombre AS nombre_actividad,
                c.nombre AS categoria,
                r.fecha,
                r.duracion_min,
                r.descripcion
            FROM registrodiario r
            JOIN usuario u ON r.id_usuario = u.id_usuario
            JOIN actividad a ON r.id_actividad = a.id_actividad
            JOIN categoriaactividad c ON a.id_categoria = c.id_categoria
            WHERE r.id_usuario = $1
            ORDER BY r.fecha DESC;
        `, [id_usuario]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener actividades del usuario:', error);
        res.status(500).json({ error: 'Error al obtener actividades del usuario' });
    }
});


// Obtener solo actividades disponibles (de la tabla Actividad)
app.get('/actividades-disponibles', async (req, res) => {
    try {
        const result = await db.query('SELECT id_actividad, nombre, id_categoria FROM actividad ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener actividades disponibles:', error);
        res.status(500).json({ error: 'Error al obtener actividades disponibles' });
    }
});


// registrar actividad
app.post('/registro-actividad', async (req, res) => {
    const { id_usuario, nombre_actividad, fecha, duracion_min, descripcion } = req.body;

    try {
        // 1. Buscar id_actividad por nombre
        const resultActividad = await db.query(
            'SELECT id_actividad FROM actividad WHERE nombre = $1',
            [nombre_actividad]
        );

        if (resultActividad.rows.length === 0) {
            return res.status(400).json({ message: 'Actividad no encontrada' });
        }

        const id_actividad = resultActividad.rows[0].id_actividad;

        // 2. Insertar en Registrodiario
        await db.query(
            'INSERT INTO registrodiario (id_usuario, id_actividad, fecha, duracion_min, descripcion) VALUES ($1, $2, $3, $4, $5)',
            [id_usuario, id_actividad, fecha, duracion_min, descripcion]
        );

        res.json({ message: 'Registro guardado exitosamente' });

    } catch (error) {
        console.error('Error al registrar actividad:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


// Eliminar actividad registrada por id_registro
app.delete('/eliminar-actividad/:id_registro', async (req, res) => {
    const { id_registro } = req.params;

    try {
        const result = await db.query('DELETE FROM registrodiario WHERE id_registro = $1', [id_registro]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }

        res.json({ message: 'Actividad eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        res.status(500).json({ message: 'Error en el servidor al eliminar actividad' });
    }
});

// Crear la ruta para subir el CSV y procesarlo
// Configuración multer para almacenar archivos en memoria o disco
const upload = multer({ dest: 'uploads/' }); // carpeta temporal para subir archivos

// Ruta para subir CSV y procesar usuarios
app.post('/upload-usuarios-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const filePath = req.file.path;
    const inserts = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
        // Suponiendo que el CSV tiene columnas: nombre, correo, rol (rol opcional)
        const nombre = row.nombre?.trim();
        const correo = row.correo?.trim();
        const rol = row.rol?.trim() || 'user';

        if (nombre && correo) {
            const insertPromise = db.query(
                'INSERT INTO usuario (nombre, correo, rol) VALUES ($1, $2, $3) ON CONFLICT (correo) DO NOTHING',
                [nombre, correo, rol]
            );
            inserts.push(insertPromise);
        }
    })
    .on('end', async () => {
        try {
            await Promise.all(inserts);
            fs.unlinkSync(filePath); // borramos archivo temporal
            res.json({ message: `Usuarios insertados correctamente (${inserts.length})` });
        } catch (error) {
            console.error('Error insertando usuarios:', error);
            res.status(500).json({ message: 'Error al insertar usuarios' });
        }
    })
    .on('error', (error) => {
        console.error('Error leyendo archivo CSV:', error);
        res.status(500).json({ message: 'Error leyendo archivo CSV' });
    });
});



app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));