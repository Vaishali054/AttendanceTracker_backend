const { Router } = require('express');
const { handleUserLogin, handleUserSignup } = require('../controllers/user');
const { handleAdminLogin} = require('../controllers/admin');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details")
const {sendOTP, verifyOTP}=require("../controllers/sendOTP")


const AuthRouter = Router();

AuthRouter.post('/signup', handleUserSignup);

AuthRouter.post('/login', (req, res) => {
  const { role } = req.query;

  if (role === 'Student' || role==='Teacher') handleUserLogin(req, res);
  else if (role === 'admin') handleAdminLogin(req, res);
  else res.status(404).json({ message: 'Role is not defined' });
});

AuthRouter.post('/sendOTP', sendOTP);
AuthRouter.post('/verifyOTP', verifyOTP);

AuthRouter.get("/me", authenticateJWT,getUser);




module.exports = AuthRouter;
