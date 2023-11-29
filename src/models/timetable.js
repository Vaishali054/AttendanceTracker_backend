const mongoose=require('mongoose');

const timetableSchema =new mongoose.Schema({
    subjectName: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subjects"
    },
    start_time:{

       type: String,
       required: true
    } ,
    end_time:{

       type: String,
       required: true
    },
    day_of_week:{

       type: String,
       required: true
    }

})

module.exports=mongoose.model('Timetable',timetableSchema)