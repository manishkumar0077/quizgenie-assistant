
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import AuthForm from "./components/auth/AuthForm";
import ChatInterface from "./components/chat/ChatInterface";
import Landing from "./pages/Landing";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!session ? <AuthForm /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={session ? <ChatInterface /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
