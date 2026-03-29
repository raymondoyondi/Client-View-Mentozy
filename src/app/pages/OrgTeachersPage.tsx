import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Plus, UserCheck, UserX, Mail, MapPin, Briefcase, X, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getOrgTeachers, searchMentorsForOrg, sendOrgMentorInvite, Profile } from '../../lib/api';

export function OrgTeachersPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mentorSearchQuery, setMentorSearchQuery] = useState('');
    const [mentorResults, setMentorResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        async function loadTeachers() {
            if (user) {
                setIsLoading(true);
                const data = await getOrgTeachers(user.id);
                setTeachers(data);
                setIsLoading(false);
            }
        }
        loadTeachers();
    }, [user]);

    // Mentor Search Effect
    useEffect(() => {
        if (mentorSearchQuery.length < 2) {
            setMentorResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchMentorsForOrg(mentorSearchQuery);
            // Filter out ones already in teachers list
            const existingIds = teachers.map(t => t.mentor_id);
            setMentorResults(results.filter(r => !existingIds.includes(r.id)));
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [mentorSearchQuery, teachers]);

    const filteredTeachers = teachers.filter(teacher =>
        (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMentorInvite = async (mentor: Profile) => {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const success = await sendOrgMentorInvite(user.id, mentor.id);
            if (success) {
                toast.success(`Invitation sent successfully to ${mentor.full_name}!`);
                setIsModalOpen(false);
                setMentorSearchQuery('');
                setMentorResults([]);
            } else {
                toast.error("Failed to send invite. Maybe they are already invited?");
            }
        } catch (err: any) {
            console.error("Invite Error", err);
            toast.error(err.message || "Failed to send invitation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff & Teachers</h1>
                        <p className="text-gray-500">Manage all educators and staff members in your organisation.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Plus className="w-5 h-5" />
                        Invite New Teacher
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" /> {teachers.filter(t => t.status === 'Active').length} Active
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <UserX className="w-4 h-4 text-amber-600" /> {teachers.filter(t => t.status !== 'Active').length} On Leave
                        </span>
                    </div>
                </div>

                {/* Teachers Grid */}
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                                {searchTerm ? "No teachers found matching your search." : "No teachers or staff members found. Invite your first teacher!"}
                            </div>
                        ) : (
                            filteredTeachers.map(teacher => (
                                <div key={teacher.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {/* Decorative Banner */}
                                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-indigo-50 to-blue-50/50"></div>

                                    <div className="relative flex items-start justify-between mb-4">
                                        <div className="flex gap-4 items-center">
                                            {teacher.avatar ? (
                                                <img src={teacher.avatar} alt={teacher.name} className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xl text-indigo-700 shadow-sm border-2 border-white">
                                                    {(teacher.name || 'U').charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{teacher.name}</h3>
                                                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                    {teacher.department || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            {teacher.role}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            Joined {teacher.joinDate}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Classes</span>
                                            <span className="font-bold text-gray-900">{teacher.classes || 0} Active</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${teacher.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                            }`}>
                                            {teacher.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Invite Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Invite Mentozy Instructor</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 border border-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <p className="text-sm text-gray-500 mb-4">
                                Search for a registered mentor on Mentozy to invite them to your organisation.
                            </p>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Search Mentor by Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={mentorSearchQuery}
                                        onChange={e => setMentorSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 pl-10"
                                        placeholder="Type name (e.g. John Doe)..."
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {isSearching ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /> : <Search className="h-5 w-5 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Search Results */}
                            {mentorSearchQuery.length >= 2 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Results</h3>
                                    {isSearching ? (
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Searching...
                                        </div>
                                    ) : mentorResults.length === 0 ? (
                                        <div className="text-sm text-gray-500 py-3 bg-gray-50 rounded-xl px-4 italic border border-gray-100">
                                            No mentors found matching "{mentorSearchQuery}".
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {mentorResults.map(mentor => (
                                                <div key={mentor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors bg-white">
                                                    <div className="flex items-center gap-3">
                                                        {mentor.avatar_url ? (
                                                            <img src={mentor.avatar_url} alt={mentor.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                                {mentor.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">{mentor.full_name}</div>
                                                            <div className="text-xs text-gray-500">{mentor.role || 'Mentor'}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSendMentorInvite(mentor)}
                                                        disabled={isSubmitting}
                                                        className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                                    >
                                                        Invite
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrgTeachersPage;
