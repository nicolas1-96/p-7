
// importation de dotenv qui stocke des variables d'environnement et ça servira pour l'appel mongodb en dessous.
require('dotenv').config();
//IMPORT PLUGINS

//importation de express
const express = require('express');
//importation de body-Parser
const bodyParser = require('body-parser');
//importation de CORS
const cors = require('cors');
// importation de helmet, il est utilisé pour sécuriser vos en-têtes
const helmet = require('helmet');
const path = require('path');





const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');


const app = express();

//ANTICIPER LES ERREURS CORS - AUTORISE L'ACCES DEPUIS N'IMPORTE QUELLE ORIGINE - POUR TOUTES LES REQUETES A L'API
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Sécurise les headers
app.use(cors());
app.use(helmet());

// transformer le CORPS (le body) en json objet javascript utilisable
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





//ROUTES
app.use("/images", express.static(path.join(__dirname, "images")));
//la route d'authentification
app.use('/api/auth', userRoutes);
//la route des posts
app.use('/api/post', postRoutes);
//exportation de app.js pour pouvoir y accéder depuis un autre fichier
module.exports = app;