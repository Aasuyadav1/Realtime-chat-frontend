// ChatCard.tsx
import { useState, FormEvent, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: string;
  content: string;
  type?: "send" | "join";
}

interface ChatCardProps {
  roomName: string;
  ws: WebSocket | null;
  username: string;
}

export function ChatCard({ roomName, ws, username }: ChatCardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          console.log("sockets messages ",message);
          
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: message.name,
              content: message.message,
            },
          ]);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  }, [ws]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: "send",
      message: input.trim(),
    };

    // Add user message to local state
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "send",
      role: "user",
      content: input.trim(),
    };

    // setMessages(prev => [...prev, userMessage])

    // Send message through WebSocket
    ws.send(JSON.stringify(messageData));

    setInput("");
  };

  useEffect(() => {
    if (roomName) {
      setMessages([]);
    }
  }, [roomName]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Chat Room: {roomName}
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-2 rounded ${
                message.role === username
                  ? "bg-blue-100 ml-8"
                  : "bg-gray-100 mr-8"
              }`}
            >
              <p className="font-semibold">
                {message.role === username ? "You" : message.role}:
              </p>
              <p className="break-words">{message.content}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!isConnected}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
