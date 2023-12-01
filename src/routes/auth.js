const { Router } = require('express');
const { handleUserLogin, handleUserSignup } = require('../controllers/user');
const { handleAdminLogin, handleAdminSignup } = require('../controllers/admin');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details")


const AuthRouter = Router();

AuthRouter.post('/signup', (req, res) => {
  const { role } = req.query;

  if (role === 'user') handleUserSignup(req, res);
  else if (role === 'admin') handleAdminSignup(req, res);
  else res.status(404).json({ message: 'Role is not defined' });
});

AuthRouter.post('/login', (req, res) => {
  const { role } = req.query;


  if (role === 'user') handleUserLogin(req, res);
  else if (role === 'admin') handleAdminLogin(req, res);
  else res.status(404).json({ message: 'Role is not defined' });
});

AuthRouter.get("/me", authenticateJWT,getUser);




module.exports = AuthRouter;
