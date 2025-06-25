"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2, XCircle, RotateCw, Loader2 } from 'lucide-react';
import { getMCQExplanation } from '@/app/actions';

type MCQ = {
  question: string;
  options: string[];
  answer: string;
};

type MCQPlayerProps = {
  mcqs: MCQ[];
  subject: string;
};

export function MCQPlayer({ mcqs, subject }: MCQPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [shuffledMcqs, setShuffledMcqs] = useState<MCQ[]>([]);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);

  const shuffleOptions = (options: string[]) => {
    return [...options].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const newShuffledMcqs = mcqs.map(mcq => ({
      ...mcq,
      options: shuffleOptions(mcq.options),
    }));
    setShuffledMcqs(newShuffledMcqs);
    // Reset state when mcqs prop changes
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setShowResults(false);
    setExplanations({});
  }, [mcqs]);

  const score = useMemo(() => {
    if (!showResults) return 0;
    return Object.entries(userAnswers).reduce((acc, [index, answer]) => {
      if (shuffledMcqs[parseInt(index)].answer === answer) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [showResults, userAnswers, shuffledMcqs]);
  
  const currentMCQ = shuffledMcqs[currentQuestionIndex];

  const handleNext = () => {
    if (selectedOption) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedOption,
      }));
    }
    setSelectedOption(null);
    if (currentQuestionIndex < shuffledMcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const handleRetry = () => {
     const newShuffledMcqs = mcqs.map(mcq => ({
      ...mcq,
      options: shuffleOptions(mcq.options),
    }));
    setShuffledMcqs(newShuffledMcqs);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setShowResults(false);
    setExplanations({});
  };

  const fetchExplanation = async (mcqIndex: number) => {
    if (explanations[mcqIndex]) return;
    setLoadingExplanation(mcqIndex);
    try {
      const mcq = shuffledMcqs[mcqIndex];
      const res = await getMCQExplanation(mcq.question, mcq.options, mcq.answer, subject);
      setExplanations(prev => ({ ...prev, [mcqIndex]: res.explanation }));
    } catch (error) {
      setExplanations(prev => ({ ...prev, [mcqIndex]: "Could not load explanation." }));
    } finally {
      setLoadingExplanation(null);
    }
  };


  if (shuffledMcqs.length === 0) return null;

  if (showResults) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-headline text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-3xl sm:text-4xl font-bold">
            {score} / {shuffledMcqs.length}
          </p>
          <p className="text-muted-foreground mt-2">You scored {((score / shuffledMcqs.length) * 100).toFixed(0)}%</p>
          <Accordion type="single" collapsible className="mt-6 text-left w-full">
            {shuffledMcqs.map((mcq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger onClick={() => fetchExplanation(index)}>
                  <div className="flex items-center gap-2 text-left">
                    {userAnswers[index] === mcq.answer ? <CheckCircle2 className="text-green-500 flex-shrink-0" /> : <XCircle className="text-red-500 flex-shrink-0" />}
                    <span className="truncate">{mcq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {loadingExplanation === index ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Loading explanation...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                      <p><strong>Your Answer:</strong> {userAnswers[index] || 'Not answered'}</p>
                      <p><strong>Correct Answer:</strong> {mcq.answer}</p>
                      <p className="pt-2 border-t border-border mt-2"><strong>Explanation:</strong> {explanations[index]}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetry} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-headline">Practice Quiz</CardTitle>
        <Progress value={(currentQuestionIndex / shuffledMcqs.length) * 100} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">Question {currentQuestionIndex + 1} of {shuffledMcqs.length}</p>
      </CardHeader>
      <CardContent>
        <p className="font-semibold mb-4">{currentMCQ.question}</p>
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={setSelectedOption}
          className="space-y-2"
        >
          {currentMCQ.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="font-normal">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!selectedOption} className="w-full">
          {currentQuestionIndex < shuffledMcqs.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </>
  );
}
