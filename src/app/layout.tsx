import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Birdpattern Studio',
  description: 'Editor für Patterns, Personas, States, Signals & Intents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
