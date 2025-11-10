import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    try {
      const wsUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://')}/functions/v1/browser-bridge`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Verbunden",
          description: "WebSocket-Verbindung hergestellt",
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message:', message);

          if (message.type === 'connected') {
            setSessionId(message.sessionId);
          }

          // Dispatch custom event for components to listen to
          window.dispatchEvent(
            new CustomEvent('ws-message', { detail: message })
          );
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Verbindungsfehler",
          description: "WebSocket-Verbindung fehlgeschlagen",
          variant: "destructive",
        });
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSessionId(null);
        
        // Reconnect after 3 seconds
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast({
        title: "Fehler",
        description: "WebSocket konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('Sent message:', message.type);
    } else {
      console.error('WebSocket not connected');
      toast({
        title: "Nicht verbunden",
        description: "WebSocket ist nicht verbunden",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    sessionId,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
