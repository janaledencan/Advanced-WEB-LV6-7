const { default: mongoose } = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  completedWork: [String],
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  archived: { type: Boolean, default: false },
});

module.exports = mongoose.model("Project", projectSchema);
