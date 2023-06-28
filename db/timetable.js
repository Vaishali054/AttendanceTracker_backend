const mongoose=require('mongoose');

const timetableSchema =new mongoose.Schema({
    studentId:String,
    subjectName:String,
    start_time:String,
    end_time:String,
    day_of_week:String
})

module.exports=mongoose.model('timetables',timetableSchema)