import './globals.css';

export const metadata = {
  title: 'AI Resume Enhancer & Interview Prep',
  description: 'AI-powered resume optimization and interview preparation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
