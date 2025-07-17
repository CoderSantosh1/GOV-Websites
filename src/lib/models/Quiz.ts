import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    timeLimit: {
      type: Number,
      required: [true, "Time limit is required"],
      min: [1, "Time limit must be at least 1 minute"],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    }],
    attempts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt' }],
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema); 