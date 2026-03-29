
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { BookOpen, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CourseModulesEditor, Module } from '../components/course/CourseModulesEditor';
import { createCourse } from '../../lib/api';
import { getSupabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function CreateCoursePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingDraft, setFetchingDraft] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [actionStatus, setActionStatus] = useState<'published' | 'draft'>('published');
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

    const [activeTab, setActiveTab] = useState<'basic' | 'curriculum' | 'pricing'>('basic');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'Intermediate',
        duration: '4 Weeks',
        price: '0'
    });

    const [modules, setModules] = useState<Module[]>([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const editId = queryParams.get('edit');

        if (editId) {
            setFetchingDraft(true);
            setEditingCourseId(parseInt(editId));

            async function fetchDraft() {
                try {
                    const supabase = getSupabase();
                    if (!supabase) return;

                    const { data, error } = await supabase
                        .from('tracks')
                        .select('*, track_modules(*)')
                        .eq('id', editId)
                        .single();

                    if (data && !error) {
                        setFormData({
                            title: data.title || '',
                            description: data.description || '',
                            level: data.level || 'Intermediate',
                            duration: data.duration_weeks ? `${data.duration_weeks} Weeks` : '4 Weeks',
                            price: '0' // Defaulting as it's not in DB schema yet
                        });

                        if (data.track_modules && data.track_modules.length > 0) {
                            const sortedModules = data.track_modules.sort((a: any, b: any) => a.module_order - b.module_order);
                            setModules(sortedModules.map((m: any, idx: number) => {
                                if (m.content) {
                                    return {
                                        ...m.content,
                                        id: m.id || m.content.id || `module-${idx}`
                                    };
                                }
                                return {
                                    id: m.id || `module-${idx}`,
                                    title: m.title,
                                    description: '',
                                    duration: m.duration || '1 Week',
                                    objectives: [],
                                    lessons: []
                                };
                            }));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching draft", err);
                } finally {
                    setFetchingDraft(false);
                }
            }

            fetchDraft();
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const success = await createCourse(
            editingCourseId,
            {
                title: formData.title,
                description: formData.description,
                level: formData.level,
                duration: formData.duration,
            },
            modules, // Pass full modules deep object!
            user?.id,
            actionStatus
        );

        setLoading(false);

        if (success) {
            toast.success(actionStatus === 'draft' ? "Course Saved as Draft!" : "Course Published Successfully!");
            // Reset state
            setFormData({ title: '', description: '', level: 'Intermediate', duration: '4 Weeks', price: '0' });
            setModules([]);

            // Redirect to mentor courses
            navigate('/mentor-courses');
        } else {
            toast.error("Failed to save course. Please try again.");
        }
    };

    if (fetchingDraft) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{editingCourseId ? 'Edit Course Draft' : 'Create New Course'}</h1>
                        <p className="text-gray-500 mt-2">Build a professional, structured learning path for your students.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                setActionStatus('draft');
                                handleSubmit(e as any);
                            }}
                            disabled={loading}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                setActionStatus('published');
                                handleSubmit(e as any);
                            }}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg flex items-center gap-2"
                        >
                            {loading && actionStatus === 'published' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <Save className="w-4 h-4" />
                            Publish Course
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Coursera-style Left Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Course Setup</h2>
                            <ul className="space-y-1">
                                <li>
                                    <button 
                                        onClick={() => setActiveTab('basic')} 
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'basic' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activeTab === 'basic' ? 'bg-amber-500' : 'bg-transparent'}`} />
                                        Basic Info
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setActiveTab('curriculum')} 
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'curriculum' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activeTab === 'curriculum' ? 'bg-amber-500' : 'bg-transparent'}`} />
                                        Curriculum
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setActiveTab('pricing')} 
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'pricing' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activeTab === 'pricing' ? 'bg-amber-500' : 'bg-transparent'}`} />
                                        Pricing & Settings
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <form id="course-form" onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[600px]">
                            
                            {/* BASIC INFO TAB */}
                            {activeTab === 'basic' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Basic Information</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Advanced System Design & Architecture"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">A clear, descriptive title helps students understand what they will learn.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <textarea
                                                rows={5}
                                                required
                                                placeholder="What will students learn in this course? Describe the target audience and core topics."
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                                                <select
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                                    value={formData.level}
                                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 4 Weeks"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('curriculum')}
                                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                        >
                                            Save & Continue to Curriculum
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CURRICULUM TAB */}
                            {activeTab === 'curriculum' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b pb-4 flex items-center gap-3">
                                            <BookOpen className="w-6 h-6 text-amber-500" />
                                            Curriculum Builder
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-3 mb-6">Start putting together your course by creating sections, lectures and practice activities.</p>
                                    </div>
                                    
                                    <CourseModulesEditor modules={modules} onChange={setModules} />

                                    <div className="pt-8 flex justify-between border-t border-gray-100">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('basic')}
                                            className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            Back to Basic Info
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('pricing')}
                                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                        >
                                            Save & Continue to Pricing
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PRICING TAB */}
                            {activeTab === 'pricing' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Pricing & Settings</h2>
                                    </div>
                                    
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Course Price ($)</h3>
                                                <p className="text-sm text-gray-600 mt-1">Set a price or make it freely available to the global community.</p>
                                            </div>
                                            <label className="flex items-center cursor-pointer gap-3 bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm">
                                                <span className="text-sm font-bold text-gray-700">Make it Free</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.price === '0'}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, price: e.target.checked ? '0' : '' })
                                                        }}
                                                    />
                                                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.price === '0' ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.price === '0' ? 'transform translate-x-4' : ''}`}></div>
                                                </div>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="e.g. 49.99"
                                            min="0"
                                            step="0.01"
                                            disabled={formData.price === '0'}
                                            className={`w-full max-w-sm px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg font-bold transition-all ${formData.price === '0' ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white shadow-inner'}`}
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-8 flex justify-between border-t border-gray-100">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('curriculum')}
                                            className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            Back to Curriculum
                                        </button>
                                        <button 
                                            type="submit"
                                            onClick={() => setActionStatus('published')}
                                            disabled={loading}
                                            className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            {loading && actionStatus === 'published' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                            <Save className="w-5 h-5" />
                                            Publish Course Now
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
