const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const md5 = require('md5');

let serviceAccount = require('./credentials/serempre-test-315620-firebase-adminsdk-pxnub-0ac876ee51.json');
let emailValidator = require('email-validator');
let passwordValidator = require('password-validator');

const app = express();

/**
 * Admin opts
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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

/**
 * PUNTOS DE ENTRADA USERS
 */

/**
 * Obtener todos los usuarios
 */
app.get('/api/users', async (req, res) => {
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
app.get('/api/users/:id', async (req, res) => {
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
app.post('/api/users', async (req, res) => {
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
app.put('/api/users/:id', async (req, res) => {
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
app.delete('/api/users/:id', async (req, res) => {
    try {
        let doc = db.collection('users').doc(req.params.id);
        await doc.delete()
        return res.json({ message: "Usuario eliminado" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * PUNTOS DE ENTRADA POINTS
 */

/**
 * Obtener entradas por ID usuario
 */
app.get('/api/points/:id_user', async (req, res) => {
    try {
        let qryUsr = db.collection('users').doc(req.params.id_user);
        let qryUsrSnap = await qryUsr.get();

        if (!qryUsrSnap && !qryUsrSnap.exists) {
            return res.status(402).json({ message: "Usuario no encontrado" });
        }

        let qryPoints = db.collection('points').where('user', '==', `/users/${req.params.id_user}`);
        let qryPointsSnap = await qryPoints.get();
        let docsPoints = qryPointsSnap.docs;
        let points = docsPoints.map((doc) => ({
            id: doc.id,
            quantity: doc.data().quantity,
            reason: doc.data().reason
        }));

        let data = {
            name: qryUsrSnap.data().name,
            points
        }
        return res.status(201).json({ data });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Añadir entrada
 */
app.post('/api/points', async (req, res) => {
    try {
        if (!req.body.quantity || !req.body.reason || !req.body.user) {
            return res.status(402).json({ message: "Faltan datos" });
        }

        await db.collection('points').doc().create({
            quantity: req.body.quantity,
            reason: req.body.reason,
            user: `/users/${req.body.user}`
        });

        return res.json({ message: "Puntos agregados" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Editar entrada
 */
app.put('/api/points/:id', async (req, res) => {
    try {
        if (!req.body.quantity || !req.body.reason || !req.body.user) {
            return res.status(402).json({ message: "Faltan datos" });
        }

        let doc = db.collection('points').doc(req.params.id);
        await doc.update({
            quantity: req.body.quantity,
            reason: req.body.reason,
            user: `/users/${req.body.user}`
        });

        return res.json({ message: `Entrada de puntos ha sido actualizada` });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

/**
 * Eliminar entrada
 */
app.delete('/api/points/:id', async (req, res) => {
    try {
        let doc = db.collection('points').doc(req.params.id);
        await doc.delete()
        return res.json({ message: "Entrada de puntos eliminada" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

exports.app = functions.https.onRequest(app);
