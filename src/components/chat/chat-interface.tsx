"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Send,
  Loader2,
  Book,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, Message } from '@/components/chat/chat-message';
import { MCQPlayer } from '@/components/chat/mcq-player';
import { handleUserMessage } from '@/app/actions';
import { subjects } from '@/lib/subjects';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '../ui/card';

type MCQ = {
  question: string;
  options: string[];
  answer: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('General Science');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSubmit = async (text: string, imageUrl?: string) => {
    const userMessageContent = text || (imageUrl ? 'Explain this image.' : '');
    if (!userMessageContent && !imageUrl) return;

    const userMessage: Message = { role: 'user', content: userMessageContent, imageUrl };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMcqs([]);

    try {
      const res = await handleUserMessage(userMessageContent, subject, imageUrl);
      const aiMessage: Message = { role: 'ai', content: res.response };
      setMessages((prev) => [...prev, aiMessage]);
      if (res.mcqs && res.mcqs.length > 0) {
        setMcqs(res.mcqs);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get response from AI.',
      });
      const errorMessage: Message = { role: 'ai', content: 'Sorry, I encountered an error.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    handleSubmit(input.trim());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      handleSubmit(input, dataUri);
    };
    reader.readAsDataURL(file);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  const allSubjects = [
    ...subjects.prelims,
    ...subjects.mains,
    ...subjects.optional,
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8 sm:py-16">
              <Book className="mx-auto h-12 w-12" />
              <h2 className="text-2xl font-semibold mt-4">Welcome!</h2>
              <p>Ask a question or upload an image to begin.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">AI is thinking...</p>
            </div>
          )}
          {mcqs.length > 0 && !isLoading && (
            <Card>
              <MCQPlayer mcqs={mcqs} subject={subject} />
            </Card>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 sm:p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {allSubjects.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your doubt here or say hello..."
              className="pr-24 min-h-[52px]"
              rows={1}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
