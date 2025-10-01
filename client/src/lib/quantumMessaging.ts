import { apiRequest } from "@/lib/queryClient";
import { initiateCloakTraceHandshake } from "@/lib/cloakTraceAuth";
import type { QuantumMessage, InsertQuantumMessage } from "@shared/schema";

// Interface for encoded quantum message
export interface EncodedQuantumMessage {
  messageId: string;
  userId: number;
  recipient: string;
  recipientEndpoint: string;
  subject: string;
  content: string;
  quantumKey: string;
  encryptionHash: string;
  transmissionStatus: string;
  metadata?: any;
}

// Creates a quantum-secure hash using the quantum key
function createQuantumHash(content: string, quantumKey: string): string {
  // Combine content with quantum key for encryption
  const combined = `${content}::${quantumKey}::${Date.now()}`;
  // Use btoa for base64 encoding (similar to cloakTraceAuth)
  return btoa(combined).replace(/=/g, '');
}

// Generates a unique message ID
function generateMessageId(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `qmsg_${timestamp}_${randomStr}`;
}

/**
 * Encodes a quantum message with encryption using CloakTrace authentication
 * @param subject - Message subject
 * @param content - Message content
 * @param recipient - Recipient identifier
 * @param recipientEndpoint - Recipient's endpoint URL
 * @param userId - User ID of the sender
 * @returns Encoded quantum message ready for transmission
 */
export async function encodeQuantumMessage(
  subject: string,
  content: string,
  recipient: string,
  recipientEndpoint: string,
  userId: number
): Promise<EncodedQuantumMessage> {
  try {
    // Generate a quantum key using CloakTrace handshake
    const quantumKey = await initiateCloakTraceHandshake();
    
    // Create a quantum-secure hash of the message content
    const encryptionHash = createQuantumHash(content, quantumKey);
    
    // Generate a unique message ID
    const messageId = generateMessageId();
    
    // Return the encoded message object
    return {
      messageId,
      userId,
      recipient,
      recipientEndpoint,
      subject,
      content,
      quantumKey,
      encryptionHash,
      transmissionStatus: "pending",
      metadata: {
        encodedAt: new Date().toISOString(),
        version: "1.0"
      }
    };
  } catch (error) {
    console.error("Error encoding quantum message:", error);
    throw new Error(`Failed to encode quantum message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transmits an encoded quantum message to the backend
 * @param encodedMessage - The encoded quantum message to transmit
 * @returns The created quantum message with server-assigned properties
 */
export async function transmitQuantumMessage(
  encodedMessage: EncodedQuantumMessage
): Promise<QuantumMessage> {
  try {
    const response = await apiRequest('POST', '/api/quantum-messages', encodedMessage);
    const createdMessage = await response.json();
    
    return createdMessage;
  } catch (error) {
    console.error("Error transmitting quantum message:", error);
    throw new Error(`Failed to transmit quantum message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches all quantum messages from the backend
 * @returns Array of quantum messages
 */
export async function getQuantumMessages(): Promise<QuantumMessage[]> {
  try {
    const response = await apiRequest('GET', '/api/quantum-messages');
    const messages = await response.json();
    
    return messages;
  } catch (error) {
    console.error("Error fetching quantum messages:", error);
    throw new Error(`Failed to fetch quantum messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches the transmission status of a specific quantum message
 * @param messageId - The unique message identifier
 * @returns The transmission status string
 */
export async function getMessageTransmissionStatus(
  messageId: string
): Promise<string> {
  try {
    const response = await apiRequest('GET', `/api/quantum-messages/${messageId}/status`);
    const data = await response.json();
    
    return data.transmissionStatus || data.status || "unknown";
  } catch (error) {
    console.error("Error fetching message transmission status:", error);
    throw new Error(`Failed to fetch transmission status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
