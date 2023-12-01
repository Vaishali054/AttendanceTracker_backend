const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admins = require('../models/admin');
const { adminLoginInputSchema, adminSignupInputSchema } = require('../validation/admin');
const {AdminLoginData,AdminSignupData}=require('../types/admin')

exports.handleAdminSignup = async (req, res) => {
  const bodyData = req.body;
  console.log(bodyData);

  const isValidInput = adminSignupInputSchema.safeParse(bodyData);
  console.log(isValidInput);

  if (!isValidInput.success) {
    res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
    return;
  }

  const { name, email, password, location } = isValidInput.data;

  try {
    const admin = await Admins.findOne({ email });

    if (admin) {
      res.status(409).json({ message: 'Email address is already in use.' });
      return;
    }

    if (!process.env.JWT_OTP_SECRET || !process.env.JWT_AUTH_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }

    const OTP = Math.floor(Math.random() * 999999);
    //await sendMail(email, OTP);

    const OTP_token = jwt.sign({ OTP: OTP }, process.env.JWT_OTP_SECRET, {
      expiresIn: '5m',
    });
    const encrypted_Pswd = await bcrypt.hash(password, 11);

    const newAdmin = new Admins({
      name,
      email,
      password: encrypted_Pswd,
      location,
      OTP: OTP_token,
      OTP_Attempt: 1,
    });
    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, role: 'admin' },
      process.env.JWT_AUTH_SECRET,
      {
        expiresIn: '1h',
      }
    );
    res.status(201).json({ message: 'Signed successfully', authToken: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Internal server error during admin signup' });
    console.log(err);
  }
};

exports.handleAdminLogin = async (req, res) => {
  const bodyData = req.body;

  const isValidInput = adminLoginInputSchema.safeParse(bodyData);

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

    const isValidPswd = await bcrypt.compare(password, admin.password);

    if (!isValidPswd) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

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

    res.status(200).json({ message: 'Logged successfully', authToken: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Internal server error during admin login' });
    console.log(err);
  }
};
