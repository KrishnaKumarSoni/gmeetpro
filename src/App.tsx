import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';
import Chat from './components/Chat';
import ParticipantsList from './components/ParticipantsList';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsListOpen, setIsParticipantsListOpen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!socket || !localStream) return;

    socket.on('user-connected', (userId: string) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: localStream,
      });

      peer.on('signal', (signal) => {
        socket.emit('send-signal', { userId, signal });
      });

      peer.on('stream', (stream) => {
        setParticipants((prevParticipants) => [
          ...prevParticipants,
          { id: userId, stream, name: `User ${userId.substr(0, 5)}`, isHost: false, audioEnabled: true, videoEnabled: true },
        ]);
      });

      setPeers((prevPeers) => ({ ...prevPeers, [userId]: peer }));
    });

    socket.on('user-disconnected', (userId: string) => {
      if (peers[userId]) {
        peers[userId].destroy();
      }
      setPeers((prevPeers) => {
        const newPeers = { ...prevPeers };
        delete newPeers[userId];
        return newPeers;
      });
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p.id !== userId));
    });

    socket.on('receive-signal', ({ userId, signal }) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: localStream,
      });

      peer.on('signal', (signal) => {
        socket.emit('send-signal', { userId, signal });
      });

      peer.on('stream', (stream) => {
        setParticipants((prevParticipants) => [
          ...prevParticipants,
          { id: userId, stream, name: `User ${userId.substr(0, 5)}`, isHost: false, audioEnabled: true, videoEnabled: true },
        ]);
      });

      peer.signal(signal);
      setPeers((prevPeers) => ({ ...prevPeers, [userId]: peer }));
    });

    return () => {
      socket.off('user-connected');
      socket.off('user-disconnected');
      socket.off('receive-signal');
    };
  }, [socket, localStream]);

  const createRoom = useCallback(() => {
    if (socket) {
      socket.emit('create-room');
      socket.on('room-created', (newRoomId: string) => {
        setRoomId(newRoomId);
        setIsHost(true);
        joinRoom(newRoomId);
      });
    }
  }, [socket]);

  const joinRoom = useCallback((roomId: string) => {
    if (socket && localStream) {
      socket.emit('join-room', roomId, socket.id);
    }
  }, [socket, localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      socket?.emit('toggle-audio', roomId, socket.id, audioTrack.enabled);
    }
  }, [localStream, socket, roomId]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      socket?.emit('toggle-video', roomId, socket.id, videoTrack.enabled);
    }
  }, [localStream, socket, roomId]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const toggleParticipantsList = useCallback(() => {
    setIsParticipantsListOpen(prev => !prev);
  }, []);

  const handleToggleParticipantAudio = useCallback((participantId: string) => {
    socket?.emit('toggle-audio', roomId, participantId, false);
  }, [socket, roomId]);

  const handleToggleParticipantVideo = useCallback((participantId: string) => {
    socket?.emit('toggle-video', roomId, participantId, false);
  }, [socket, roomId]);

  const handleSpotlightParticipant = useCallback((participantId: string) => {
    socket?.emit('spotlight-user', roomId, participantId);
  }, [socket, roomId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">Google Meet Clone</h1>
        {!roomId && (
          <div className="mt-4">
            <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded">Create Room</button>
            <input
              type="text"
              placeholder="Enter Room ID"
              className="ml-4 px-2 py-1 border rounded"
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={() => roomId && joinRoom(roomId)} className="ml-2 bg-green-500 text-white px-4 py-2 rounded">Join Room</button>
          </div>
        )}
        {roomId && <p className="mt-2">Room ID: {roomId}</p>}
      </header>
      <main className="flex-grow flex">
        <VideoGrid participants={participants} localStream={localStream} />
        {isChatOpen && <Chat socket={socket} roomId={roomId} />}
        {isParticipantsListOpen && (
          <ParticipantsList
            participants={[
              { id: 'local', name: 'You', isHost, audioEnabled: isAudioEnabled, videoEnabled: isVideoEnabled },
              ...participants
            ]}
            isHost={isHost}
            onToggleAudio={handleToggleParticipantAudio}
            onToggleVideo={handleToggleParticipantVideo}
            onSpotlight={handleSpotlightParticipant}
          />
        )}
      </main>
      <Controls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipantsList}
      />
    </div>
  );
};

export default App;