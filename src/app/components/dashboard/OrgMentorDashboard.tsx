import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, Clock, ChevronRight, Building2,
    GraduationCap, Bell, BookOpen, TrendingUp,
    CheckCircle2, Video, User, Activity
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { getMentorBookings, getOrgStudents, Booking } from '../../../lib/api';
import { getSupabase } from '../../../lib/supabase';

export function OrgMentorDashboard() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orgStudents, setOrgStudents] = useState<any[]>([]);
    const [orgCourses, setOrgCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Teacher';
    const orgName = activeOrganization?.name || 'Your Organization';

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id || !activeOrganization?.id) return;
            setLoading(true);
            try {
                const supabase = getSupabase();

                const [bookingsData, studentsData] = await Promise.all([
                    getMentorBookings(user.id),
                    getOrgStudents(activeOrganization.id),
                ]);

                if (bookingsData) setBookings(bookingsData);
                if (studentsData) setOrgStudents(studentsData);

                if (supabase) {
                    // Fetch org-specific courses assigned to/by this teacher's org
                    const { data: coursesData } = await supabase
                        .from('org_courses')
                        .select(`
                            id, assigned_at, is_mandatory,
                            track:tracks(id, title, level)
                        `)
                        .eq('org_id', activeOrganization.id)
                        .limit(5);

                    if (coursesData) setOrgCourses(coursesData);

                    // Fetch announcements
                    try {
                        const { data: announcementsData } = await supabase
                            .from('org_announcements')
                            .select('id, title, content, created_at')
                            .eq('org_id', activeOrganization.id)
                            .order('created_at', { ascending: false })
                            .limit(3);
                        if (announcementsData) setAnnouncements(announcementsData);
                    } catch { }
                }
            } catch (e) {
                console.error('Error loading org mentor data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id, activeOrganization?.id]);

    // Org-scoped sessions (all bookings for this mentor, displayed in org context)
    const pendingSessions = bookings.filter(b => b.status === 'pending');
    const confirmedSessions = bookings
        .filter(b => b.status === 'confirmed')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    const completedSessions = bookings.filter(b => b.status === 'completed');

    const activeStudents = orgStudents.filter(s => s.status === 'Active');

    return (
        <div>
            {/* Org-Branded Teacher Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-2xl shadow-teal-500/20 mb-8">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
                                    {orgName}
                                </span>
                                <span className="text-xs font-semibold bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/30">
                                    Teacher
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Welcome, {firstName}!
                            </h1>
                            <p className="text-emerald-100/90 text-base">
                                {pendingSessions.length > 0
                                    ? `You have ${pendingSessions.length} pending session request${pendingSessions.length === 1 ? '' : 's'} to review.`
                                    : `You're managing ${activeStudents.length} student${activeStudents.length === 1 ? '' : 's'} in ${orgName}.`}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3 flex-wrap">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{activeStudents.length}</p>
                                <p className="text-emerald-200 text-xs font-medium mt-1">Students</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{confirmedSessions.length}</p>
                                <p className="text-emerald-200 text-xs font-medium mt-1">Upcoming</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{completedSessions.length}</p>
                                <p className="text-emerald-200 text-xs font-medium mt-1">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-white">{activeStudents.length}</h3>
                        <p className="text-emerald-100 text-sm font-medium mt-0.5">Active Students</p>
                    </div>
                </div>

                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{confirmedSessions.length}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Upcoming</p>
                </div>

                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    {pendingSessions.length > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                            </span>
                        </div>
                    )}
                    <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{pendingSessions.length}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Pending</p>
                </div>

                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-11 h-11 bg-violet-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{completedSessions.length}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Completed</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Students & Sessions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Org Students */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Organization Students</h2>
                                    <p className="text-sm text-gray-500">Enrolled in {orgName}</p>
                                </div>
                            </div>
                            <Link to="/org-my-students" className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : orgStudents.length > 0 ? (
                            <div className="space-y-3">
                                {orgStudents.slice(0, 6).map((student: any) => (
                                    <div key={student.id} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
                                        <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                            {student.avatar ? (
                                                <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-emerald-700">
                                                    {student.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Grade: {student.grade || 'General'}
                                                {' · '}
                                                Joined {student.joinDate}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                                            student.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </div>
                                ))}
                                {orgStudents.length > 6 && (
                                    <Link
                                        to="/org-my-students"
                                        className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                                    >
                                        View {orgStudents.length - 6} more students <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border-2 border-dashed border-emerald-200 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Yet</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    {orgName} hasn't enrolled any students yet. Students appear here once they join the organization.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Sessions */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                                <p className="text-sm text-gray-500">Your scheduled org sessions</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : confirmedSessions.length > 0 ? (
                            <div className="space-y-3">
                                {confirmedSessions.slice(0, 4).map(session => (
                                    <div key={session.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            {session.profiles?.avatar_url ? (
                                                <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <User className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {session.profiles?.full_name || 'Student Session'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {' · '}
                                                {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full flex-shrink-0">
                                            Confirmed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                    {/* Org Courses */}
                    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Org Courses</h3>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : orgCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {orgCourses.map((c: any) => (
                                        <div key={c.id} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {c.track?.title || 'Untitled Course'}
                                                </p>
                                                <p className="text-xs text-indigo-600">{c.track?.level || 'All Levels'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-gray-400">No courses assigned yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Bell className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Announcements</h3>
                        </div>
                        <div className="p-5">
                            {announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {announcements.map((ann: any) => (
                                        <div key={ann.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                                            <p className="text-xs text-amber-600 font-medium mt-1.5">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No announcements yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Org Summary */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Org Summary</h3>
                                <p className="text-xs text-emerald-600">{orgName}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Total Students</span>
                                <span className="text-xs font-bold text-gray-900">{orgStudents.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Active Students</span>
                                <span className="text-xs font-bold text-emerald-600">{activeStudents.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Sessions Done</span>
                                <span className="text-xs font-bold text-gray-900">{completedSessions.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Org Courses</span>
                                <span className="text-xs font-bold text-gray-900">{orgCourses.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
