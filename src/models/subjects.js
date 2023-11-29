const mongoose=require('mongoose');

const SubjectSchema =new mongoose.Schema({
    subjectName:{
        type: String,
        required: true,
    },
    
    sem:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:""
    }],

    totalClasses: {
        type: Number,
        default: 0
      }

   
})

module.exports=mongoose.model('Subjects',SubjectSchema)