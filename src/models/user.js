const mongoose =require('mongoose');

const AdminSchema=new mongoose.Schema({
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
    
    phoneNumber:{
      type :String,
      default : null
      
    },
    address:{
      type:String,
      default : null
    
  },
  profilePicture:{
    type:String,
    default:null
  },

  verified: {
    type: Boolean,
    default: false,
  },
  OTP: {
    type: String,
    required: true,
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
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subjects',
      required: true
    },
    classesAttended: {
      type: Number,
      default: 0
    }
  }]
});

const Users=mongoose.model("Users",AdminSchema)

export default Admins