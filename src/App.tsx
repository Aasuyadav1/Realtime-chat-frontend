import { useState, useRef } from 'react'
import { ChatCard } from '@/components/ChatCard'
import { JoinRoomDialog } from '@/components/JoinRoomDialog'

export default function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  const handleJoinRoom = (roomName: string, ws: WebSocket, username: string) => {
    setCurrentRoom(roomName)
    wsRef.current = ws
    setUsername(username)
  }

  return (
    <div className="flex w-full border border-red-800 flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Chat App</h1>
      <JoinRoomDialog onJoinRoom={handleJoinRoom} />
      {currentRoom && wsRef.current && username && (
        <div className="mt-4">
          <ChatCard roomName={currentRoom} ws={wsRef.current} username={username} />
        </div>
      )}
    </div>
  )
}