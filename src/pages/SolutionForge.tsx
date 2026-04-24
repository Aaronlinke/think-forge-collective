import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const SolutionForge = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="solution-forge" moduleTitle="Solution Forge" />
      </div>
    </div>
  );
};

export default SolutionForge;
