const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const router = express.Router();
const { isAuthenticated, isManager } = require("../middlewares");
const mongoose = require("mongoose");
const { Types } = require("mongoose");

//Create project
router.post("/", async (req, res) => {
  try {
    // Process teamMembers from form
    let teamMembers = [];
    if (req.body.teamMembers) {
      if (typeof req.body.teamMembers === "string") {
        teamMembers = req.body.teamMembers.split(",");
      } else if (Array.isArray(req.body.teamMembers)) {
        teamMembers = req.body.teamMembers;
      }
    }

    // Create project with all fields
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      completedWork: req.body.completedWork
        ? req.body.completedWork.split(",")
        : [],
      teamMembers: teamMembers,
      createdBy: req.user._id,
      archived: req.body.archived === "on",
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
    res.render("index", { projects, currentUser: req.user });
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
router.get("/:id", isAuthenticated, async (req, res) => {
  const project = await Project.findById(req.params.id).populate("teamMembers");
  res.render("detail", { project });
});

// GET edit project form
router.get("/:id/edit", async (req, res) => {
  try {
    // Get the project to edit
    const project = await Project.findById(req.params.id);
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

router.put("/:id", isAuthenticated, isManager, async (req, res) => {
  try {
    let teamMembers = req.body.teamMembers;

    if (typeof teamMembers === "string") {
      teamMembers = teamMembers.split(",");
    } else if (!teamMembers) {
      const existingProject = await Project.findById(req.params.id);
      teamMembers = existingProject.teamMembers.map((id) => id.toString());
    }
    // Convert all to ObjectId
    teamMembers = teamMembers
      .filter((id) => id)
      .map((id) => new Types.ObjectId(id));

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        completedWork: req.body.completedWork,
        archived: req.body.archived === "on",
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
router.delete("/:id", isAuthenticated, isManager, async (req, res) => {
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

// Add existing users to a project
router.post("/:id/members/add", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const selectedUsers = req.body.selectedUsers;

    if (selectedUsers) {
      const userIds = Array.isArray(selectedUsers)
        ? selectedUsers
        : [selectedUsers];

      // Add each selected user if they're not already a member
      for (const userId of userIds) {
        if (!project.teamMembers.includes(userId)) {
          project.teamMembers.push(userId);
        }
      }

      await project.save();
    }

    res.redirect(`/projects/${req.params.id}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding team members");
  }
});

// Remove a user from a project
router.post("/:id/members/remove", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const userId = req.body.userId;

    project.teamMembers = project.teamMembers.filter(
      (member) => member.toString() !== userId
    );

    await project.save();
    res.redirect(`/projects/${req.params.id}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing team member");
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

// Endpoint for team members to update completed work on a project they are part of
router.patch("/:id/work", isAuthenticated, async (req, res) => {
  const projectId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    console.error("Invalid or missing project ID:", projectId);
    return res.status(400).send("Invalid project ID");
  }
  const project = await Project.findOne({
    _id: req.params.id,
    teamMembers: req.user._id,
  });

  if (!project) return res.status(403).send("Access denied");

  project.completedWork = req.body.completedWork;
  await project.save();
  res.redirect("/dashboard");
});

module.exports = router;
