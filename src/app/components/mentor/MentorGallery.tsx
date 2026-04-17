import { Search, Filter, Linkedin, Loader2, Calendar, User, Building2, ShieldCheck, Bot, Sparkles, Stars } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getMentors, Mentor, createBooking, getUserProfile, Profile } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookingModal } from '../booking/BookingModal';
import { MentorProfileModal } from './MentorProfileModal';

export function MentorGallery() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentProfile, setStudentProfile] = useState<Profile | null>(null);
    const [aiMatchMode, setAiMatchMode] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadMentors() {
            setLoading(true);
            const data = await getMentors();
            setMentors(data);
            setLoading(false);
        }
        loadMentors();
    }, []);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            const profile = await getUserProfile(user.id);
            setStudentProfile(profile);
        }
        loadProfile();
    }, [user]);

    const scoreMentorForStudent = (mentor: Mentor) => {
        if (!studentProfile) return 55;

        const profileIntent = [
            ...(studentProfile.interests || []),
            studentProfile.learning_goals,
            studentProfile.future_goals,
            studentProfile.learning_now,
            studentProfile.curiosities
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const mentorCorpus = `${mentor.role} ${mentor.company} ${mentor.expertise.join(' ')} ${mentor.bio || ''}`.toLowerCase();
        const sharedSkills = mentor.expertise.filter(skill => profileIntent.includes(skill.toLowerCase())).length;
        const goalSignal = profileIntent
            .split(/[^a-zA-Z0-9]+/)
            .filter(Boolean)
            .reduce((count, token) => count + (token.length > 3 && mentorCorpus.includes(token) ? 1 : 0), 0);
        const availabilityBoost = mentor.status !== 'unavailable' ? 10 : -10;

        return Math.max(35, Math.min(99, 50 + sharedSkills * 12 + Math.min(18, goalSignal) + availabilityBoost));
    };

    const mentorScores = useMemo(() => {
        const byId: Record<number, number> = {};
        mentors.forEach(m => {
            byId[m.id] = scoreMentorForStudent(m);
        });
        return byId;
    }, [mentors, studentProfile]);

    const filteredMentors = useMemo(() => {
        const filtered = mentors.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.expertise.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (!aiMatchMode) return filtered;

        return [...filtered].sort((a, b) => (mentorScores[b.id] || 0) - (mentorScores[a.id] || 0));
    }, [mentors, searchQuery, aiMatchMode, mentorScores]);

    const topAiMatches = useMemo(() => filteredMentors.slice(0, 3), [filteredMentors]);

    const handleBookClick = (mentor: Mentor) => {
        if (!user) {
            toast.error("Please log in to book a session");
            navigate('/login');
            return;
        }
        setSelectedMentor(mentor);
    };

    const handleConfirmBooking = async (date: Date) => {
        if (!selectedMentor || !user) return false;
        const scheduledTime = date.toISOString();
        const success = await createBooking(user.id, selectedMentor.id, scheduledTime);
        if (success) {
            toast.success(`Session requested with ${selectedMentor.name}! Check your dashboard.`);
            navigate('/student-dashboard');
            return true;
        } else {
            toast.error("Failed to book session. Please try again.");
            return false;
        }
    };

    return (
        <div className="container mx-auto px-6 relative z-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center mb-16"
            >
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
                    Discovery <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700">Top-Tier</span> Mentors
                </h1>
                <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
                    Skip the guesswork. Learn directly from industry leaders who have already scaled the mountains you're climbing.
                </p>
            </motion.div>

            {user && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-5xl mx-auto mb-10 p-6 rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 shadow-lg"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-500 mb-2 flex items-center gap-2">
                                <Bot className="w-4 h-4" /> Assistant Bot · AI Matching
                            </p>
                            <h3 className="text-xl font-black text-gray-900">Personalized mentor recommendations based on your onboarding goals</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                We score mentors by expertise overlap, stated goals, and current availability so you can book faster.
                            </p>
                        </div>
                        <button
                            onClick={() => setAiMatchMode(prev => !prev)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${aiMatchMode ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-violet-600 border border-violet-200'}`}
                        >
                            {aiMatchMode ? 'AI Match Mode: ON' : 'AI Match Mode: OFF'}
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mt-5">
                        {topAiMatches.map((mentor) => (
                            <div key={`ai-${mentor.id}`} className="p-3 rounded-xl bg-white/90 border border-violet-100">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-gray-900 truncate">{mentor.name}</p>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-black bg-violet-100 text-violet-700">
                                        <Sparkles className="w-3.5 h-3.5" /> {mentorScores[mentor.id]}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{mentor.role} · {mentor.company}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-morphism-heavy p-3 rounded-[2.5rem] border border-white/50 shadow-2xl shadow-gray-200/50 mb-20 flex flex-col md:flex-row gap-3 max-w-5xl mx-auto"
            >
                <div className="relative flex-grow group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, company, or specialty..."
                        className="w-full pl-14 pr-6 py-5 bg-white/50 border-none rounded-[2rem] focus:ring-2 focus:ring-amber-200 outline-none text-gray-800 placeholder:text-gray-400 font-bold transition-all"
                    />
                </div>
                <button
                    onClick={() => toast.info("Deep filtering features coming in the next update!")}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-amber-600 hover:scale-[1.02] transition-all shadow-lg active:scale-95 group"
                >
                    <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Deep Filters</span>
                </button>
            </motion.div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
                        <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
                    </div>
                    <p className="text-gray-400 font-bold text-lg animate-pulse tracking-tight">Curating the best for you...</p>
                </div>
            ) : (
                /* Mentors Grid */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredMentors.map((mentor, index) => (
                            <motion.div
                                key={mentor.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                                className="group relative"
                            >
                                {/* Card Main Body */}
                                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white border-t-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_80px_rgba(251,191,36,0.15)] transition-all duration-700 flex flex-col h-full relative z-10 overflow-hidden">
                                    {/* Glowing Accent */}
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col items-center text-center mb-8 pt-4">
                                        <div className="relative mb-6">
                                            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl relative z-10 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110 ${mentor.image}`}>
                                                {mentor.initials}
                                            </div>
                                            <div className="absolute -inset-4 bg-amber-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-1 right-1 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 z-20">
                                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors mb-2 tracking-tighter">
                                            {mentor.name}
                                        </h3>

                                        {user && aiMatchMode && (
                                            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[10px] font-black uppercase tracking-[0.16em]">
                                                <Stars className="w-3.5 h-3.5" /> AI Match {mentorScores[mentor.id]}%
                                            </div>
                                        )}

                                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                                            {mentor.type ? <Building2 className="w-3.5 h-3.5 text-amber-500" /> : <User className="w-3.5 h-3.5 text-amber-500" />}
                                            {mentor.role}
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-3 ${mentor.status === 'unavailable' ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                            {mentor.status === 'unavailable' ? 'Offline' : 'Available Now'}
                                        </div>

                                        {mentor.company && mentor.company !== 'Mentozy' && (
                                            <p className="text-sm font-bold text-gray-400 flex items-center gap-1">
                                                at <span className="text-gray-900">{mentor.company}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-6 flex-grow flex flex-col justify-between">
                                        <p className="text-gray-500 text-sm leading-relaxed text-center font-medium line-clamp-3 italic">
                                            "{mentor.bio || `Specializing in ${mentor.expertise[0] || 'Modern Technologies'} and industry leadership.`}"
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-2">
                                            {mentor.expertise.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-5 py-2 bg-white rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-tighter border border-gray-100 shadow-sm transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500 cursor-default">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between py-6 px-4 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Experience</p>
                                                <p className="text-base font-black text-gray-900">{mentor.years_experience || 5}+ <span className="text-xs text-gray-400 font-medium whitespace-nowrap">yrs</span></p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-200" />
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Fee</p>
                                                <p className="text-base font-black text-amber-600">${mentor.hourly_rate || 150}<span className="text-[10px] text-gray-400">/hr</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedMentor(mentor);
                                                setProfileModalOpen(true);
                                            }}
                                            className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:border-gray-900 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
                                        >
                                            <User className="w-4 h-4" /> View Profile
                                        </button>
                                    </div>

                                    <div className="mt-3 flex gap-3">
                                        <button
                                            onClick={() => handleBookClick(mentor)}
                                            disabled={mentor.status === 'unavailable'}
                                            className={`flex-1 py-5 text-white text-sm font-black rounded-[2rem] shadow-xl lg:shadow-none transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${mentor.status === 'unavailable'
                                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                                : 'bg-gray-900 hover:bg-amber-600 hover:shadow-amber-200/50 active:scale-95'
                                                }`}
                                        >
                                            {mentor.status === 'unavailable' ? (
                                                <span className="relative z-10 uppercase tracking-wide">Unavailable</span>
                                            ) : (
                                                <>
                                                    <Calendar className="w-5 h-5 relative z-10" />
                                                    <span className="relative z-10">Instant Booking</span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => toast.info("Mentor's LinkedIn profile is private.")}
                                            className="p-5 bg-white border border-gray-100 rounded-[2rem] text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                                        >
                                            <Linkedin className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <BookingModal
                isOpen={!!selectedMentor && !profileModalOpen} // Ensure only one modal active if overlapping, though better to separate state
                onClose={() => setSelectedMentor(null)}
                mentorName={selectedMentor?.name || ''}
                userPlan="Free"
                onConfirm={handleConfirmBooking}
            />

            <MentorProfileModal
                isOpen={profileModalOpen}
                onClose={() => {
                    setProfileModalOpen(false);
                    // Don't clear selectedMentor here if we want to preseve it for booking transition? 
                    // Actually usually 'selectedMentor' is shared.
                    // If we close profile, we just close.
                    if (!selectedMentor) setSelectedMentor(null);
                }}
                mentor={selectedMentor}
                onBook={(m) => {
                    setProfileModalOpen(false);
                    // selectedMentor is already set. 
                    // Just triggering booking flow.
                    handleBookClick(m);
                }}
            />
        </div>
    );
}
