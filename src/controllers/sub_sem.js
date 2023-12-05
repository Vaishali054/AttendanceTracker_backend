const Subjects = require("../models/subjects");
const { branchSchema } = require("../validation/sub_sem");

const addBranch = async (req, res) => {
  try {
    const user = req.body.user;

    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const bodyData = req.body;

    const existingBranch = await Subjects.findOne({ Branch: bodyData.Branch });

    if (existingBranch) {
      return res
        .status(201)
        .json({ message: `Branch '${bodyData.Branch}' already exists` });
    }

    const isValidInput = branchSchema.safeParse(bodyData);

    if (!isValidInput.success) {
      res.status(400).json({
        message: isValidInput.error.issues[0].message,
        error: isValidInput.error,
      });
      return;
    }

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]; // Assuming eight semesters

    const branches = semesters.map((semester) => ({
      Sem: semester,
      Branch: `${bodyData.Branch}`,
    }));

    const createdBranches = await Subjects.insertMany(branches);

    res
      .status(201)
      .json({ message: `Successfully created ${bodyData.Branch}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error while adding branch" });
    console.log(err);
  }
};

// Controller function to fetch all branches
const getAllBranches = async (req, res) => {
  try {
    const user = req.body.user;

    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const branches = await Subjects.find({}, 'Branch').distinct('Branch');
    res.json({ branches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSubjects = async (req, res) => {
  try {
    const { subject, Sem, Branch } = req.body;

    if (!subject || !Sem || !Branch) {
      return res.status(400).json({ message: 'Please provide subject, Sem, and Branch.' });
    }

    // Find a document that matches the branch and semester
    const existingSubjects = await Subjects.findOne({ Branch, Sem });

    if (!existingSubjects) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if the subject already exists in the subjects array
    const isSubjectExists = existingSubjects.subjects.some(
      sub => sub.subjectName.toLowerCase() === subject.toLowerCase()
    );

    if (isSubjectExists) {
      return res.status(400).json({ message: 'Subject already exists for the provided Branch and Sem.' });
    }

    // If the subject doesn't exist, add it to the subjects array
    existingSubjects.subjects.push({ subjectName: subject, totalClasses: 0 });

    // Save the updated document
    const updatedSubjects = await existingSubjects.save();

    res.status(200).json({ message: 'Subjects updated successfully.', updatedSubjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subjects.', error: error.message });
  }
};

const getSubjects=async(req,res)=>{
  try {
    const { Sem, Branch } = req.body; // Assuming semester and branch are query parameters

    if (!Sem || !Branch) {
      return res.status(400).json({ error: 'Semester and branch are required.' });
    }

    const subjects = await Subjects.find({ Sem: Sem, Branch: Branch });

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ error: 'No subjects found for the given semester and branch.' });
    }

    return res.status(200).json({ subjects });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}


module.exports = { addBranch ,getAllBranches,addSubjects,getSubjects};
