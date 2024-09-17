const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admins = require('../models/admin');
const { adminLoginInputSchema, adminSignupInputSchema } = require('../validation/admin');
const {AdminLoginData,AdminSignupData}=require('../types/admin')

exports.handleAdminLogin = async (req, res) => {
  const bodyData = req.body;
  console.log(bodyData)

  const isValidInput = adminLoginInputSchema.safeParse(bodyData);
  console.log(isValidInput)

  if (!isValidInput.success) {
    res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
    return;
  }

  const { email, password } = isValidInput.data;

  try {
    const admin = await Admins.findOne({ email });

    if (!admin) {
      res
        .status(404)
        .json({ message: `The admin with the email ${email} does not exist.` });
      return;
    }

    if (admin.banned) {
      res.status(403).json({ message: `Admin ${email} is banned.` });
      return;
    }

    if (admin.password !== password) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // const isValidPswd = await bcrypt.compare(password, admin.password);

    // if (!isValidPswd) {
    //   res.status(401).json({ message: 'Invalid password' });
    //   return;
    // }
     
    if (!process.env.JWT_AUTH_SECRET) {
      throw new Error('JWT_AUTH_SECRET environment variable is not defined.');
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_AUTH_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.status(200).json({ message: 'Logged successfully', authToken: token , success: true});
  } catch (err) {
    res
      .status(500)
      .json({success:false, message: 'Internal server error during admin login' });
    console.log(err);
  }
};
