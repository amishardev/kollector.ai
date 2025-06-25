import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="text-center max-w-2xl">
        <BrainCircuit className="w-24 h-24 mx-auto text-primary" />
        <h1 className="mt-8 text-4xl sm:text-5xl md:text-7xl font-headline font-bold text-primary">
          kollector.ai
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-foreground/80">
          Your personal AI mentor. Get detailed explanations for your toughest doubts and practice with tailored MCQs to master any subject.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Button asChild size="lg">
            <Link href="/chat">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
