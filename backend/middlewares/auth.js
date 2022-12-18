const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log(req.headers.authorization);
  try {
    const token = req.headers.authorization.split(' ')[1]; //On extrait le token du header de la requête
    const decodedToken = jwt.verify(token, process.env.AUTH_SECRET);//On utilise la méthode Verify() de JWT pour vérfier que le token est valide
    const userId = decodedToken.userId; //On extrait l'Id du token
    if (req.body.userId && parseInt(req.body.userId) !== parseInt(userId)) { //Si l'id de l'utilisateur qui veut faire la requête est différent de l'Id du token
      throw 'Invalid user ID';                           //On renvoit une erreur pour dire que l'utilisateur est invalide
    } else {
      console.log('token ok')
      next(); //Sinon, on continue avec l'exécution de la requête demandée par l'utilisateur
    }
  } catch {
    console.log('wrong token')
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};