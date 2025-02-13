
import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import ChatInterface from '@/components/chat/ChatInterface';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? <ChatInterface /> : <AuthForm />;
};

export default Index;
