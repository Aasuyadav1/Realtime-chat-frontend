// JoinRoomDialog.tsx
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormState {
  roomName: string;
  username: string;
}

interface JoinRoomDialogProps {
  onJoinRoom: (roomName: string, ws: WebSocket, username: string) => void;
}

export function JoinRoomDialog({ onJoinRoom }: JoinRoomDialogProps) {
  const [formState, setFormState] = useState<FormState>({
    roomName: '',
    username: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleJoinRoom = async () => {
    if (!formState.roomName.trim() || !formState.username.trim()) {
      setError('Both room name and username are required');
      return;
    }
    setIsConnecting(true);
    try {
      const ws = new WebSocket("ws://localhost:3001/");

      ws.onopen = () => {
        // Send join room message
        const joinMessage = {
          type: "join",
          room: formState.roomName.trim(),
          name: formState.username.trim() 
        };
        ws.send(JSON.stringify(joinMessage));
        
        // Call the onJoinRoom callback with the WebSocket instance
        onJoinRoom(formState.roomName, ws, formState.username);
        
        // Reset and close dialog
        setIsOpen(false);
        setFormState({ roomName: '', username: '' });
        setIsConnecting(false);
      };

      ws.onerror = () => {
        setError("Failed to connect to chat server");
        setIsConnecting(false);
      };

    } catch (err) {
      setError("Failed to connect to server");
      setIsConnecting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError("");
      setFormState({ roomName: '', username: '' });
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline">Join Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Chat Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-red-500">{error}</div>}
          <Input
            id="username"
            value={formState.username}
            onChange={handleInputChange}
            placeholder="Enter username"
            disabled={isConnecting}
          />
          <Input
            id="roomName"
            value={formState.roomName}
            onChange={handleInputChange}
            placeholder="Enter room name"
            disabled={isConnecting}
          />
          <Button onClick={handleJoinRoom} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Join"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}