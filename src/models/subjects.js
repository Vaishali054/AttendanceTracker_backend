const mongoose=require('mongoose');

const SubjectSchema =new mongoose.Schema({
    subjects: [{
        subjectName: {
          type: String,
          default: null,
        },
        totalClasses: {
            type: Number,
            default: 0
          }
      }],
    
    Sem:{
        type:Number
    },
    
    Branch:{
        type:String,
        required:true,
        
    }

    

   
})

module.exports=mongoose.model('Subjects',SubjectSchema)