import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bell, Loader2, Megaphone, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { getSupabase } from '../../lib/supabase';

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

export function OrgAnnouncementsPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const isOrgAdmin = Boolean(user?.user_metadata?.is_org) && mode !== 'organization';

    const targetOrgId = useMemo(() => {
        if (mode === 'organization' && activeOrganization?.id) return activeOrganization.id;
        if (isOrgAdmin && user?.id) return user.id;
        return null;
    }, [activeOrganization?.id, isOrgAdmin, mode, user?.id]);

    const loadAnnouncements = async () => {
        if (!targetOrgId) {
            setAnnouncements([]);
            setIsLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('org_announcements')
                .select('id, title, content, created_at')
                .eq('org_id', targetOrgId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error loading announcements:', error);
            toast.error('Failed to load announcements.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, [targetOrgId]);

    const handleSubmitAnnouncement = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!targetOrgId) return;

        if (!title.trim() || !content.trim()) {
            toast.error('Please enter both title and announcement message.');
            return;
        }

        const supabase = getSupabase();
        if (!supabase) return;

        setIsSaving(true);
        try {
            const { error } = await supabase.from('org_announcements').insert({
                org_id: targetOrgId,
                title: title.trim(),
                content: content.trim(),
            });

            if (error) throw error;

            toast.success('Announcement shared with students successfully.');
            setTitle('');
            setContent('');
            await loadAnnouncements();
        } catch (error) {
            console.error('Error sharing announcement:', error);
            toast.error('Failed to share announcement. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                        <p className="text-gray-500">
                            {isOrgAdmin
                                ? 'Create and publish updates for your students.'
                                : 'Latest updates from your organization.'}
                        </p>
                    </div>
                    <button
                        onClick={loadAnnouncements}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {isOrgAdmin && (
                    <form onSubmit={handleSubmitAnnouncement} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                            <Megaphone className="w-5 h-5 text-blue-600" />
                            Share Announcement
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mock test schedule for this week"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Message</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="Write the announcement for your students..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Publish Announcement
                        </button>
                    </form>
                )}

                <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h2 className="font-bold text-gray-900">Recent Announcements</h2>
                    </div>

                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No announcements yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {announcements.map((announcement) => (
                                <article key={announcement.id} className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                                        <span className="text-xs font-medium text-gray-500">
                                            {new Date(announcement.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}

export default OrgAnnouncementsPage;
