const express = require('express');
const app = express();
const cors = require('cors');
require('./db/config')
const mongoose=require('mongoose')
const User=require("./db/user");
const Timetable=require('./db/timetable')
const Subjects=require('./db/subjects');
const Attendance=require('./db/attendance');
const axios = require('axios');
const dotenv= require('dotenv')
dotenv.config()

// const { default: mongoose } = require('mongoose');

const REACT_APP_API_URL=process.env.REACT_APP_API_URL
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());



app.post("/api/Signup", async (req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const user=new User(req.body)
  let result= await user.save();
  result= result.toObject();
  delete result.password
  res.send(result)
})
app.post("/api/subjects", async (req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const subject=new Subjects(req.body)
  let result= await subject.save();
  result= result.toObject();
  
  res.send(result)
})





app.post('/api/login',async (req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  if(req.body.password && req.body.email){
    const user = await User.findOne(req.body).select("-password");
    if(user){
      res.send(user)
     }
     else{
       res.send({result : 'No user found'})
     }
  }
    else{
      res.send({result : 'No user found'})
    }


})

app.post('/api/timetable-input',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const timetable=new Timetable(req.body)
  let result= await timetable.save();
  result= result.toObject();
  
  res.send(result)

})



app.get('/api/timetable/:userId/:dayOfWeek', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const userId = req.params.userId;
  const dayOfWeek = req.params.dayOfWeek;
  
  try {
    const timetable = await Timetable.find({ studentId: userId, day_of_week: dayOfWeek }).select('subjectName start_time end_time _id').sort({ start_time: 1 });
    
    if (timetable.length > 0) {
      const subjectNames = timetable.map((entry) => entry.subjectName);
      console.log(subjectNames,'hey')
      const subjectDetails = await Subjects.find({ studentId: userId, subjectName: { $in: subjectNames } })
        .select('subjectName totalClasses attendedClasses _id');
      console.log(subjectDetails,'hey2')
      const result = timetable.map((entry) => {
        const subjectDetail = subjectDetails.find((subject) => subject.subjectName === entry.subjectName);
      
        if(subjectDetail){
        return {
          subjectName: entry.subjectName,
          startTime: entry.start_time,
          endTime: entry.end_time,
          totalClasses: subjectDetail.totalClasses ? subjectDetail.totalClasses : 0,
          attendedclasses: subjectDetail ? subjectDetail.attendedClasses : 0,
          subjectId:subjectDetail._id,
          timetableId:entry._id
        };
      }
      });
      var finalresult=[]
      for(var i=0;i<result.length;++i){
        console.log(result[i])
        if(result[i]!==undefined){
           finalresult.push(result[i])
        }
      }
      res.send(finalresult);
    } else {
      res.send({ result: 'No subjects found' });
    }
  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
});


app.get('/api/subjects/:userId',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const userId = req.params.userId;
  

    let subject=await Subjects.find({ studentId: userId })
    .select('subjectName totalClasses attendedClasses _id');
    if(subject.length>0){
      const classes = subject.map(entry => {
        return {
          subjectName: entry.subjectName,
          totalClasses:entry.totalClasses,
          attendedclasses:entry.attendedClasses,
          subjectId:entry._id
        };
      });
      res.send(classes)
    }
    else{
      res.send({result:"No subjects found"})
    }
})
app.get('/api/subjectsName/:userId',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const userId = req.params.userId;
  

    let subject=await Subjects.find({ studentId: userId })
    .select('subjectName');
    if(subject.length>0){
      const classes = subject.map(entry => {
        return {
          subjectName: entry.subjectName,
          
        };
      });
      res.send(classes)
    }
    else{
      res.send({result:"No subjects found"})
    }
})

async function checkAttendanceMarked(timetableId) {
  try {
    const today = new Date();
    const providedDate = new Date(today.toDateString());
    mongoose.connect(process.env.MONGO_URL)
    const attendanceRecord = await Attendance.findOne({
      timetableId,
      date: { $gte: providedDate, $lt: new Date(providedDate.getTime() + 24 * 60 * 60 * 1000) },
    });
    
    return attendanceRecord !== null;
  } catch (error) {
    console.error('Error checking attendance:', error);
    throw error;
  }
}

 app.post('/api/attendance/:userId/:Id',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  try{
    const userId = req.params.userId;
    const Id=req.params.Id
    const { isPresent}=req.body;
    const date=new Date();

    const attendanceRecord = new Attendance({
      userId,
      timetableId :Id,
      date,
      isPresent,
      
    });

    await attendanceRecord.save();

    res.status(201).json(attendanceRecord);
  }catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
 })

app.get('/api/attendance/:timetableId',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const timetableId=req.params.timetableId
  if(await checkAttendanceMarked(timetableId)){
    const today = new Date();
    const providedDate = new Date(today.toDateString());

    const attendanceRecord = await Attendance.findOne({
      timetableId,
      
      date: { $gte: providedDate, $lt: new Date(providedDate.getTime() + 24 * 60 * 60 * 1000) }}).select('isPresent')
    ;

    res.send({attendanceAlreadyMarked:true,
         isPresent:attendanceRecord.isPresent})
    }
  else{
    res.send({attendanceAlreadyMarked:false})
  }
})

app.get('/api/attendanceMarkerIdfetcher/:SubjectName/:userId', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const SubjectName = req.params.SubjectName;
  const userId = req.params.userId;

  const subjectId = await Subjects.find({
    subjectName: SubjectName,
    studentId: userId
  }).select('_id');

  const timetabledata = await Timetable.find({
    subjectName: SubjectName,
    studentId: userId
  }).select('_id');

  const subjectIdArray = subjectId.map(entry => entry._id);
  const timetableIds = timetabledata.map(entry => entry._id);

  const response = [...subjectIdArray, ...timetableIds];
 
  const attendanceRecord = await Attendance.find({
    timetableId: { $in: response },
    isPresent: true
  }).select('date');

  const formattedDates = attendanceRecord.map(record => record.date.toDateString());

  res.send(formattedDates);
});

app.get('/api/reset/:SubjectName/:userId', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const SubjectName = req.params.SubjectName;
  const userId = req.params.userId;
  

  try {
    let response = await axios.get(`${REACT_APP_API_URL}/timetableId/${SubjectName}/${userId}`);
    const responseData = await response.data;
    
  

     if(responseData.length>0) {
      const result = await Attendance.findOneAndDelete(
        { timetableId: { $in: responseData } },
        { sort: { date: -1 } }
      );

      if (result) {
        console.log('Attendance deleted successfully');
        res.json(result.isPresent);
      } else {
        console.log('No attendance records found');
        res.status(404).json({ error: 'No attendance records found' })
      }
    }
    else{
     
        res.json({ message: "No subject found" })
      
      }
    }
   catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/timetableId/:SubjectName/:userId',async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const SubjectName = req.params.SubjectName;
  const userId = req.params.userId;

  const subjectId = await Subjects.find({
    subjectName: SubjectName,
    studentId: userId
  }).select('_id');
   
  const timetabledata = await Timetable.find({
    subjectName: SubjectName,
    studentId: userId
  }).select('_id');

  const subjectIdArray = subjectId.map(entry => entry._id);
  const timetableIds = timetabledata.map(entry => entry._id);

  const response = [...subjectIdArray, ...timetableIds];
  
  
  // if(response.length===0){
  //   res.json({message:'No subject found'})
  // }
  res.json(response)
 
})
app.get('/api/subjectDelete/:subjectName/:userId', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const subjectName = req.params.subjectName;
  const userId = req.params.userId;
  try {
    let response = await axios.get(`${REACT_APP_API_URL}/timetableId/${subjectName}/${userId}`);
    const responseData = await response.data;
    if(responseData.length>0){
    await Attendance.deleteMany(
      { timetableId: { $in: responseData } }
    );
    await Timetable.deleteMany({
      _id:{$in:responseData}
    })
    await Subjects.deleteMany({
      _id:{$in:responseData}
    })
  }
   
    
    else {
      // Subject not found in the database
      return res.status(404).send({ message: 'Subject not found' });
    }
    res.send({ message: 'Subject removed' });
  } catch (error) {
    // Handle any errors that occurred during the deletion
    res.status(500).send({ message: 'An error occurred' });
  }
});



 app.put('/api/users/:id', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const { id } = req.params;
  const { email, userName, address , phoneNumber } = req.body;

  const updateFields = {};
  if (email) {
    updateFields.email = email;
  }
  if (userName) {
    updateFields.userName = userName;
  }
  if (address ) {
    updateFields.address = address;
  }
  if (phoneNumber) {
    updateFields.phoneNumber = phoneNumber;
  }

  try {
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

const multer = require('multer');

// Set up storage for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures'); // Set the destination folder for profile pictures
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({ storage });

app.post('/api/upload-profile-picture/:userId', upload.single('profilePicture'), async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  try {
    const userId = req.params.userId;
    
    // Find the user in the database by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Update the user's profile picture field in the database
    user.profilePicture = `/${req.file.filename}`;
    await user.save();
    
    // Return the updated user document with the profile picture URL
    return res.status(200).json(user);
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

app.get('/api/timetableDelete/:timetableId', async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL)
  const timetableId=req.params.timetableId
  const result=await Timetable.findByIdAndDelete(timetableId)
  if(result){
    res.json('TimeTable Input Deleted')
  }
  else{
    res.json('No timetable found')
  }
})

app.put('/api/present/:subjectId', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const subjectId = req.params.subjectId;
  const subject = await Subjects.findById(subjectId);
  // console.log(subject)
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  subject.totalClasses++; // Increment the totalClasses field
  subject.attendedClasses++
  const updatedSubject = await subject.save();

  res.json(updatedSubject); // Send the updated subject as the response
});
app.put('/api/undo/:subjectId/:isPresent', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const subjectId = req.params.subjectId;
  
  const isPresent = req.params.isPresent;
  const subject = await Subjects.findById(subjectId);
   
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  subject.totalClasses--; // Increment the totalClasses field
  
  if(isPresent !=='false'){
  subject.attendedClasses--
  }

  const updatedSubject = await subject.save();

  res.json(updatedSubject); // Send the updated subject as the response
});








app.put('api/absent/:subjectId', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const subjectId = req.params.subjectId;
  const subject = await Subjects.findById(subjectId);
  // console.log(subject)
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  subject.totalClasses++; // Increment the totalClasses field
  
  const updatedSubject = await subject.save();

  res.json(updatedSubject); // Send the updated subject as the response
});




if(process.env.API_PORT){
  app.listen(process.env.API_PORT)
}


