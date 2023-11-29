const mongoose =require('mongoose');

const userSchema=new mongoose.Schema({
    userId:String,
    timetableId:String,
    date:Date,
    isPresent:Boolean,
    attendanceAlreadyMarked:Boolean,
    subjectId:String
});

module.exports=mongoose.model("attendance",userSchema)