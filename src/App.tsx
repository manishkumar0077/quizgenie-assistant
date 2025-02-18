
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import AuthForm from "./components/auth/AuthForm";
import ChatInterface from "./components/chat/ChatInterface";
import Landing from "./pages/Landing";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (_event === 'SIGNED_IN') {
        toast({
          title: "Signed in",
          description: "Welcome back!",
        });
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={!session ? <AuthForm /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/chat" 
          element={session ? <ChatInterface /> : <Navigate to="/login" />} 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
