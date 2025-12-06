const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./Student");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_db";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Student API is running" });
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error("Failed to fetch student", err);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

app.get("/api/students", async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Failed to fetch students", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, age, class: className } = req.body || {};
    if (!name || age === undefined || !className) {
      return res.status(400).json({ error: "Missing name, age, or class" });
    }
    const student = await Student.create({ name, age, class: className });
    res.status(201).json(student);
  } catch (err) {
    console.error("Failed to create student", err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, age, class: className } = req.body || {};
    if (!name || age === undefined || !className) {
      return res.status(400).json({ error: "Missing name, age, or class" });
    }
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { name, age, class: className },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update student", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    console.error("Failed to delete student", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
