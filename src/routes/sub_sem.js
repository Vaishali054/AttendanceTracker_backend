const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details");
const { addBranch,getAllBranches, addSubjects } = require('../controllers/sub_sem');


const SubjectRouter = Router();

SubjectRouter.post("/addBranch",addBranch);
SubjectRouter.get("/getBranches",getAllBranches)
SubjectRouter.post("/addSubjects",addSubjects)




module.exports = SubjectRouter;
