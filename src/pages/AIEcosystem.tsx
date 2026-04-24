import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const AIEcosystem = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="ai-ecosystem" moduleTitle="AI Ecosystem Hub" />
      </div>
    </div>
  );
};

export default AIEcosystem;
