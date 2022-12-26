/* Import des modules necessaires */
//importation models de la base de donnée user.js
const models = require('../models');
//importation de bcrypt
const bcrypt = require('bcrypt');
//importation de jsonwebtoken
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const validate = require('validate-mail');


let schema = new passwordValidator(); 
//Propriétés du schéma de validation de mot de passe :
schema
.is().min(8)                                     // Minimum 8 caractères
.is().max(20)                                   // Maximum 100 caractères
.has().uppercase(1)                              // Doit avoir au moins 1 lettre majuscule
.has().lowercase()                              // Doit avoir des lettres en minuscule
.has().digits(1)                                // Doit avoir au moins 1 chiffre
.has().not().spaces()                           // Ne pas avoir d'espaces
//.is().not().oneOf(['Passw0rd', 'Password123']);

//AUTHENTIFICATION
/* Controleur inscription */
//signup pour enregistrer le nouvel utilisateur dans la base de donnée
exports.signup = (req, res, next) => {

    if (!req.body.firstName || !req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message:'Veuillez remplir tous les champs'});
    }

    if (validate(req.body.email) && schema.validate(req.body.password)) {
        
        models.user.findOne({
            attributes: ['email'],
            where: { email: req.body.email}
        })
        .then(function(userFound) {
            if (!userFound) {

         // Hashage du mot de passe utilisateur
                bcrypt.hash(req.body.password, 10, function(err, bcryptedPassword) {
                     // Creation de l'utilisateur
                    const newUser = models.user.create({
                        firstName: req.body.firstName,
                        name: req.body.name,
                        email: req.body.email,
                        password: bcryptedPassword,
                        isAdmin: 0
                    })
                    // sauvegarde le user dans la base de donnée
                    .then(newUser => {
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    // au cas d'une erreur status 500 
                    .catch(err => {
                        return res.status(500).json({ 'error':'impossible d\'ajouter l\'utilisateur'});
                        });
                    });
    
            } else {
                
                return res.status(409).json({ 'error':'Utilisateur déjà existant'});
            }
        })
        .catch(err => {
            return res.status(500).json({ 'error' : 'Impossible de vérifier l\'utilisateur'});
        });
        
} else {
        return res.status(500).json({ message: 'Adresse mail ou mot de passe non valide'})
    };
}; 


/* Controleur login */
// l'identification d'utilisateur grace a login
exports.login = (req, res, next) => {
    console.log(req.body,"test-user")
    // si les champs email et password sont vide veuillez remplir tous les champs
    if (!req.body.email || !req.body.password) {
        // status 400 Utilisateur veuillez remplir tous les champs
        return res.status(400).json({ message:'Veuillez remplir tous les champs'});
    }
// cherche dans la basse de donnée si l'utilisateur est bien present avec findOne
    models.user.findOne({
        where: { email: req.body.email}
    })
    .then(function(userFound) {
        console.log(req.body,"test-user")
        console.log('utilisateur : ' + userFound.firstName + ' ' + userFound.name)
        if (userFound) {

            //SESSION ADMIN TEST//
console.log(process.env.USER_ADMIN_EMAIL,"ENV_TEST_EMAIL",userFound.email,)
console.log(process.env.USER_ADMIN_PWD,"ENV_TEST_password",userFound.password,)

            console.log(userFound.email == process.env.USER_ADMIN_EMAIL && userFound.password == process.env.USER_ADMIN_PWD,"USER-TEST")
            if (userFound.email == process.env.USER_ADMIN_EMAIL && userFound.password == process.env.USER_ADMIN_PWD) {
                console.log('Administrateur compte test');
                console.log('connexion');
                return res.status(200).json ({
                    userId: userFound.id,
                    isAdmin: userFound.isAdmin,
                    token: jwt.sign({ userId: userFound.id }, process.env.AUTH_SECRET, { expiresIn: '24h'})
                });
            //SESSION ADMIN TEST//   
            } else {
                // si c'est ok bcrypt compare le mot de l'utilisateur envoyer par le front avec celui rentré par l'utilisateur dans sa request
                bcrypt.compare(req.body.password, userFound.password, function(errBcrypt, resBcrypt) {
                if(resBcrypt) {
                    console.log('mot de passe correct')
                    console.log(userFound.id)
                    return res.status(200).json ({
                        message: 'connexion réussie',
                        userId: userFound.id,
                        isAdmin: userFound.isAdmin,
                        token: jwt.sign({ userId: userFound.id }, process.env.AUTH_SECRET, { expiresIn: '24h'})
                    });

                } else {
                    console.log('mot de passe incorrect dans bdd')
                    return res.status(403).json({ message:'mot de passe invalide'});
                }
            })
            }
        } else {
        console.log('Utilisateur non trouvé');
        return res.status(404).json({ message: 'Utilisateur introuvable'});
        }
    })
    .catch(err => {
        return res.status(500).json({ message: 'Impossible de vérifier l\'utilisateur'});
    })

};

/**
 * MODIFIER UN UTILISATEUR
 */
exports.modifyUser = (req, res, next) => {
    console.log('modification des données utilisateurs en cours');
    var data = "";
    let profilePic = "";
    console.log(req.file);

    if(req.file) {
        console.log('modification de l\'image en cours');
        profilePic = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        
        data = {
            profilePic: profilePic
        }
    } else {
        console.log('Aucune image');
    }
    console.log('Update image de profil en cours');
    console.log(data);
    models.user.update(data, {where: { id: req.params.id}})
        .then(() => res.status(200).json({ message: 'Votre image de profil a été enregistrée !'}))
        .catch((error) => {
            console.log(error);
            res.status(400).json({ 'error': 'Impossible d\'enregistrer l\'image de profil'})
        })

};

/**
 * SUPPRIMER UN UTILISATEUR
 */
exports.deleteAccount = (req, res, next) => {
        console.log(" SUPPRESSION DE L\'UTILISATEUR EN COURS ")
        console.log(" userId : " + req.params.id)

            //models.likes.destroy({where: { userId: req.params.id }})
            models.comment.destroy({where: { userId: req.params.id }});
            models.post.destroy({where: { userid: req.params.id }});
            models.user.destroy({ where: { id: req.params.id }})
            
                .then( () => res.status(200).json({message: "Le compte a bien été supprimé"}))
                .catch((error) => {
                    console.log(error);
                    res.status(401).json({ 'error': 'Impossible de supprimer l\'utilisateur'})
                })
            };

/**
 * AFFICHER UN SEUL UTILISATEUR
 */

exports.getOneUser = (req, res, next) => {
    models.user.findOne ({
        where: { id: req.params.id}
    })
    .then((user) => {
        return res.status(200).json((user))
    })
    .catch((error) => { return res.status(400).json({'error': 'Requête impossible'})})
}
