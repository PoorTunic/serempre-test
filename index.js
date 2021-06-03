const functions = require("firebase-functions"); 
const express = require('express');

const app = express();

const admin = require('firebase-admin');

let serviceAccount = require('./credentials/serempre-test-315620-firebase-adminsdk-pxnub-0ac876ee51.json');

/**
 * Admin opts
 */
 admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(require('./routes/users.route'));
app.use(require('./routes/points.route'));

exports.app = functions.https.onRequest(app);
