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
        OTP: user?.OTP,
        verified: user?.verified,
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

    if (!user || user.banned) {
      res.status(403).json({
        message: `The ${userDetail.role} account is ${user ? "banned" : "deleted"}.`,
      });
      return;
    }

    if (user.incorrectAttempt >= 7 || user.OTP_Attempt >= 10) {
      if (userDetail.role === "admin") {
        await Admins.updateOne({ _id: user._id }, { banned: true });
      } else {
        await Users.updateOne({ _id: user._id }, { banned: true });
      }

      res.status(403).json({
        message: "Too many OTP attempts, the account is Banned!",
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
