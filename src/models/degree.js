const mongoose=require('mongoose');

const DegreeSchema =new mongoose.Schema({
    
    degree:{
        type:String,
        required:true,
    },

    totalSemester:{
        type:Number,
        required:true,
    }

})

module.exports=mongoose.model('Degree',DegreeSchema)