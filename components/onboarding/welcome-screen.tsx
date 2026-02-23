"use client";

import { ModelPicker } from "@/components/model-picker/model-picker";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-start min-h-full px-4 py-12">
      {/* Hero */}
      <div className="text-center space-y-3 mb-8 max-w-lg">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to AI Roundtable
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Connect multiple AI models and watch them deliberate on your questions.
          Each model responds independently, cross-examines others, and a final synthesis emerges.
        </p>

        {/* Steps */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="text-muted-foreground">Choose Models</span>
          </div>
          <div className="h-px w-6 bg-border" />
          <div className="flex items-center gap-2 text-xs">
            <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="text-muted-foreground">Enter API Keys</span>
          </div>
          <div className="h-px w-6 bg-border" />
          <div className="flex items-center gap-2 text-xs">
            <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="text-muted-foreground">Ask Anything</span>
          </div>
        </div>
      </div>

      {/* Embedded model picker */}
      <div className="w-full max-w-2xl">
        <ModelPicker />
      </div>
    </div>
  );
}
