const mongoose=require('mongoose');

const timetableSchema =new mongoose.Schema({
    studentId:String,
    subjectName:String,
    totalClasses:Number,
    attendedClasses:Number

    
})

module.exports=mongoose.model('subjects',timetableSchema)