import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const CollectiveMind = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ChatInterface moduleType="collective-mind" moduleTitle="Collective Mind" />
      </div>
    </div>
  );
};

export default CollectiveMind;
