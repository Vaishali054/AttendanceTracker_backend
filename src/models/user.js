const mongoose =require('mongoose');

const UserSchema=new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  OTP: {
    type: String,
   default: null
  },
  OTP_Attempt: {
    type: Number,
    default: 0,
  },
  incorrectAttempt: {
    type: Number,
    default: 0,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  sem:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Semester'
  },
  dept:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Department'
  }
});

module.exports=mongoose.model("Users",UserSchema)

