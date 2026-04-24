import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const BlackSultanOS = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="black-sultan" moduleTitle="Black Sultan OS" />
      </div>
    </div>
  );
};

export default BlackSultanOS;
