import React from 'react';
import { Mic, MicOff, Video, VideoOff, Star } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  isHost: boolean;
  onToggleAudio: (participantId: string) => void;
  onToggleVideo: (participantId: string) => void;
  onSpotlight: (participantId: string) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  isHost,
  onToggleAudio,
  onToggleVideo,
  onSpotlight,
}) => {
  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-full">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {participants.map((participant) => (
          <div key={participant.id} className="p-4 border-b flex items-center justify-between">
            <div>
              <p className="font-semibold">{participant.name}</p>
              {participant.isHost && <p className="text-xs text-gray-500">Host</p>}
            </div>
            {isHost && participant.id !== 'local' && (
              <div className="flex space-x-2">
                <button onClick={() => onToggleAudio(participant.id)}>
                  {participant.audioEnabled ? (
                    <Mic className="w-5 h-5 text-gray-600" />
                  ) : (
                    <MicOff className="w-5 h-5 text-red-500" />
                  )}
                </button>
                <button onClick={() => onToggleVideo(participant.id)}>
                  {participant.videoEnabled ? (
                    <Video className="w-5 h-5 text-gray-600" />
                  ) : (
                    <VideoOff className="w-5 h-5 text-red-500" />
                  )}
                </button>
                <button onClick={() => onSpotlight(participant.id)}>
                  <Star className="w-5 h-5 text-yellow-500" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;