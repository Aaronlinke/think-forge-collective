import { Card } from "@/components/ui/card";

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <Card className="max-w-[80%] rounded-lg p-4 bg-muted">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;
