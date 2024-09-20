const express = require('express');
const User = require('../models/user'); 
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'vaishali3837@gmail.com',
    pass: 'jxxg nrst egmf lhlf',
  },
});

  const generateOTPToken = (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000); 
    const token = jwt.sign({ email, otp }, process.env.JWT_OTP_SECRET, { expiresIn: '10m' }); 
    return { token, otp };
  };
  
exports.sendOTP=(async (req, res) => {
const { email } = req.body;

if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@nith.ac.in$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Only emails with the domain "nith.ac.in" are allowed' });
}

try {
    let user = await User.findOne({ email });
    
    if (!user) {
    user = new User({
        email: email,
        isVerified: false 
    });
    await user.save();
    }

    const { token, otp } = generateOTPToken(email);

    const mailOptions = {
    from: 'vaishali3837@gmail.com',
    to: email,
    subject: 'Your OTP for Email Verification',
    text: `Your OTP for verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    } else {
        return res.status(200).json({ success: true, token, message: 'OTP sent successfully' });
    }
    });
} catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
}
});

exports.verifyOTP=(async (req, res) => {
    const { token, otp } = req.body;
  
    if (!token || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both token and OTP' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_OTP_SECRET);
      console.log(decoded.otp)
      console.log(otp)
      console.log(decoded.otp===otp)
      if (decoded.otp == otp) {
        const user = await User.findOne({ email: decoded.email });
        console.log(user)
        if (user) {
          user.verified = true;
          await user.save();
  
          return res.status(200).json({ success: true, message: 'Email verified successfully' });
        } else {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Invalid or expired token' });
    }
  });
  
