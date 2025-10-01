import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuantumCard } from "@/components/ui/quantum-card";
import { Badge } from "@/components/ui/badge";
import { Send, Shield, Lock, CheckCircle, AlertCircle, Clock, Users } from "lucide-react";
import { encodeQuantumMessage, transmitQuantumMessage, getQuantumMessages, getMessageTransmissionStatus } from "@/lib/quantumMessaging";
import type { QuantumMessage } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const techLeaders = [
  { name: "Tech Leaders Alliance", endpoint: "https://leaders.tech/quantum", org: "Global Tech Council" },
  { name: "Silicon Valley Founders", endpoint: "https://sv-founders.io/secure", org: "SV Founders Network" },
  { name: "Open Source Maintainers", endpoint: "https://opensource.dev/contact", org: "OSS Community" },
  { name: "AI Research Leaders", endpoint: "https://ai-research.org/quantum", org: "AI Research Consortium" },
  { name: "Quantum Computing Alliance", endpoint: "https://quantum-alliance.tech/inbox", org: "Quantum Alliance" }
];

const QuantumMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<QuantumMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Form fields
  const [recipientIndex, setRecipientIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [encodingStatus, setEncodingStatus] = useState<string>("");
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getQuantumMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load quantum messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recipientIndex === null || !subject || !content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const selectedLeader = techLeaders[recipientIndex];
    if (!selectedLeader) {
      toast({
        title: "Error",
        description: "Please select a valid recipient",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      setEncodingStatus("Initiating quantum encoding...");

      // Encode the message with quantum encryption
      const encodedMessage = await encodeQuantumMessage(
        subject,
        content,
        selectedLeader.name,
        selectedLeader.endpoint,
        // Using userId: 1 as the default quantum_supervisor user from seeded data
        // (No actual auth system is implemented in this app)
        1
      );

      setEncodingStatus(`Quantum key: ${encodedMessage.quantumKey.substring(0, 8)}...`);

      // Transmit the encoded message
      setEncodingStatus("Transmitting through quantum channel...");
      const transmittedMessage = await transmitQuantumMessage(encodedMessage);

      toast({
        title: "Message Sent",
        description: `Quantum message transmitted successfully to ${selectedLeader.name}`,
      });

      // Reset form
      setRecipientIndex(null);
      setSubject("");
      setContent("");
      setEncodingStatus("");

      // Refresh messages list
      await fetchMessages();

      // Start polling for message status updates
      startPollingMessageStatus(transmittedMessage.messageId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Transmission Failed",
        description: error instanceof Error ? error.message : "Failed to send quantum message",
        variant: "destructive",
      });
      setEncodingStatus("");
    } finally {
      setSending(false);
    }
  };

  const startPollingMessageStatus = (messageId: string) => {
    // Clear any existing polling interval
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }

    // Poll message status every 3 seconds
    const intervalId = setInterval(async () => {
      try {
        const status = await getMessageTransmissionStatus(messageId);
        
        // Update the message in the messages array
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.messageId === messageId 
              ? { ...msg, transmissionStatus: status }
              : msg
          )
        );

        // Stop polling if the message is delivered or failed
        if (status === "delivered" || status === "failed") {
          clearInterval(intervalId);
          setPollingIntervalId(null);
        }
      } catch (error) {
        console.error("Error polling message status:", error);
      }
    }, 3000);

    setPollingIntervalId(intervalId);
  };

  // Calculate message statistics
  const totalMessages = messages.length;
  const transmittedMessages = messages.filter(m => 
    m.transmissionStatus === "transmitted" || m.transmissionStatus === "delivered"
  ).length;
  const pendingMessages = messages.filter(m => m.transmissionStatus === "pending").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-[#ffaa00] text-black" data-testid={`badge-status-${status}`}>
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case "transmitted":
        return <Badge className="bg-[#0099ff] text-white" data-testid={`badge-status-${status}`}>
          <Send className="h-3 w-3 mr-1" />
          Transmitted
        </Badge>;
      case "delivered":
        return <Badge className="bg-[#00cc66] text-white" data-testid={`badge-status-${status}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white" data-testid={`badge-status-${status}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header systemStatus="online" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-1" data-testid="heading-quantum-messages">Quantum Secure Messages</h2>
              <p className="text-gray-400">Send quantum-encrypted messages to tech leaders worldwide</p>
            </div>

            {/* Message Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#6a11cb]" data-testid="stat-total-messages">{totalMessages}</span>
                  <span className="text-sm text-gray-400 mt-1">Total Messages</span>
                </div>
              </QuantumCard>
              
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#0099ff]" data-testid="stat-transmitted-messages">{transmittedMessages}</span>
                  <span className="text-sm text-gray-400 mt-1">Transmitted</span>
                </div>
              </QuantumCard>
              
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#ffaa00]" data-testid="stat-pending-messages">{pendingMessages}</span>
                  <span className="text-sm text-gray-400 mt-1">Pending</span>
                </div>
              </QuantumCard>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message Composer Form */}
              <div>
                <QuantumCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-[#6a11cb]" />
                    <h3 className="text-lg font-semibold">Compose Quantum Message</h3>
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    {/* Recipient Select */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Users className="h-4 w-4 inline mr-1" />
                        Recipient
                      </label>
                      <Select 
                        value={recipientIndex !== null ? String(recipientIndex) : ""} 
                        onValueChange={(value) => setRecipientIndex(Number(value))}
                      >
                        <SelectTrigger className="w-full" data-testid="select-recipient">
                          <SelectValue placeholder="Select tech leader..." />
                        </SelectTrigger>
                        <SelectContent>
                          {techLeaders.map((leader, index) => (
                            <SelectItem key={leader.name} value={String(index)} data-testid={`option-recipient-${leader.name}`}>
                              <div className="flex flex-col">
                                <span className="font-medium">{leader.name}</span>
                                <span className="text-xs text-gray-400">{leader.org}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        type="text"
                        placeholder="Message subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={sending}
                        data-testid="input-subject"
                      />
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        placeholder="Type your quantum-encrypted message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={sending}
                        rows={6}
                        data-testid="textarea-content"
                      />
                    </div>

                    {/* Encoding Status */}
                    {encodingStatus && (
                      <div className="flex items-center gap-2 p-3 bg-[#6a11cb]/10 rounded-md border border-[#6a11cb]/20">
                        <Lock className="h-4 w-4 text-[#6a11cb] animate-pulse" />
                        <span className="text-sm text-gray-300" data-testid="text-encoding-status">{encodingStatus}</span>
                      </div>
                    )}

                    {/* Send Button */}
                    <Button
                      type="submit"
                      disabled={sending || recipientIndex === null || !subject || !content}
                      className="w-full bg-gradient-to-r from-[#6a11cb] to-[#2575fc] hover:opacity-90 transition-opacity"
                      data-testid="button-send-message"
                    >
                      {sending ? (
                        <>
                          <Lock className="h-4 w-4 mr-2 animate-pulse" />
                          Encoding & Transmitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Quantum Message
                        </>
                      )}
                    </Button>

                    {/* Quantum Security Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                      <Shield className="h-3 w-3" />
                      <span>Protected by CloakTrace Quantum Encryption</span>
                    </div>
                  </form>
                </QuantumCard>
              </div>

              {/* Messages List */}
              <div>
                <QuantumCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="h-5 w-5 text-[#2575fc]" />
                    <h3 className="text-lg font-semibold">Sent Messages</h3>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-800/30 rounded-md animate-pulse" />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Send className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No messages sent yet</p>
                      <p className="text-sm text-gray-500 mt-1">Compose your first quantum message</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-md border border-gray-700/50 hover:border-[#6a11cb]/30 transition-colors"
                          data-testid={`card-message-${message.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Lock className="h-4 w-4 text-[#6a11cb]" />
                                <span className="font-medium text-sm" data-testid={`text-recipient-${message.id}`}>
                                  {message.recipient}
                                </span>
                              </div>
                              <h4 className="font-semibold" data-testid={`text-subject-${message.id}`}>
                                {message.subject}
                              </h4>
                            </div>
                            <div>
                              {getStatusBadge(message.transmissionStatus)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 mb-3 line-clamp-2" data-testid={`text-content-${message.id}`}>
                            {message.content}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              <span data-testid={`text-quantum-key-${message.id}`}>
                                Key: {message.quantumKey.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span data-testid={`text-timestamp-${message.id}`}>
                                {message.createdAt 
                                  ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </QuantumCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuantumMessages;
