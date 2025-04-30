const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares");
const Project = require("../models/Project");

router.get("/dashboard", isAuthenticated, async (req, res) => {
  // Manager's projects
  const managedProjects = await Project.find({
    createdBy: req.user._id,
    archived: false,
  });

  // Member projects
  const memberProjects = await Project.find({
    teamMembers: req.user._id,
    createdBy: { $ne: req.user._id },
    archived: false,
  });

  res.render("dashboard", { managedProjects, memberProjects });
});

// Archive view
router.get("/archive", isAuthenticated, async (req, res) => {
  const archivedProjects = await Project.find({
    archived: true,
    $or: [{ createdBy: req.user._id }, { teamMembers: req.user._id }],
  });
  res.render("archive", { projects: archivedProjects });
});

module.exports = router;
