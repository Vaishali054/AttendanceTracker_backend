const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', 
    required: true,
  },
  degree:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Degree', 
  },
  totalStudents: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model('Semester', SemesterSchema);
