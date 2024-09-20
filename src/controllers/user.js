const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/user");
const Semester=require("../models/sem")

const {
  userLoginInputSchema,
  userSignupInputSchema,
} = require("../validation/user");

const handleUserSignup = async (req, res) => {
  const bodyData = req.body;
  const isValidInput = userSignupInputSchema.safeParse(bodyData);

  if (!isValidInput.success) {
    return res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
  }

  const { name, email, password, semester, department, degree } = isValidInput.data;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@nith.ac.in$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Only emails with the domain "nith.ac.in" are allowed' });
  }

  try {
    const user = await Users.findOne({ email });

    if (user) {
      if (!user.verified) {
        return res.status(409).json({ message: "User is not verified. Please verify your email first." });
      }

      const encrypted_Pswd = await bcrypt.hash(password, 11);
      user.name = name;
      user.password = encrypted_Pswd;
      user.semester = req.body.semester;
      user.department = req.body.department;
      user.role = req.body.role;
      user.degree=req.body.degree;
      await user.save();
    } else {
      const encrypted_Pswd = await bcrypt.hash(password, 11);
      const newUser = new Users({
        name,
        email,
        password: encrypted_Pswd,
        semester:req.body.semester,
        department: req.body.department,
        role: req.body.role,
        degree:req.body.degree,
      });
      await newUser.save();
    }
   
    const semester=req.body.semester;
    await Semester.findOneAndUpdate(
      { _id: semester }, 
      { $inc: { totalStudents: 1 } }, 
      { new: true } 
    );
    const token = jwt.sign(
      { id: user ? user._id : newUser._id, role: "user" },
      process.env.JWT_AUTH_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Signed successfully", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error during user signup" });
    console.log(err);
  }
};


const handleUserLogin = async (req, res) => {
  const bodyData = req.body;

  const isValidInput = userLoginInputSchema.safeParse(bodyData);

  if (!isValidInput.success) {
    res.status(400).json({
      message: isValidInput.error.issues[0].message,
      error: isValidInput.error,
    });
    return;
  }

  const { email, password } = isValidInput.data;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      res
        .status(404)
        .json({ message: `The user with the email ${email} does not exist.` });
      return;
    }

    const isValidPswd = await bcrypt.compare(password, user.password);

    if (!isValidPswd) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    if (!process.env.JWT_AUTH_SECRET) {
      throw new Error("JWT_AUTH_SECRET environment variable is not defined.");
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_AUTH_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Logged successfully", authToken: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during user login" });
    console.log(err);
  }
};

module.exports = { handleUserSignup, handleUserLogin };
