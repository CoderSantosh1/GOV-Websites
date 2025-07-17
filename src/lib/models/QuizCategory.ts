import mongoose from 'mongoose';

const quizCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  icon: {
    type: String, // URL or icon name
    default: '',
  },
  subcategories: {
    type: [
      {
        name: { type: String, required: true },
        icon: { type: String, default: '' }, // URL or icon name
      }
    ],
    default: [],
  },
});

export default mongoose.models.QuizCategory || mongoose.model('QuizCategory', quizCategorySchema); 