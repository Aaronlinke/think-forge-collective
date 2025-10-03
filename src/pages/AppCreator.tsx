import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const AppCreator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="app-creator" moduleTitle="App Creator" />
      </div>
    </div>
  );
};

export default AppCreator;
