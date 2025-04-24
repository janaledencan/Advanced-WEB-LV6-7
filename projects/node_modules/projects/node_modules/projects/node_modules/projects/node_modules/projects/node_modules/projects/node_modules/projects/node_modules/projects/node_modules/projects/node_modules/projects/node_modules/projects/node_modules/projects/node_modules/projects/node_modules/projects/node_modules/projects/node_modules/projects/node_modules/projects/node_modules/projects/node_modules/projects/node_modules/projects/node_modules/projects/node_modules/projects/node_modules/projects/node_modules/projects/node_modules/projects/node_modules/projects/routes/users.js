var express = require("express");
var router = express.Router();
const User = require("../models/User");

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();

    if (req.body.projectId) {
      const Project = require("../models/Project");
      const project = await Project.findById(req.body.projectId);
      if (project) {
        project.teamMembers.push(user._id);
        await project.save();
      }
    }
    res.redirect("back");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});

module.exports = router;
