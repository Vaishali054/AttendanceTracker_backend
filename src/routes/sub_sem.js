const { Router } = require('express');
const { authenticateJWT } = require('../middlewares/authJWT');
const {getUser}=require("../controllers/details");
const { addBranch } = require('../controllers/sub_sem');


const SubjectRouter = Router();

SubjectRouter.post("/addBranch",addBranch);




module.exports = SubjectRouter;
