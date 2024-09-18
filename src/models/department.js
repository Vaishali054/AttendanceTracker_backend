const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  totalfaculty: {
    type: Number,
    default: 0,
  },
  degreeOffered: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Degree', 
    }
  ]
});

module.exports = mongoose.model('Department', DepartmentSchema);
