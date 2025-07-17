import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';
import Question from '@/lib/models/Question';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, category, subcategory, timeLimit, totalMarks, questions } = body;

    // Create quiz first
    const quiz = await Quiz.create({
      title,
      description,
      category,
      subcategory,
      timeLimit,
      totalMarks,
      questions: [], // Initialize with empty questions array
    });

    // Create questions with the quiz ID
    const createdQuestions = await Question.create(
      questions.map((q: any) => ({
        quizId: quiz._id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }))
    );

    // Update quiz with question references
    quiz.questions = createdQuestions.map((q: any) => q._id);
    await quiz.save();

    // Populate questions for the response
    const populatedQuiz = await Quiz.findById(quiz._id).populate('questions');

    return NextResponse.json(populatedQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const quizzes = await Quiz.find().populate('questions');
    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
} 