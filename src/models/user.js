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
  }
});

module.exports=mongoose.model("Users",UserSchema)

