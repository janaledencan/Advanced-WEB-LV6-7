const Project = require("./models/Project");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/users/login");
};

const isManager = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Access denied");
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  isAuthenticated,
  isManager,
};
