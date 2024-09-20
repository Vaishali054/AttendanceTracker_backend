const mongoose =require('mongoose');

const UserSchema=new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  OTP: {
    type: String,
   default: null
  },
  semester:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Semester'
  },
  department:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Department'
  },
  role:{
    type:String,
  },
  degree:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Degree'
  }
});

module.exports=mongoose.model("Users",UserSchema)

