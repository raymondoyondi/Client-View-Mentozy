import { useEffect, useMemo, useRef, useState } from 'react';
import { Video, PhoneOff, Mic, MicOff, VideoOff, Link2, MonitorPlay } from 'lucide-react';
import { toast } from 'sonner';

interface LiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
}

type Provider = 'webrtc' | 'zoom';

export function LiveSessionModal({ isOpen, onClose, participantName }: LiveSessionModalProps) {
  const [provider, setProvider] = useState<Provider>('webrtc');
  const [inSession, setInSession] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const roomId = useMemo(() => `mentozy-${Date.now().toString(36)}`, []);

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
  }, [isOpen]);

  const stopSession = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setInSession(false);
    setIsMicOn(true);
    setIsCameraOn(true);
  };

  const startWebRtcSession = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('WebRTC is not supported on this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setInSession(true);
      toast.success(`Live session started with ${participantName}`);
    } catch (error) {
      toast.error('Could not access camera/microphone. Please check permissions.');
    }
  };

  const launchZoom = () => {
    const topic = encodeURIComponent(`1-on-1 Mentorship with ${participantName}`);
    const zoomUrl = `https://zoom.us/start/videomeeting?zc=0&topic=${topic}`;
    window.open(zoomUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opened Zoom in a new tab.');
  };

  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    if (kind === 'audio') setIsMicOn(prev => !prev);
    if (kind === 'video') setIsCameraOn(prev => !prev);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Live Video Integration</p>
            <h3 className="text-xl font-black text-gray-900">1-on-1 Session with {participantName}</h3>
          </div>
          <button onClick={() => { stopSession(); onClose(); }} className="text-gray-500 hover:text-gray-900 font-semibold">Close</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => setProvider('webrtc')} className={`p-4 rounded-2xl border text-left ${provider === 'webrtc' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 font-bold text-gray-900"><MonitorPlay className="w-4 h-4" /> Native WebRTC</div>
              <p className="text-xs text-gray-500 mt-1">Stay inside Mentozy for low-latency mentorship calls.</p>
            </button>
            <button onClick={() => setProvider('zoom')} className={`p-4 rounded-2xl border text-left ${provider === 'zoom' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 font-bold text-gray-900"><Link2 className="w-4 h-4" /> Zoom Integration</div>
              <p className="text-xs text-gray-500 mt-1">Launch a secure Zoom meeting instantly in a new tab.</p>
            </button>
          </div>

          {provider === 'webrtc' ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-950 p-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 relative">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!inSession && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">Camera preview appears here after starting.</div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                {!inSession ? (
                  <button onClick={startWebRtcSession} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 inline-flex items-center gap-2">
                    <Video className="w-4 h-4" /> Start Session
                  </button>
                ) : (
                  <>
                    <button onClick={() => toggleTrack('audio')} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20">
                      {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    <button onClick={() => toggleTrack('video')} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20">
                      {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                    <button onClick={stopSession} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 inline-flex items-center gap-2">
                      <PhoneOff className="w-4 h-4" /> End Session
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">Room ID: <span className="font-bold text-gray-900">{roomId}</span></p>
              <button onClick={launchZoom} className="px-5 py-2.5 rounded-xl bg-[#0B5CFF] text-white font-bold hover:opacity-90 inline-flex items-center gap-2">
                <Video className="w-4 h-4" /> Open Zoom Meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
