import React from 'react';

interface VideoGridProps {
  participants: {
    id: string;
    stream: MediaStream;
    name: string;
    isHost: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
  }[];
  localStream: MediaStream | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({ participants, localStream }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 flex-grow">
      {localStream && (
        <div className="relative">
          <video
            className="w-full h-full object-cover rounded-lg"
            ref={(video) => {
              if (video) video.srcObject = localStream;
            }}
            autoPlay
            muted
            playsInline
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You
          </div>
        </div>
      )}
      {participants.map((participant) => (
        <div key={participant.id} className="relative">
          <video
            className="w-full h-full object-cover rounded-lg"
            ref={(video) => {
              if (video) video.srcObject = participant.stream;
            }}
            autoPlay
            playsInline
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            {participant.name} {participant.isHost && '(Host)'}
          </div>
          {!participant.audioEnabled && (
            <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {!participant.videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;