import mongoose from "mongoose";

const YearSchema=new mongoose.Schema({
    sem:{
        type:Number,
        required :true,
    },
    branch:{
        type:String,
        required :true,
    },

    TotalStudents:{
        type: Number,
        default :0,
    },

})

const Sem=mongoose.model("Sem",YearSchema)

export default Sem