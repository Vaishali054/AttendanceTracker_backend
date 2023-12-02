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

module.exports = { addBranch };
