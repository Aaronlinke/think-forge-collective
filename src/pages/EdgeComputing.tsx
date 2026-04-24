import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const EdgeComputing = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="edge-computing" moduleTitle="Edge Computing" />
      </div>
    </div>
  );
};

export default EdgeComputing;
