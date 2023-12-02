const Users=require("../models/user")
const Admins=require("../models/admin")

exports.getUser=async(req,res)=>{
    const user = req.body.user;
    try {
        let userData;
        if (user.role === "admin") {
          userData = await Admins.findById(user.id)
          if (userData) {
            userData = { ...userData.toObject(), role: "admin" };
          }
        } else {
          userData = await Users.findById(user.id).populate("sem");
          if (userData) {
            userData = { ...userData.toObject(), role: "user" };
          }
        }
    
        if (!userData) {
          return res.status(404).json({ message: "User not found" });
        }
    
        res.status(200).json(userData);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ message: "Internal server error while getting user details" });
      }

}