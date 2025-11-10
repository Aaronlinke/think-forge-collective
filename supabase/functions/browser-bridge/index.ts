import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store active connections
const connections = new Map<string, WebSocket>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if WebSocket upgrade request
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const sessionId = crypto.randomUUID();

    socket.onopen = () => {
      console.log(`WebSocket connection opened: ${sessionId}`);
      connections.set(sessionId, socket);
      
      // Send session ID to client
      socket.send(JSON.stringify({
        type: "connected",
        sessionId,
        timestamp: new Date().toISOString()
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`Message from ${sessionId}:`, message.type);

        // Handle different message types
        switch (message.type) {
          case "command":
            // Command from app to extension - broadcast to all connections
            broadcastToExtensions(message, sessionId);
            break;
          
          case "result":
            // Result from extension to app
            sendToApp(message, sessionId);
            break;
          
          case "screenshot":
            // Screenshot from extension
            sendToApp(message, sessionId);
            break;
          
          case "error":
            console.error(`Error from ${sessionId}:`, message.error);
            break;
          
          default:
            console.warn(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        socket.send(JSON.stringify({
          type: "error",
          error: "Invalid message format"
        }));
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed: ${sessionId}`);
      connections.delete(sessionId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${sessionId}:`, error);
      connections.delete(sessionId);
    };

    return response;
  } catch (error) {
    console.error("Error upgrading WebSocket:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upgrade to WebSocket" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function broadcastToExtensions(message: any, excludeSessionId: string) {
  connections.forEach((socket, sessionId) => {
    if (sessionId !== excludeSessionId && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  });
}

function sendToApp(message: any, fromSessionId: string) {
  connections.forEach((socket, sessionId) => {
    if (sessionId !== fromSessionId && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  });
}
