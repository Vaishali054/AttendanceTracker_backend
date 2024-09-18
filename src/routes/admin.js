const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {addDegree, getDegree, editDegree}=require('../controllers/admin')

const AdminRouter=Router();

AdminRouter.post("/adddegree",authenticateJWT,addDegree)
AdminRouter.get("/getdegree",authenticateJWT,getDegree)
AdminRouter.post("/editdegree",authenticateJWT,editDegree)

module.exports = AdminRouter;