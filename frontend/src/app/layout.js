import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'AI Resume Enhancer — Land Your Dream Job',
  description: 'AI-powered resume ATS analyzer, enhancer, interview prep and career coach',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
