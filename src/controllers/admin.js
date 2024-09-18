const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admins = require('../models/admin');
const Degree = require('../models/degree');
const Department=require('../models/department')
const { adminLoginInputSchema, adminSignupInputSchema } = require('../validation/admin');
const { AdminLoginData, AdminSignupData } = require('../types/admin');

exports.handleAdminLogin = async (req, res) => {
  const bodyData = req.body;
  console.log(bodyData);

  const isValidInput = adminLoginInputSchema.safeParse(bodyData);
  console.log(isValidInput);

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
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Logged successfully', authToken: token, success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error during admin login' });
    console.log(err);
  }
};

exports.addDegree = async (req, res) => {
  const user = req.body.user;

  if (user && user.role !== "admin") {
    res.status(500).json({ success: false, message: 'User is not authorized' });
    return;
  }

  const finddegree = req.body.degree;

  try {
    const degree = await Degree.findOne({ degree: finddegree });

    if (degree) {
      res.status(500).json({ success: false, message: 'Degree already exists' });
      return;
    }

    const newdegree = new Degree({
      degree: req.body.degree,
      totalSemester: req.body.totalSemester,
    });

    await newdegree.save();

    res.status(201).json({ message: "Degree added successfully", newdegree });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error during degree addition" });
    console.log(err);
  }
};

exports.getDegree = async (req, res) => {
  try {
    const degrees = await Degree.find();
    res.status(200).json({ message: "Degree fetched successfully", degrees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching degrees" });
    console.log(err);
  }
};

exports.editDegree = async (req, res) => {
  const role = req.body.user.role;

  if (role !== "admin") {
    res.status(500).json({ message: "User is not authorized" });
    return;
  }

  const _id = req.body._id;
  const updateData = req.body;

  try {
    const updateDegree = await Degree.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (updateDegree) {
      res.status(201).json({ message: "Degree updated successfully", updateDegree });
    } else {
      res.status(404).json({ message: "Degree not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error during degree update", error: err });
    console.log(err);
  }
};

exports.addDepartment = async (req, res) => {
  const user = req.body.user;

  if (user && user.role !== "admin") {
    res.status(500).json({ success: false, message: 'User is not authorized' });
    return;
  }

  const finddepartment = req.body.department;

  try {
    const department = await Department.findOne({ department:finddepartment });

    if (department) {
      res.status(500).json({ success: false, message: 'Department already exists' });
      return;
    }

    const newdepartment = new Department({
      department: req.body.department,
      degreeOffered: req.body.degreeOffered, 
    });

    await newdepartment.save();

    res.status(201).json({ message: "Department added successfully", newdepartment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error during department addition" });
    console.log(err);
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('degreeOffered');
    res.status(200).json({ message: "Departments fetched successfully", departments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching departments" });
    console.log(err);
  }
};

exports.editDepartment = async (req, res) => {
  const role = req.body.user.role;

  if (role !== "admin") {
    res.status(500).json({ message: "User is not authorized" });
    return;
  }

  const _id = req.body._id;
  const updateData = req.body;

  try {
    const updateDepartment = await Department.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (updateDepartment) {
      res.status(201).json({ message: "Department updated successfully", updateDepartment });
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error during department update", error: err });
    console.log(err);
  }
};


