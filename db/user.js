const mongoose =require('mongoose');

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    phoneNumber: String,
  address: String,
  profilePicture:{
    type:String,
    default:null
  }
});

module.exports=mongoose.model("users",userSchema)