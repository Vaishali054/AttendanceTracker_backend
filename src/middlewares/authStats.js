const Admins = require("../models/admin");
const Users = require("../models/user");

const validateStats = async (req, res, next) => {
  const userDetail = req.body.user;

  try {
    let user;
    let userObj;
    if (userDetail.role === "admin") {
      user = await Admins.findById(userDetail.id);
      userObj = {
        ...userDetail,
        name: user?.name,
        email: user?.email,
      };
    } else {
      user = await Users.findById(userDetail.id);
      userObj = {
        ...userDetail,
        name: user?.name,
        email: user?.email,
        OTP: user?.OTP,
        verified: user?.verified,
        
      };
    }

    if (!user ) {
      res.status(403).json({
        message: `The ${userDetail.role} account is deleted.`,
      });
      return;
    }

    req.body.user = userObj;

    next();
  } catch (err) {
    res.status(500).json({
      message: "Internal server error during admin/user data validation",
    });
    console.log(err);
  }
};

module.exports = validateStats;
