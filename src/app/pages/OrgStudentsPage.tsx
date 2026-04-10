import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Filter, MoreVertical, Mail, GraduationCap, CheckCircle2, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getOrgStudents, searchStudentsForOrg, sendOrgStudentInvite, Profile } from '../../lib/api';

export function OrgStudentsPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('All');
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [studentResults, setStudentResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        async function loadStudents() {
            if (user) {
                setIsLoading(true);
                const data = await getOrgStudents(user.id);
                setStudents(data);
                setIsLoading(false);
            }
        }
        loadStudents();
    }, [user]);

    // Student Search Effect
    useEffect(() => {
        if (studentSearchQuery.length < 2) {
            setStudentResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchStudentsForOrg(studentSearchQuery);
            // Filter out ones already in students list
            const existingIds = students.map(s => s.student_id);
            setStudentResults(results.filter(r => !existingIds.includes(r.id)));
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [studentSearchQuery, students]);

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGrade === 'All' || student.grade === filterGrade;
        return matchesSearch && matchesGrade;
    });

    const grades = ['All', ...Array.from(new Set(students.map(s => s.grade))).sort()];

    const handleSendStudentInvite = async (student: Profile) => {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const success = await sendOrgStudentInvite(user.id, student.id);
            if (success) {
                toast.success(`Invitation sent successfully to ${student.full_name}!`);
                setIsModalOpen(false);
                setStudentSearchQuery('');
                setStudentResults([]);
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
                        <h1 className="text-2xl font-bold text-gray-900">Students Directory</h1>
                        <p className="text-gray-500">Manage and view all students enrolled in your organisation.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-5 h-5" />
                        Invite New Student
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterGrade}
                                onChange={(e) => setFilterGrade(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                            >
                                {grades.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Performance</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {student.avatar ? (
                                                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-gray-900">{student.name}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                        {student.grade}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                                    {student.joinDate}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${student.performance.startsWith('A') ? 'bg-green-100 text-green-700' :
                                                        student.performance.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {student.performance}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${student.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        {student.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50" title="More options">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-500">
                                                {searchTerm ? "No students found matching your search." : "No students found. Invite your first student!"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <p>Showing {filteredStudents.length} students</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Invite Mentozy Student</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 border border-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <p className="text-sm text-gray-500 mb-4">
                                Search for a registered student on Mentozy to invite them to your organisation.
                            </p>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Search Student by Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={studentSearchQuery}
                                        onChange={e => setStudentSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 pl-10"
                                        placeholder="Type name (e.g. Jane Doe)..."
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {isSearching ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> : <Search className="h-5 w-5 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Search Results */}
                            {studentSearchQuery.length >= 2 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Results</h3>
                                    {isSearching ? (
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Searching...
                                        </div>
                                    ) : studentResults.length === 0 ? (
                                        <div className="text-sm text-gray-500 py-3 bg-gray-50 rounded-xl px-4 italic border border-gray-100">
                                            No students found matching "{studentSearchQuery}".
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {studentResults.map(student => (
                                                <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-white">
                                                    <div className="flex items-center gap-3">
                                                        {student.avatar_url ? (
                                                            <img src={student.avatar_url} alt={student.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                {student.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">{student.full_name}</div>
                                                            <div className="text-xs text-gray-500">{student.grade || 'Student'}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSendStudentInvite(student)}
                                                        disabled={isSubmitting}
                                                        className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-100 transition-colors disabled:opacity-50"
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

export default OrgStudentsPage;

