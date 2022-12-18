
const models = require('../models');
const bcrypt = require('bcrypt');
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
exports.signup = (req, res, next) => {
    if (!req.body.firstname || !req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message:'Veuillez remplir tous les champs'});
    }

    if (validate(req.body.email) && schema.validate(req.body.password)) {
        
        models.user.findOne({
            attributes: ['email'],
            where: { email: req.body.email}
        })
        .then(function(userFound) {
            if (!userFound) {

                bcrypt.hash(req.body.password, 10, function(err, bcryptedPassword) {
                    const newUser = models.user.create({
                        firstname: req.body.firstname,
                        name: req.body.name,
                        email: req.body.email,
                        password: bcryptedPassword,
                        isAdmin: 0
                    })
                    .then(newUser => {
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
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



exports.login = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message:'Veuillez remplir tous les champs'});
    }

    models.user.findOne({
        where: { email: req.body.email}
    })
    .then(function(userFound) {
        console.log('utilisateur : ' + userFound.firstname + ' ' + userFound.name)
        if (userFound) {

            //SESSION ADMIN TEST//
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

//RECUPERER INFOS DE 1 USER

exports.getOneUser = (req, res, next) => {
    models.user.findOne ({
        where: { id: req.params.id}
    })
    .then((user) => {
        return res.status(200).json((user))
    })
    .catch((error) => { return res.status(400).json({'error': 'Requête impossible'})})
}
