import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Loader2, Users, FileText, CheckCircle, ShieldAlert, Eye } from 'lucide-react';
import { toast } from 'sonner';

type MentorApplication = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    qualification: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    hours_daily: string;
    commitment_type: string;
    skills: string[];
    interests: string[];
    qualification_details: any;
    why_teach: string;
    teaching_differentiator: string;
    scenario_many_doubts: string;
    scenario_shy_child: string;
    scenario_edtech_confusion: string;
    government_id_url: string;
    pan_or_equivalent_url: string;
    additional_info: string;
};

export function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, pendingApps: 0, approvedMentors: 0 });
    const [pendingApps, setPendingApps] = useState<MentorApplication[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            const { data: applications, error } = await supabase
                .from('mentor_applications')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (error) throw error;

            const all = (applications || []) as MentorApplication[];
            const pending = all.filter(a => a.status === 'pending');
            const approved = all.filter(a => a.status === 'approved').length;

            setStats({
                totalUsers: totalUsers || 0,
                pendingApps: pending.length,
                approvedMentors: approved,
            });
            setPendingApps(pending);
        } catch (error: any) {
            console.error('Error fetching admin data:', error);
            toast.error(error?.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (app: MentorApplication, action: 'approve' | 'reject') => {
        setProcessingId(app.id);
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            const nextStatus = action === 'approve' ? 'approved' : 'rejected';

            const { error: updateAppError } = await supabase
                .from('mentor_applications')
                .update({
                    status: nextStatus,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id || null,
                })
                .eq('id', app.id);

            if (updateAppError) throw updateAppError;

            const mentorStatus = action === 'approve' ? 'active' : 'unavailable';
            const { error: mentorError } = await supabase
                .from('mentors')
                .update({ status: mentorStatus })
                .eq('user_id', app.user_id);

            if (mentorError) throw mentorError;

            toast.success(action === 'approve' ? 'Application Approved' : 'Application Rejected');
            setSelectedApp(null);
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to ${action} application`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Review mentor applications and approve mentor access.</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">Admin Access</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
                    <StatCard title="Pending Applications" value={stats.pendingApps} icon={FileText} color="amber" />
                    <StatCard title="Approved Mentors" value={stats.approvedMentors} icon={CheckCircle} color="emerald" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            Pending Mentor Applications
                        </h2>
                    </div>

                    {pendingApps.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 bg-gray-50/50">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/20" />
                            <p className="font-medium">All caught up!</p>
                            <p className="text-sm">No pending mentor applications found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Applicant</th>
                                        <th className="p-4">Qualification</th>
                                        <th className="p-4">Availability</th>
                                        <th className="p-4">Submitted</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{app.first_name} {app.last_name}</div>
                                                <div className="text-gray-500 text-xs">{app.email} • {app.phone_number}</div>
                                            </td>
                                            <td className="p-4 text-gray-700">{app.qualification}</td>
                                            <td className="p-4 text-gray-700">{app.hours_daily || 'N/A'} ({app.commitment_type || 'N/A'})</td>
                                            <td className="p-4 text-gray-500">{new Date(app.submitted_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => setSelectedApp(app)} className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View</button>
                                                <button onClick={() => handleAction(app, 'reject')} disabled={processingId === app.id} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold disabled:opacity-50">Reject</button>
                                                <button onClick={() => handleAction(app, 'approve')} disabled={processingId === app.id} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50">{processingId === app.id ? '...' : 'Approve'}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedApp && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold">Application: {selectedApp.first_name} {selectedApp.last_name}</h3>
                            <button onClick={() => setSelectedApp(null)} className="text-gray-500">Close</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <Info label="Qualification" value={selectedApp.qualification} />
                            <Info label="Skills" value={(selectedApp.skills || []).join(', ')} />
                            <Info label="Interests" value={(selectedApp.interests || []).join(', ')} />
                            <Info label="Commitment" value={`${selectedApp.hours_daily || '-'} / ${selectedApp.commitment_type || '-'}`} />
                        </div>
                        <Long label="Why teach on Mentozy?" value={selectedApp.why_teach} />
                        <Long label="Teaching Differentiator" value={selectedApp.teaching_differentiator} />
                        <Long label="Scenario: Many doubts" value={selectedApp.scenario_many_doubts} />
                        <Long label="Scenario: Shy child" value={selectedApp.scenario_shy_child} />
                        <Long label="Scenario: Ed-tech confusion" value={selectedApp.scenario_edtech_confusion} />
                        <Long label="Additional info" value={selectedApp.additional_info} />
                        <div className="text-sm space-y-1">
                            <p><strong>Government ID:</strong> <a className="text-blue-600 underline" href={selectedApp.government_id_url} target="_blank" rel="noreferrer">View document</a></p>
                            <p><strong>PAN/Equivalent:</strong> <a className="text-blue-600 underline" href={selectedApp.pan_or_equivalent_url} target="_blank" rel="noreferrer">View document</a></p>
                            {selectedApp.qualification_details?.license_certification_url && (
                                <p><strong>License/Certification:</strong> <a className="text-blue-600 underline" href={selectedApp.qualification_details.license_certification_url} target="_blank" rel="noreferrer">View document</a></p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Info({ label, value }: { label: string; value?: string }) {
    return <div className="rounded-lg border border-gray-200 p-3"><p className="text-gray-500 text-xs">{label}</p><p className="text-gray-900">{value || '—'}</p></div>;
}

function Long({ label, value }: { label: string; value?: string }) {
    return <div><p className="text-xs text-gray-500 mb-1">{label}</p><p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{value || '—'}</p></div>;
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
