import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Camera, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface BrowserFrameProps {
  onScreenshotCapture?: (screenshot: string) => void;
  onAnalysis?: (analysis: string) => void;
}

export const BrowserFrame = ({ onScreenshotCapture, onAnalysis }: BrowserFrameProps) => {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handleNavigate = () => {
    try {
      new URL(url); // Validate URL
      setCurrentUrl(url);
    } catch (error) {
      toast({
        title: "Ungültige URL",
        description: "Bitte gib eine gültige URL ein",
        variant: "destructive",
      });
    }
  };

  const captureScreenshot = async () => {
    try {
      setIsAnalyzing(true);
      
      if (!iframeRef.current) {
        throw new Error('Iframe not found');
      }

      // Try to capture iframe content
      let canvas: HTMLCanvasElement;
      try {
        // This may fail due to CORS
        canvas = await html2canvas(iframeRef.current, {
          useCORS: true,
          allowTaint: true,
        });
      } catch (error) {
        // Fallback: capture the container
        const container = iframeRef.current.parentElement;
        if (!container) throw new Error('Container not found');
        
        canvas = await html2canvas(container, {
          useCORS: true,
          allowTaint: true,
        });
        
        toast({
          title: "CORS-Warnung",
          description: "Einige Seiten blockieren Screenshots. Die Extension kann besser damit umgehen.",
        });
      }

      const screenshot = canvas.toDataURL('image/png');
      
      if (onScreenshotCapture) {
        onScreenshotCapture(screenshot);
      }

      // Analyze with Vision AI
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-screenshot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ screenshot }),
        }
      );

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      if (onAnalysis) {
        onAnalysis(data.analysis);
      }

      toast({
        title: "Analyse abgeschlossen",
        description: "Die KI hat die Seite analysiert",
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: "Screenshot-Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Erstellen des Screenshots",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Browser Controls */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentUrl(currentUrl)}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="https://example.com"
            className="flex-1"
          />
          
          <Button onClick={handleNavigate} className="shrink-0">
            <ExternalLink className="h-4 w-4 mr-2" />
            Los
          </Button>
          
          <Button
            onClick={captureScreenshot}
            disabled={isAnalyzing}
            variant="secondary"
            className="shrink-0"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Analysieren
          </Button>
        </div>
      </Card>

      {/* Browser Frame */}
      <Card className="flex-1 overflow-hidden bg-background border-border/50">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Browser Frame"
        />
      </Card>

      {/* Info */}
      <Card className="p-3 bg-card/30 backdrop-blur-sm border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Viele Seiten blockieren Iframes (CORS). Installiere die Browser Extension für volle Funktionalität.
        </p>
      </Card>
    </div>
  );
};
