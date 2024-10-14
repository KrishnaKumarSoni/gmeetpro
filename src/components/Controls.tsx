import React from 'react';
import { Video, VideoOff, Mic, MicOff, Users, MessageSquare } from 'lucide-react';

interface ControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
}) => {
  return (
    <div className="bg-white shadow-md p-4 flex justify-center space-x-4">
      <button
        onClick={onToggleAudio}
        className={`p-2 rounded-full ${
          isAudioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-white" />}
      </button>
      <button
        onClick={onToggleVideo}
        className={`p-2 rounded-full ${
          isVideoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-white" />}
      </button>
      <button
        onClick={onToggleChat}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      <button
        onClick={onToggleParticipants}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <Users className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Controls;