const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Admins = require('../models/admin');
const Degree = require('../models/degree');
const Department=require('../models/department')
const Semester=require('../models/sem')
const { adminLoginInputSchema, adminSignupInputSchema } = require('../validation/admin');
const { AdminLoginData, AdminSignupData } = require('../types/admin');
const sem = require('../models/sem');

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

    const semesterPromises = req.body.degreeOffered.map(async (degree) => {
      try {
        console.log(degree)
        const degreeInfo = await Degree.findById(degree); 

        if (!degreeInfo) {
          throw new Error(`Degree with ID ${degree._id} not found`);
        }

        const totalSemesters = degreeInfo.totalSemester; 
        const semesterCreationPromises = [];

        for (let i = 1; i <= totalSemesters; i++) {
          const newSemester = new Semester({
            department: newdepartment._id, 
            degree: degreeInfo._id, 
            semester: i,
          });
          semesterCreationPromises.push(newSemester.save());
        }

        return Promise.all(semesterCreationPromises);
      } catch (err) {
        throw new Error(`Error fetching degree with ID ${degree._id}: ${err.message}`);
      }
    });

    await Promise.all(semesterPromises); 


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

exports.addSemester = async (req, res) => {
  const user = req.body.user;

  if (user && user.role !== "admin") {
    res.status(500).json({ success: false, message: 'User is not authorized' });
    return;
  }

  const departementId =req.body.department;
  const degreeId=req.body.degree;
  const findsem=req.body.semester;
  try {
    const semester = await Semester.findOne({ department:departementId, degree:degreeId,semester:findsem });
    console.log(semester)
    if (semester) {
      res.status(500).json({ success: false, message: 'Semester already exists' });
      return;
    }

    const newSemester = new Semester({
      department: req.body.department,
      degree: req.body.degree, 
      semester:req.body.semester,
    });

    await newSemester.save();

    res.status(201).json({ message: "Semester added successfully", newSemester });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error during semester addition" });
    console.log(err);
  }
};

exports.getSemester = async (req, res) => {
  try {
    const semesters = await Semester.find().populate('degree','department');
    res.status(200).json({ message: "Semesters fetched successfully", semesters });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching semesters" });
    console.log(err);
  }
};

exports.deleteSemester = async (req, res) => {
  const user = req.body.user;

  if (user && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'User is not authorized' });
  }

  try {
    const semesterId = req.body.semester;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID' });
    }

    const semester = await Semester.findByIdAndDelete(semesterId);

    if (semester) {
      return res.status(200).json({ success: true, message: 'Semester deleted successfully', semester });
    } else {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error during semester deletion' });
  }
};



