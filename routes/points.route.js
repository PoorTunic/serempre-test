const express = require('express');
const admin = require('firebase-admin');

/**
 * DB Firestore
 */
const db = admin.firestore();

const pointsRoute = express.Router();

/**
 * PUNTOS DE ENTRADA POINTS
 */

/**
 * Obtener entradas por ID usuario
 */
pointsRoute.get('/api/points/:id_user', async (req, res) => {
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
pointsRoute.post('/api/points', async (req, res) => {
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
pointsRoute.put('/api/points/:id', async (req, res) => {
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
pointsRoute.delete('/api/points/:id', async (req, res) => {
    try {
        let doc = db.collection('points').doc(req.params.id);
        await doc.delete()
        return res.json({ message: "Entrada de puntos eliminada" });
    } catch (error) {
        console.log({ error });
        return res.status(500, { message: "Un error ha ocurrido", reason: error.message });
    }
});

module.exports = pointsRoute;