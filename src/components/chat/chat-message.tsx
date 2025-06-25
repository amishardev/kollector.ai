"use client";

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, User } from 'lucide-react';
import Image from 'next/image';

export type Message = {
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
};

export function ChatMessage({ message }: { message: Message }) {
  const isAi = message.role === 'ai';
  return (
    <div
      className={cn(
        'flex items-start gap-2 sm:gap-4',
        isAi ? 'justify-start' : 'justify-end'
      )}
    >
      {isAi && (
        <Avatar className="h-9 w-9 border border-primary/20">
          <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[80vw] sm:max-w-xl rounded-lg px-4 py-3 whitespace-pre-wrap',
          isAi
            ? 'bg-card text-card-foreground shadow-sm'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.imageUrl && (
            <div className="mb-2">
                <Image src={message.imageUrl} alt="User upload" width={300} height={200} className="rounded-md w-full max-w-[300px] h-auto" />
            </div>
        )}
        <p>{message.content}</p>
      </div>
      {!isAi && (
        <Avatar className="h-9 w-9">
          <div className="h-full w-full flex items-center justify-center bg-accent text-accent-foreground rounded-full">
            <User className="h-5 w-5" />
          </div>
        </Avatar>
      )}
    </div>
  );
}
