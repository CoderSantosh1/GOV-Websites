'use client';

import { useEffect, useState } from 'react';
import { useForm, ControllerRenderProps, FieldValues, UseFormStateReturn, ControllerFieldState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
  totalMarks: z.number().min(0, 'Total marks must be at least 0'),
  questions: z.array(z.object({
    text: z.string().min(1, 'Question is required'),
    options: z.array(z.string()).min(2, 'At least 2 options are required'),
    correctAnswer: z.number().min(0, 'Correct answer is required'),
  })).min(1, 'At least one question is required'),
});

type QuizFormValues = z.infer<typeof quizSchema>;

type FormFieldRenderProps<T extends keyof QuizFormValues> = {
  field: ControllerRenderProps<QuizFormValues, T>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<QuizFormValues>;
};

type QuestionFormFieldRenderProps = {
  field: ControllerRenderProps<
    QuizFormValues,
    | `questions.${number}.text`
    | `questions.${number}.options.${number}`
    | `questions.${number}.correctAnswer`
  >;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<QuizFormValues>;
};

export default function QuizForm() {
  const [questions, setQuestions] = useState([{ text: '', options: ['', ''], correctAnswer: 0 }]);
  const [categories, setCategories] = useState<{ name: string; subcategories: { name: string; icon?: string }[] }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories from API
    fetch('/api/quiz-categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      timeLimit: 30,
      totalMarks: 0,
      questions: questions,
    },
  });

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    form.setValue('category', value);
    const found = categories.find((cat) => cat.name === value);
    setSubcategoryOptions(found ? found.subcategories.map(sub => typeof sub === 'object' && sub !== null ? sub.name : sub) : []);
    form.setValue('subcategory', '');
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', ''], correctAnswer: 0 }]);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      toast.success('Quiz created successfully');
      form.reset();
      setQuestions([{ text: '', options: ['', ''], correctAnswer: 0 }]);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState, formState }: FormFieldRenderProps<"title">) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState, formState }: FormFieldRenderProps<"description">) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter quiz description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field, fieldState, formState }: FormFieldRenderProps<'category'>) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select {...field} onChange={handleCategoryChange} className="w-full border rounded p-2">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subcategory"
          render={({ field, fieldState, formState }: FormFieldRenderProps<'subcategory'>) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded p-2">
                  <option value="">Select subcategory</option>
                  {subcategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field, fieldState, formState }: FormFieldRenderProps<"timeLimit">) => (
            <FormItem>
              <FormLabel>Time Limit (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalMarks"
          render={({ field, fieldState, formState }: FormFieldRenderProps<"totalMarks">) => (
            <FormItem>
              <FormLabel>Total Marks</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Questions</h3>
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="p-4 border rounded-lg space-y-4">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.text` as const}
                render={({ field, fieldState, formState }: QuestionFormFieldRenderProps) => (
                  <FormItem>
                    <FormLabel>Question {questionIndex + 1}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Options</FormLabel>
                {question.options.map((option, optionIndex) => (
                  <FormField
                    key={optionIndex}
                    control={form.control}
                    name={`questions.${questionIndex}.options.${optionIndex}` as const}
                    render={({ field, fieldState, formState }: QuestionFormFieldRenderProps) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={`Option ${optionIndex + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addOption(questionIndex)}
                >
                  Add Option
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`questions.${questionIndex}.correctAnswer` as const}
                render={({ field, fieldState, formState }: QuestionFormFieldRenderProps) => (
                  <FormItem>
                    <FormLabel>Correct Answer (0-indexed)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={question.options.length - 1}
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
          >
            Add Question
          </Button>
        </div>

        <Button type="submit">
          Create Quiz
        </Button>
      </form>
    </Form>
  );
}