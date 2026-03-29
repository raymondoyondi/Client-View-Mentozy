import { BookOpen, Clock, BarChart, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTracks, Track, enrollInTrack, getStudentEnrollments } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledTrackIds, setEnrolledTrackIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getTracks();
      setTracks(data);

      if (user) {
        const enrollments = await getStudentEnrollments(user.id);
        setEnrolledTrackIds(enrollments.map(e => e.track_id));
      }

      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleEnroll = async (trackId: number | undefined, title: string) => {
    if (!trackId) return;

    if (!user) {
      toast.error("Please log in to enroll in a track");
      navigate('/login');
      return;
    }

    const success = await enrollInTrack(user.id, trackId);
    if (success) {
      toast.success(`Successfully enrolled in ${title}`);
      setEnrolledTrackIds(prev => [...prev, trackId]);
      navigate('/student-dashboard');
    } else {
      toast.error("Failed to enroll. You might already be enrolled.");
    }
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Curriculum
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Structured Learning Tracks
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive roadmaps designed by industry experts to take you from zero to job-ready.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center rotate-6">
                <BookOpen className="w-12 h-12 text-amber-500 -rotate-6" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Learning Tracks Coming Soon</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                We're currently curating expert-led learning paths to help you master new skills.
                Follow our social channels or check back soon to be the first to enroll!
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <div className="px-5 py-2.5 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl border border-gray-100">
                Data Science
              </div>
              <div className="px-5 py-2.5 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl border border-gray-100">
                Web Development
              </div>
              <div className="px-5 py-2.5 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl border border-gray-100">
                Full Stack
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {tracks.map((track, index) => {
              const isEnrolled = track.id && enrolledTrackIds.includes(track.id);
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{track.title}</h2>
                        {track.price !== undefined && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${track.price === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                              {track.price === 0 ? 'Free' : `$${track.price}`}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed max-w-2xl">{track.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BarChart className="w-4 h-4 text-amber-500" /> {track.level}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-amber-500" /> {track.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen className="w-4 h-4 text-amber-500" /> {track.projects} Projects
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Detailed Curriculum & Objectives</h3>
                    <div className="space-y-4">
                      {track.modules.map((mod: any, i: number) => {
                        const title = typeof mod === 'string' ? mod : (mod.title || 'Untitled Module');
                        const description = typeof mod === 'object' && mod.description ? mod.description : null;
                        const objectives = typeof mod === 'object' && Array.isArray(mod.objectives) ? mod.objectives : [];
                        const duration = typeof mod === 'object' && mod.duration ? mod.duration : null;

                        return (
                          <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</div>
                                  {title}
                                </h4>
                                {duration && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{duration}</span>}
                            </div>
                            {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
                            {objectives.length > 0 && (
                                <ul className="space-y-1">
                                    {objectives.map((obj: string, j: number) => (
                                        <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={() => navigate(`/learn/${track.id}`)} className="text-gray-500 font-medium hover:text-gray-900 transition-colors">
                      View Course Details
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-6 py-2.5 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(track.id, track.title)}
                        className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        Start Track <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  );
}