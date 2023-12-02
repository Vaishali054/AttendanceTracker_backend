const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details");
const { addBranch,getAllBranches } = require('../controllers/sub_sem');


const SubjectRouter = Router();

SubjectRouter.post("/addBranch",addBranch);
SubjectRouter.get("/getBranches",getAllBranches)




module.exports = SubjectRouter;
