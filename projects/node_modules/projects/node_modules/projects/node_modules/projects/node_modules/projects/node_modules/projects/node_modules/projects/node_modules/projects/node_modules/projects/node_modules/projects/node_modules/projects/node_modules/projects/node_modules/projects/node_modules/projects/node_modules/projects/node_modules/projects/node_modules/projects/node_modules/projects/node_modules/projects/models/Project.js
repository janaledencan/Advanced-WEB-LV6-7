const { default: mongoose } = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  completedWork: [String],
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Project", projectSchema);
