const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {addDegree, getDegree, editDegree, addDepartment, getDepartments
    , editDepartment, addSemester, getSemester, deleteSemester
}=require('../controllers/admin')

const AdminRouter=Router();

AdminRouter.post("/degree/add",authenticateJWT,addDegree)
AdminRouter.get("/degree/get",getDegree)
AdminRouter.post("/degree/edit",authenticateJWT,editDegree)
AdminRouter.post("/department/add",authenticateJWT,addDepartment)
AdminRouter.get("/department/get",getDepartments)
AdminRouter.post("/department/edit",authenticateJWT,editDepartment)
AdminRouter.post("/semester/add",authenticateJWT,addSemester)
AdminRouter.get("/semester/get",authenticateJWT,getSemester)
AdminRouter.post("/semester/delete",authenticateJWT,deleteSemester)

module.exports = AdminRouter;