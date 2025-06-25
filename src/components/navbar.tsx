"use client";

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex-1 flex justify-start">
            <Link href="/chat" className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold hidden sm:inline-block">kollector.ai</span>
            </Link>
        </div>
        <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold md:text-xl font-headline whitespace-nowrap">
                AI Doubt Solver
            </h1>
        </div>
        <div className="flex-1 flex justify-end">
            {/* Placeholder for user avatar etc. */}
        </div>
      </div>
    </header>
  );
}
