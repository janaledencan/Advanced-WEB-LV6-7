const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // za iduci lv required:true
  role: {
    type: String,
    enum: ["Developer", "Designer", "Manager", "Tester"],
    default: "Developer",
  },
});

module.exports = mongoose.model("User", userSchema);
