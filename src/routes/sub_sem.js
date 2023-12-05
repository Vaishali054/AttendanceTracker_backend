const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details");
const { addBranch,getAllBranches, addSubjects, getSubjects } = require('../controllers/sub_sem');


const SubjectRouter = Router();

SubjectRouter.post("/addBranch",addBranch);
SubjectRouter.get("/getBranches",getAllBranches)
SubjectRouter.post("/addSubjects",addSubjects)
SubjectRouter.get("/getSubjects",getSubjects)




module.exports = SubjectRouter;
