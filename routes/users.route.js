const express = require('express'); 
const admin = require('firebase-admin');
const md5 = require('md5');

let emailValidator = require('email-validator');
let passwordValidator = require('password-validator');

/**
 * DB Firestore
 */
const db = admin.firestore();

/**
 * PASSWORD SCHEMA
 */
let pwdSchema = new passwordValidator();
pwdSchema.
    is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces();

const usersRoute = express.Router();

/**
 * PUNTOS DE ENTRADA USERS
 */

/**
 * Obtener todos los usuarios
 */
usersRoute.get('/api/users', async (req, res) => {
    try {
        let qry = db.collection('users');
        let qrySnap = await qry.get();
        let docs = qrySnap.docs;

        let data = docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            password: doc.data().password
        }));

        return res.json({ data });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Obtener datos usuario
 */
usersRoute.get('/api/users/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(402).json({ message: "ID no especificado" });
        }
        let qry = db.collection('users').doc(req.params.id);
        let qrySnap = await qry.get();

        if (!qrySnap && !qrySnap.exists) {
            return res.status(402).json({ message: "Usuario no encontrado" });
        }

        let data = qrySnap.data();
        return res.json(data);
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Crear un nuevo usuario
 */
usersRoute.post('/api/users', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(402).json({ message: "Faltan datos" });
        }
        if (!emailValidator.validate(req.body.email)) {
            return res.status(402).json({ message: "E-mail no válido" });
        }
        if (!pwdSchema.validate(req.body.password)) {
            return res.status(402).json({ message: "Ingrese una contraseña válida" });
        }

        await db.collection('users').doc().create({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password)
        });

        return res.status(200).json({ message: "Usuario creado" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Editar un nuevo usuario
 */
usersRoute.put('/api/users/:id', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(402).json({ message: "Faltan datos" });
        }
        if (!emailValidator.validate(req.body.email)) {
            return res.status(402).json({ message: "E-mail no válido" });
        }
        if (!pwdSchema.validate(req.body.password)) {
            return res.status(402).json({ message: "Ingrese una contraseña válida" });
        }

        let doc = db.collection('users').doc(req.params.id);
        await doc.update({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password)
        });

        return res.json({ message: `${req.body.name} ha sido actualizado` });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Eliminar un usuario
 */
usersRoute.delete('/api/users/:id', async (req, res) => {
    try {
        let doc = db.collection('users').doc(req.params.id);
        await doc.delete()
        return res.json({ message: "Usuario eliminado" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

module.exports = usersRoute;