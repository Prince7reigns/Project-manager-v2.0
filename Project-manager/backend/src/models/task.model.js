import mongoose,{Schema, model} from "mongoose";

// Sub-schema for individual checklist items within a task
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

// Main schema for the Task
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"], // Corrected "Medius" to "Medium"
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending" // Completed the partial default "P"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    attachments: [{
        type: String // Assumed attachments are stored as URLs/file paths in an array
    }],
    todoChecklist: [todoSchema], // Array of the sub-schema defined above
    progress: {
      type: Number,
      default: 0, // Set a logical default of 0
    }
  },
  {
    timestamps: true // This adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Task", taskSchema);