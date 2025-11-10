import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserFrame } from '@/components/BrowserFrame';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Brain, Zap, Download, ExternalLink } from 'lucide-react';

export default function GuidedBrowser() {
  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const [analysis, setAnalysis] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ type: string; content: string; timestamp: string }>>([]);

  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message = event.detail;
      setMessages(prev => [...prev, {
        type: message.type,
        content: JSON.stringify(message, null, 2),
        timestamp: new Date().toISOString()
      }]);
    };

    window.addEventListener('ws-message', handleMessage as EventListener);
    return () => window.removeEventListener('ws-message', handleMessage as EventListener);
  }, []);

  const handleScreenshotCapture = (screenshotData: string) => {
    setScreenshot(screenshotData);
    sendMessage({
      type: 'screenshot',
      data: screenshotData,
      timestamp: new Date().toISOString()
    });
  };

  const handleAnalysis = (analysisResult: string) => {
    setAnalysis(analysisResult);
  };

  const sendCommand = (command: any) => {
    sendMessage({
      type: 'command',
      ...command,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">KI-Gesteuerter Browser</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Guided Browser
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lass die KI Webseiten analysieren und automatisiere Browser-Aktionen mit Vision AI und WebSocket-Kommunikation
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-4 py-2">
            <Zap className="w-3 h-3 mr-2" />
            WebSocket: {isConnected ? 'Verbunden' : 'Getrennt'}
          </Badge>
          {sessionId && (
            <Badge variant="outline" className="text-sm px-4 py-2">
              Session: {sessionId.slice(0, 8)}...
            </Badge>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Browser Frame - Left/Top */}
          <div className="lg:col-span-2">
            <BrowserFrame
              onScreenshotCapture={handleScreenshotCapture}
              onAnalysis={handleAnalysis}
            />
          </div>

          {/* Analysis & Controls - Right */}
          <div className="flex flex-col gap-6">
            {/* Vision AI Analysis */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Vision AI Analyse
              </h3>
              <ScrollArea className="h-[300px] pr-4">
                {analysis ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {analysis}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    Klicke auf "Analysieren" um die Seite zu analysieren
                  </p>
                )}
              </ScrollArea>
            </Card>

            {/* Quick Commands */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Quick Commands</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendCommand({ action: 'click', selector: 'button' })}
                  disabled={!isConnected}
                >
                  Click Button
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendCommand({ action: 'scroll', direction: 'down' })}
                  disabled={!isConnected}
                >
                  Scroll Down
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendCommand({ action: 'screenshot' })}
                  disabled={!isConnected}
                >
                  Take Screenshot
                </Button>
              </div>
            </Card>

            {/* Extension Download */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Browser Extension
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Installiere die Extension für volle Browser-Automation
              </p>
              <Button className="w-full" asChild>
                <a href="/extension/extension.zip" download>
                  <Download className="w-4 h-4 mr-2" />
                  Extension Download
                </a>
              </Button>
              <Button variant="link" className="w-full mt-2" asChild>
                <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Installations-Anleitung
                </a>
              </Button>
            </Card>

            {/* Message Log */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Message Log</h3>
              <ScrollArea className="h-[200px] pr-4">
                {messages.length > 0 ? (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="text-xs font-mono">
                        <Badge variant="outline" className="text-xs mb-1">
                          {msg.type}
                        </Badge>
                        <pre className="text-muted-foreground overflow-x-auto">
                          {msg.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    Keine Nachrichten
                  </p>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
