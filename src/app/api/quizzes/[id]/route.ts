import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';
import Question from '@/lib/models/Question';
import QuizAttempt from '@/lib/models/QuizAttempt';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const quiz = await Quiz.findById(params.id).populate("questions");
    
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const quizData = await request.json();
    console.log("PUT request received for quiz ID:", params.id);
    console.log("Payload received:", quizData);
    
    // Update the quiz
    const quiz = await Quiz.findByIdAndUpdate(
      params.id,
      {
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        subcategory: quizData.subcategory,
        timeLimit: quizData.timeLimit,
        totalMarks: quizData.totalMarks || 0,
      },
      { new: true }
    );

    console.log("Quiz after findByIdAndUpdate:", quiz);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Update or create questions
    for (const questionData of quizData.questions) {
      if (questionData._id) {
        // Update existing question
        await Question.findByIdAndUpdate(questionData._id, {
          text: questionData.text,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
        });
      } else {
        // Create new question
        const newQuestion = new Question({
          quizId: quiz._id,
          text: questionData.text,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
        });
        await newQuestion.save();
        quiz.questions.push(newQuestion._id);
      }
    }

    await quiz.save();

    // Fetch the updated quiz with populated questions before sending the response
    const updatedQuiz = await Quiz.findById(quiz._id).populate("questions");
    console.log("Quiz before sending response:", updatedQuiz);

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const quiz = await Quiz.findById(params.id);
    
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Delete all questions associated with the quiz
    await Question.deleteMany({ quizId: params.id });
    
    // Delete all attempts associated with the quiz
    await QuizAttempt.deleteMany({ quizId: params.id });
    
    // Delete the quiz
    await quiz.deleteOne();

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
} 