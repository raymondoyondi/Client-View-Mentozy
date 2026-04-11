import { useState, useEffect } from 'react';
import {
    BookOpen, ChevronRight, Clock,
    Search,
    Activity, Zap, Building2, Check, X, Bell,
    Flame, Trophy, GraduationCap, Target, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Enrollment, Profile, Booking, getStudentEnrollments, getUserProfile, getStudentBookings, getPendingOrgInvitesForStudent, respondToOrgStudentInvite } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from '../../components/ui/calendar';
import { StudentBookingDetailsModal } from '../components/booking/StudentBookingDetailsModal';
import { toast } from 'sonner';

export function StudentDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            // Clear previous state to avoid flickering
            setProfile(null);

            try {
                const [profileData, enrollmentsData, bookingsData, invitesData] = await Promise.all([
                    getUserProfile(user.id),
                    getStudentEnrollments(user.id),
                    getStudentBookings(user.id),
                    getPendingOrgInvitesForStudent(user.id)
                ]);

                if (profileData) {
                    // Redirect if accessing wrong dashboard
                    if (user?.user_metadata?.is_org) {
                        navigate('/org-dashboard', { replace: true });
                        return;
                    }
                    if (profileData.role === 'mentor') {
                        navigate('/mentor-dashboard', { replace: true });
                        return;
                    }
                    setProfile(profileData);
                }

                if (enrollmentsData) setEnrollments(enrollmentsData);
                if (bookingsData) setBookings(bookingsData);
                if (invitesData) setInvites(invitesData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    const handleRespondInvite = async (invite: any, accept: boolean) => {
        try {
            const success = await respondToOrgStudentInvite(invite.id, invite.org_id, user!.id, accept);
            if (success) {
                toast.success(accept ? `Joined ${invite.org.full_name}!` : "Invitation declined.");
                setInvites(prev => prev.filter(i => i.id !== invite.id));
                // Reload dashboard data to show new organization if accepted (though organizations aren't shown much on student dash yet)
            } else {
                toast.error("Failed to respond to invitation.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        }
    };

    // Derived Statistics
    console.log("Dashboard Render: ", { profile, enrollments, bookings, loading });

    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    const completedCourses = safeEnrollments.filter(e => e.status === 'completed');
    const completedCount = completedCourses.length;

    // Estimate hours: 10 hours per course * (progress / 100)
    const totalHours = Math.round(safeEnrollments.reduce((acc, curr) => acc + (10 * (curr.progress / 100)), 0));
    const lessonsCompleted = Math.round(safeEnrollments.reduce((acc, curr) => acc + (12 * (curr.progress / 100)), 0)); // Approx 12 lessons per course

    // Key Stats
    const streak = profile?.streak || 0;

    const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

    // Sort Bookings by date
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const featureBookings = [...safeBookings].sort((a, b) => {
        const dateA = new Date(a.scheduled_at).getTime();
        const dateB = new Date(b.scheduled_at).getTime();
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    // Calendar Modifiers (Highlight booked dates)
    const bookedDates = featureBookings
        .map(b => new Date(b.scheduled_at))
        .filter(d => !isNaN(d.getTime()));

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/tracks?search=${e.currentTarget.value}`);
        }
    };

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    return (
        <DashboardLayout>
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl shadow-amber-500/10 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
                        <p className="text-amber-100/90 text-base md:text-lg">Ready to power up your brain today?</p>
                    </div>

                    {/* Search / Quick Action Area */}
                    <div className="flex-1 max-w-xl bg-white/10 backdrop-blur-md rounded-2xl p-2 pl-4 flex items-center border border-white/20 transition-colors focus-within:bg-white/20">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for courses (Press Enter)..."
                                className="bg-transparent border-none text-white placeholder-amber-100/70 focus:outline-none w-full"
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Pills */}
                <div className="relative z-10 flex flex-wrap gap-3 mt-8">
                    <Link to="/tracks" className="flex items-center gap-2 px-4 py-2 bg-white/90 text-amber-900 rounded-full text-sm font-semibold hover:bg-white transition-colors shadow-sm">
                        <Zap className="w-4 h-4 text-amber-500" /> Browse Courses
                    </Link>
                    <Link to="/mentors" className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
                        <Activity className="w-4 h-4" /> Find Mentor
                    </Link>
                </div>

                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>
            </div>

            {/* Organization Invitations Banner */}
            {invites.length > 0 && (
                <div className="mb-8 space-y-4">
                    {invites.map((invite) => (
                        <div key={invite.id} className="relative overflow-hidden bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-lg shadow-indigo-100/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">New Invitation</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Invite to join <span className="text-indigo-600">{invite.org?.full_name}</span>
                                    </h3>
                                    <p className="text-sm text-gray-500">Would you like to join this organization as a student?</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleRespondInvite(invite, true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                >
                                    <Check className="w-5 h-5" /> Accept
                                </button>
                                <button
                                    onClick={() => handleRespondInvite(invite, false)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    <X className="w-5 h-5" /> Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

{/* Stats Overview - Enhanced Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Streak Card - Featured */}
                <div className="group relative bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-3xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            {streak > 0 && (
                                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                                    On Fire
                                </span>
                            )}
                        </div>
                        <h3 className="text-4xl font-black text-white mb-1">{streak}</h3>
                        <p className="text-orange-100 font-medium text-sm">Day Streak</p>
                    </div>
                </div>

                {/* Courses Completed */}
                <div className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-emerald-600" />
                        </div>
                        {completedCount > 0 && (
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-1">{completedCount}</h3>
                    <p className="text-gray-500 font-medium text-sm">Courses Done</p>
                </div>

                {/* Hours Learned */}
                <div className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-1">{totalHours}</h3>
                    <p className="text-gray-500 font-medium text-sm">Hours Learned</p>
                </div>

                {/* Lessons Completed */}
                <div className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-violet-600" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-1">{lessonsCompleted}</h3>
                    <p className="text-gray-500 font-medium text-sm">Lessons Done</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Courses & Activity) */}
                <div className="lg:col-span-2 space-y-8">

{/* My Courses Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                                    <p className="text-sm text-gray-500">{safeEnrollments.length} active courses</p>
                                </div>
                            </div>
                            <Link to="/tracks" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mb-10">
                            {loading ? (
                                [1, 2].map(i => (
                                    <div key={i} className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl animate-pulse">
                                        <div className="p-6 space-y-4">
                                            <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                                            <div className="h-6 w-3/4 bg-gray-200 rounded-lg" />
                                            <div className="h-4 w-full bg-gray-200 rounded-lg" />
                                            <div className="h-2 w-full bg-gray-200 rounded-full mt-auto" />
                                        </div>
                                    </div>
                                ))
                            ) : safeEnrollments.length > 0 ? (
                                safeEnrollments.slice(0, 2).map((enrollment, index) => {
                                    const gradients = [
                                        'from-indigo-500 via-violet-500 to-purple-500',
                                        'from-emerald-500 via-teal-500 to-cyan-500'
                                    ];
                                    return (
                                        <div key={enrollment.id} className="group relative overflow-hidden rounded-3xl bg-white border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 hover:-translate-y-1">
                                            {/* Gradient top bar */}
                                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradients[index % 2]}`}></div>
                                            
                                            {/* Progress glow effect */}
                                            <div 
                                                className="absolute bottom-0 left-0 h-32 bg-gradient-to-t from-indigo-50/50 to-transparent pointer-events-none transition-all duration-500"
                                                style={{ width: `${enrollment.progress}%` }}
                                            />

                                            <div className="relative p-7 flex flex-col h-full min-h-[260px]">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[index % 2]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                <BookOpen className="w-6 h-6 text-white" />
                                                            </div>
                                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                                                Active
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            {enrollment.tracks?.level}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2 leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {enrollment.tracks?.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                        {enrollment.tracks?.description || 'Continue your progress.'}
                                                    </p>
                                                </div>

                                                <div className="space-y-4 mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Progress</span>
                                                        <span className="text-sm font-black text-indigo-600">{enrollment.progress}%</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full bg-gradient-to-r ${gradients[index % 2]} rounded-full transition-all duration-1000 relative overflow-hidden`}
                                                            style={{ width: `${enrollment.progress}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                                        </div>
                                                    </div>
                                                    <Link 
                                                        to={`/learn/${enrollment.track_id}`} 
                                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group/btn"
                                                    >
                                                        Continue Learning
                                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-2 p-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Courses</h3>
                                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start your learning journey today and unlock new skills.</p>
                                    <Link to="/tracks" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                                        <Zap className="w-4 h-4" />
                                        Start Learning
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

{/* Right Column (Widgets) */}
                <div className="space-y-6">

                    {/* Calendar Widget (Real Bookings) */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-lg flex flex-col items-center overflow-hidden">
                        <div className="flex items-center justify-between mb-4 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">My Calendar</h2>
                                    <p className="text-xs text-gray-500">{featureBookings.length} upcoming sessions</p>
                                </div>
                            </div>
                        </div>

                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-xl border-0 shadow-none w-full"
                            modifiers={{ booked: bookedDates }}
                            modifiersClassNames={{ booked: "font-bold text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg" }}
                        />

                        {/* Upcoming Sessions */}
                        <div className="w-full mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Upcoming Sessions
                            </h3>
                            <div className="space-y-3">
                                {featureBookings.length > 0 ? (
                                    featureBookings.slice(0, 3).map(booking => (
                                        <div
                                            key={booking.id}
                                            onClick={() => handleBookingClick(booking)}
                                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-white rounded-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-indigo-200 hover:shadow-md"
                                        >
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex flex-col items-center justify-center font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                                <span className="text-[10px] uppercase opacity-80 leading-tight tracking-wider">{new Date(booking.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-black leading-none">{new Date(booking.scheduled_at).getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{booking.mentors?.name || 'Mentor'}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs font-medium text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">No upcoming sessions</p>
                                        <Link to="/mentors" className="inline-flex items-center gap-1 text-sm text-indigo-600 font-semibold mt-2 hover:underline">
                                            Find a mentor <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certifications Widget (Real Completed Courses) */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Certifications</h2>
                                    <p className="text-xs text-gray-500">{completedCourses.length} earned</p>
                                </div>
                            </div>
                            <Link to="/profile" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium">
                                View <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {completedCourses.length > 0 ? (
                            completedCourses.map(course => (
                                <div key={course.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 shadow-xl mb-4 hover:shadow-2xl transition-all duration-300">
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-xl" />
                                    
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-900 text-xs font-black shadow-md">M</div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mentozy Certificate</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-3 leading-tight">{course.tracks?.title}</h3>

                                        <div className="flex items-end justify-between pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Issued to</p>
                                                <p className="text-sm font-bold text-white">{firstName}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                <Check className="w-3.5 h-3.5" />
                                                Verified
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-7 h-7 text-amber-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">No Certificates Yet</h4>
                                <p className="text-gray-500 text-sm">Complete a course to earn your first certificate.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>


            <StudentBookingDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                booking={selectedBooking}
            />
        </DashboardLayout >
    );
}
