import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});

const News = mongoose.models.News || mongoose.model('News', newsSchema);

export default News;