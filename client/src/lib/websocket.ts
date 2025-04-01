// Manages WebSocket connection to the server for real-time updates

let socket: WebSocket | null = null;
const messageHandlers: Record<string, ((data: any) => void)[]> = {};

// Initialize WebSocket connection with retry mechanism
export function initializeWebSocket(): WebSocket {
  // If we already have an open connection, return it
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }
  
  // Close existing socket if it's in a closing or closed state
  if (socket && (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED)) {
    socket = null;
  }
  
  // If we have an existing connecting socket, return it
  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket;
  }
  
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  console.log("Connecting to WebSocket at:", wsUrl);
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onclose = (event) => {
    console.log(`WebSocket connection closed with code ${event.code}`);
    
    // Don't try to reconnect if we're closing deliberately (code 1000)
    if (event.code !== 1000) {
      // Exponential backoff for reconnection (max 10 seconds)
      const delay = Math.min(3000 + (Math.random() * 1000), 10000);
      console.log(`Attempting to reconnect in ${Math.round(delay/1000)}s...`);
      
      setTimeout(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          initializeWebSocket();
        }
      }, delay);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Error event is typically followed by close event, where reconnection is handled
  };
  
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;
      
      // Call registered handlers for this message type
      if (messageHandlers[type]) {
        messageHandlers[type].forEach(handler => handler(data));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  return socket;
}

// Send message to server
export function sendMessage(type: string, data: any): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, trying to initialize');
    socket = initializeWebSocket();
    // Queue message to send when connection opens
    socket.addEventListener('open', () => {
      sendMessage(type, data);
    }, { once: true });
    return;
  }
  
  socket.send(JSON.stringify({ type, data }));
}

// Register handler for specific message types
export function onMessage(type: string, handler: (data: any) => void): () => void {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  
  messageHandlers[type].push(handler);
  
  // Return a function to unregister this handler
  return () => {
    if (messageHandlers[type]) {
      messageHandlers[type] = messageHandlers[type].filter(h => h !== handler);
    }
  };
}

// Request mission updates from server
export function requestMissionsUpdate(): void {
  sendMessage('requestMissionsUpdate', {});
}

// Export the websocket instance for direct access if needed
export function getSocket(): WebSocket | null {
  return socket;
}
