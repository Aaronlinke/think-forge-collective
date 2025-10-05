import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
};

const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success("Code kopiert!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <Card className="max-w-[80%] rounded-lg p-4 bg-primary text-primary-foreground">
          <p className="whitespace-pre-wrap">{content}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <Card className="max-w-[80%] rounded-lg p-4 bg-muted">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const { node, inline, className, children, ...rest } = props as any;
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              
              return !inline && match ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(codeString)}
                  >
                    {copiedCode === codeString ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md my-2"
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-background px-1.5 py-0.5 rounded text-sm" {...rest}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </Card>
    </div>
  );
};

export default MessageBubble;
