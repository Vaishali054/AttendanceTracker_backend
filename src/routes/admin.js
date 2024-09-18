const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {addDegree, getDegree, editDegree, addDepartment, getDepartments
    , editDepartment
}=require('../controllers/admin')

const AdminRouter=Router();

AdminRouter.post("/adddegree",authenticateJWT,addDegree)
AdminRouter.get("/getdegree",authenticateJWT,getDegree)
AdminRouter.post("/editdegree",authenticateJWT,editDegree)
AdminRouter.post("/department/add",authenticateJWT,addDepartment)
AdminRouter.get("/department/get",authenticateJWT,getDepartments)
AdminRouter.post("/department/edit",authenticateJWT,editDepartment)

module.exports = AdminRouter;