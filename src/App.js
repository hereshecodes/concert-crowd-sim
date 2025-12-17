import React from 'react';
import ConcertCrowdSim from './ConcertCrowdSim';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Concert Crowd Simulator
          </h1>
          <p className="text-gray-400">
            Pick a track, control the crowd, and vibe out
          </p>
        </header>

        <ConcertCrowdSim />

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>
            Built by{' '}
            <a
              href="https://hereshecodes.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Danielle Hoopes
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
