const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const router = express.Router();

//Create project
router.post("/", async (req, res) => {
  try {
    // Process teamMembers from form
    let teamMembers = [];
    if (req.body.teamMembers) {
      teamMembers = req.body.teamMembers.split(",");
    }

    // Create project with all fields
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      completedWork: req.body.completedWork,
      teamMembers: teamMembers,
    });

    await project.save();
    res.redirect("/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating project");
  }
});

//Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("teamMembers");
    res.render("index", { projects });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET new project form
router.get("/new", async (req, res) => {
  try {
    // Get all users
    const users = await User.find();

    res.render("form", {
      title: "Create New Project",
      actionUrl: "/projects",
      availableUsers: users, // Pass users as availableUsers
      project: { teamMembers: [] },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET project detail
router.get("/:id", async (req, res) => {
  const project = await Project.findById(req.params.id).populate("teamMembers");
  res.render("detail", { project });
});

// GET edit project form
router.get("/:id/edit", async (req, res) => {
  try {
    // Get the project to edit
    const project = await Project.findById(req.params.id);

    // Get all users for the dropdown
    const users = await User.find();

    res.render("form", {
      title: "Edit Project",
      actionUrl: `/projects/${req.params.id}?_method=PUT`,
      availableUsers: users,
      project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Updaate project
const mongoose = require("mongoose");

router.put("/:id", async (req, res) => {
  try {
    let teamMembers = req.body.teamMembers || [];
    // Ensure teamMembers is always an array
    if (!Array.isArray(teamMembers)) {
      teamMembers = [teamMembers];
    }
    // Convert all to ObjectId
    teamMembers = teamMembers
      .filter((id) => id) // remove empty strings
      .map((id) => mongoose.Types.ObjectId(id));

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        completedWork: req.body.completedWork,
        teamMembers: teamMembers,
      },
      { new: true }
    );
    res.redirect("/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating project");
  }
});

//Delete project
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.redirect("/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting project");
  }
});

//Add member to project
router.post("/:id/members", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.teamMembers.push(req.body.userId);
    await project.save();
    res.redirect(`/projects/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding team member");
  }
});

// Get team member management page
router.get("/:id/members", async (req, res) => {
  try {
    const [project, users] = await Promise.all([
      Project.findById(req.params.id).populate("teamMembers"),
      User.find(),
    ]);
    res.render("members", {
      project,
      users,
      title: "Manage Team Members",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading team members");
  }
});

module.exports = router;
