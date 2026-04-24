import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const AppCreator = () => {
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
