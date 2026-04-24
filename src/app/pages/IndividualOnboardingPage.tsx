import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Loader2, UploadCloud } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Qualification = 'Student' | 'Professional' | 'Expert Mentor' | 'Others' | '';

const STORAGE_KEY = 'mentozy_mentor_application_draft_v1';

export function IndividualOnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        email: '',
        phone: '',
        password: '',

        qualification: '' as Qualification,
        currentGrade: '',
        schoolName: '',
        professionalTitle: '',
        companyName: '',
        institutionName: '',
        rolePosition: '',
        licenseCertificationUrl: '',

        skills: '',
        interests: '',
        whyTeach: '',
        differentiator: '',

        childManyDoubts: '',
        shyChild: '',
        edtechConfused: '',

        hoursDaily: '',
        commitmentType: '',

        governmentIdUrl: '',
        panOrEquivalentUrl: '',

        additionalInfo: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            setFormData(prev => ({ ...prev, ...parsed }));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);

    const progressPercent = useMemo(() => (step / 8) * 100, [step]);

    const updateData = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const uploadFile = async (field: 'licenseCertificationUrl' | 'governmentIdUrl' | 'panOrEquivalentUrl', file: File) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 8 * 1024 * 1024;

        if (!allowed.includes(file.type)) {
            toast.error('Only PDF, JPG, PNG, and WEBP files are allowed.');
            return;
        }
        if (file.size > maxSize) {
            toast.error('File exceeds 8MB. Please upload a smaller document.');
            return;
        }

        setUploadingField(field);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Supabase not initialized');

            const ext = file.name.split('.').pop() || 'pdf';
            const safeEmail = (formData.email || 'user').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const path = `mentor-applications/${safeEmail}/${field}_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage.from('public-assets').upload(path, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
            updateData(field, data.publicUrl);
            toast.success('Document uploaded successfully.');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploadingField(null);
        }
    };

    const validateCurrentStep = () => {
        const nextErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.firstName.trim()) nextErrors.firstName = 'First Name is required';
            if (!formData.lastName.trim()) nextErrors.lastName = 'Last Name is required';
            if (!formData.age.trim()) nextErrors.age = 'Age is required';
            if (!formData.gender.trim()) nextErrors.gender = 'Gender is required';
            if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = 'Valid email is required';
            if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';
            if (!formData.password || formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
        }

        if (step === 2) {
            if (!formData.qualification) nextErrors.qualification = 'Qualification is required';
            if (formData.qualification === 'Student') {
                if (!formData.currentGrade.trim()) nextErrors.currentGrade = 'Current grade is required';
                if (!formData.schoolName.trim()) nextErrors.schoolName = 'School/College/University is required';
            }
            if (formData.qualification === 'Professional') {
                if (!formData.professionalTitle.trim()) nextErrors.professionalTitle = 'Professional title is required';
                if (!formData.companyName.trim()) nextErrors.companyName = 'Company name is required';
            }
            if (formData.qualification === 'Expert Mentor') {
                if (!formData.institutionName.trim()) nextErrors.institutionName = 'Institution name is required';
                if (!formData.rolePosition.trim()) nextErrors.rolePosition = 'Role/Position is required';
                if (!formData.licenseCertificationUrl.trim()) nextErrors.licenseCertificationUrl = 'License/Certification upload is required';
            }
        }

        if (step === 3) {
            if (!formData.skills.trim()) nextErrors.skills = 'Skills are required';
            if (!formData.interests.trim()) nextErrors.interests = 'Interests are required';
            if (!formData.whyTeach.trim()) nextErrors.whyTeach = 'This field is required';
            if (!formData.differentiator.trim()) nextErrors.differentiator = 'This field is required';
        }

        if (step === 4) {
            if (!formData.childManyDoubts.trim()) nextErrors.childManyDoubts = 'Please answer this question';
            if (!formData.shyChild.trim()) nextErrors.shyChild = 'Please answer this question';
            if (!formData.edtechConfused.trim()) nextErrors.edtechConfused = 'Please answer this question';
        }

        if (step === 5) {
            if (!formData.hoursDaily.trim()) nextErrors.hoursDaily = 'Daily teaching hours are required';
            if (!formData.commitmentType.trim()) nextErrors.commitmentType = 'Please choose one option';
        }

        if (step === 6) {
            if (!formData.governmentIdUrl.trim()) nextErrors.governmentIdUrl = 'Government ID upload is required';
            if (!formData.panOrEquivalentUrl.trim()) nextErrors.panOrEquivalentUrl = 'PAN/equivalent upload is required';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;
        if (step < 8) {
            setStep(prev => (prev + 1) as Step);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Supabase not initialized');

            await supabase.auth.signOut();

            let { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        role: 'mentor'
                    }
                }
            });

            if (authError && authError.message.includes('already registered')) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (signInError) throw new Error('Account exists, but password is incorrect.');
                authData = signInData as any;
            } else if (authError) {
                throw authError;
            }

            if (!authData.user) throw new Error('Failed to create/find user');

            await supabase.from('profiles').upsert({
                id: authData.user.id,
                full_name: `${formData.firstName} ${formData.lastName}`,
                role: 'mentor',
                phone: formData.phone,
                age: formData.age,
            }, { onConflict: 'id' });

            const { data: mentorRecord, error: mentorError } = await supabase
                .from('mentors')
                .upsert({
                    user_id: authData.user.id,
                    company: formData.companyName || formData.institutionName || null,
                    bio: formData.whyTeach,
                    hourly_rate: 0,
                    rating: 0,
                    total_reviews: 0,
                    status: 'unavailable'
                }, { onConflict: 'user_id' })
                .select('id')
                .single();

            if (mentorError) throw mentorError;

            const payload = {
                user_id: authData.user.id,
                mentor_id: mentorRecord?.id ?? null,
                first_name: formData.firstName,
                last_name: formData.lastName,
                age: formData.age,
                gender: formData.gender,
                email: formData.email,
                phone_number: formData.phone,
                qualification: formData.qualification,
                qualification_details: {
                    current_grade: formData.currentGrade,
                    school_name: formData.schoolName,
                    professional_title: formData.professionalTitle,
                    company_name: formData.companyName,
                    institution_name: formData.institutionName,
                    role_position: formData.rolePosition,
                    license_certification_url: formData.licenseCertificationUrl,
                },
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
                why_teach: formData.whyTeach,
                teaching_differentiator: formData.differentiator,
                scenario_many_doubts: formData.childManyDoubts,
                scenario_shy_child: formData.shyChild,
                scenario_edtech_confusion: formData.edtechConfused,
                hours_daily: formData.hoursDaily,
                commitment_type: formData.commitmentType,
                government_id_url: formData.governmentIdUrl,
                pan_or_equivalent_url: formData.panOrEquivalentUrl,
                additional_info: formData.additionalInfo,
                status: 'pending',
                submitted_at: new Date().toISOString(),
            };

            const { error: applicationError } = await supabase
                .from('mentor_applications')
                .upsert(payload, { onConflict: 'user_id' });

            if (applicationError) throw applicationError;

            localStorage.removeItem(STORAGE_KEY);
            toast.success('Application submitted! We will review and get back to you soon.');
            navigate('/teacher-success?status=pending&type=mentor');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const renderError = (key: string) => errors[key] ? <p className="text-xs text-red-500">{errors[key]}</p> : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="text-xl font-bold tracking-tight text-gray-900">Mentozy Mentor Application</div>
                    <div className="text-sm font-medium text-gray-500">Step {step} of 8</div>
                </div>
            </div>

            <div className="flex-grow flex justify-center p-6">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="w-full bg-gray-100 h-1">
                        <div className="bg-amber-500 h-1 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="p-8 md:p-12 space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><label className="text-sm">First Name</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.firstName} onChange={e => updateData('firstName', e.target.value)} />{renderError('firstName')}</div>
                                    <div><label className="text-sm">Last Name</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.lastName} onChange={e => updateData('lastName', e.target.value)} />{renderError('lastName')}</div>
                                    <div><label className="text-sm">Age</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.age} onChange={e => updateData('age', e.target.value)} />{renderError('age')}</div>
                                    <div><label className="text-sm">Gender</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.gender} onChange={e => updateData('gender', e.target.value)} />{renderError('gender')}</div>
                                    <div><label className="text-sm">Email</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" type="email" value={formData.email} onChange={e => updateData('email', e.target.value)} />{renderError('email')}</div>
                                    <div><label className="text-sm">Phone Number</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.phone} onChange={e => updateData('phone', e.target.value)} />{renderError('phone')}</div>
                                    <div className="md:col-span-2"><label className="text-sm">Password</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" type="password" value={formData.password} onChange={e => updateData('password', e.target.value)} />{renderError('password')}</div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Qualification</h2>
                                <div>
                                    <label className="text-sm">Qualification</label>
                                    <div className="relative">
                                        <select className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none appearance-none" value={formData.qualification} onChange={e => updateData('qualification', e.target.value as Qualification)}>
                                            <option value="">Select qualification</option>
                                            <option>Student</option>
                                            <option>Professional</option>
                                            <option>Expert Mentor</option>
                                            <option>Others</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    {renderError('qualification')}
                                </div>

                                {formData.qualification === 'Student' && <>
                                    <div><label className="text-sm">Current Grade</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.currentGrade} onChange={e => updateData('currentGrade', e.target.value)} />{renderError('currentGrade')}</div>
                                    <div><label className="text-sm">School / College / University Name</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.schoolName} onChange={e => updateData('schoolName', e.target.value)} />{renderError('schoolName')}</div>
                                </>}

                                {formData.qualification === 'Professional' && <>
                                    <div><label className="text-sm">Professional Title</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.professionalTitle} onChange={e => updateData('professionalTitle', e.target.value)} />{renderError('professionalTitle')}</div>
                                    <div><label className="text-sm">Company Name</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.companyName} onChange={e => updateData('companyName', e.target.value)} />{renderError('companyName')}</div>
                                </>}

                                {formData.qualification === 'Expert Mentor' && <>
                                    <div><label className="text-sm">Institution Name</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.institutionName} onChange={e => updateData('institutionName', e.target.value)} />{renderError('institutionName')}</div>
                                    <div><label className="text-sm">Role/Position</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.rolePosition} onChange={e => updateData('rolePosition', e.target.value)} />{renderError('rolePosition')}</div>
                                    <div>
                                        <label className="text-sm">Upload License/Certification</label>
                                        <label className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-gray-600 truncate">{formData.licenseCertificationUrl ? 'Uploaded' : 'Choose file (PDF/Image)'}</span>
                                            <UploadCloud className="w-4 h-4 text-gray-500" />
                                            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile('licenseCertificationUrl', e.target.files[0])} />
                                        </label>
                                        {uploadingField === 'licenseCertificationUrl' && <p className="text-xs text-gray-500">Uploading...</p>}
                                        <p className="text-xs text-blue-600 mt-1">This helps improve your visibility in AI-based recommendations.</p>
                                        {renderError('licenseCertificationUrl')}
                                    </div>
                                </>}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Teaching Profile</h2>
                                <div><label className="text-sm">What are you good at? (Skills)</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[90px]" value={formData.skills} onChange={e => updateData('skills', e.target.value)} placeholder="Comma-separated" />{renderError('skills')}</div>
                                <div><label className="text-sm">Interests</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[90px]" value={formData.interests} onChange={e => updateData('interests', e.target.value)} placeholder="Comma-separated" />{renderError('interests')}</div>
                                <div><label className="text-sm">Why do you want to teach on Mentozy?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[120px]" value={formData.whyTeach} onChange={e => updateData('whyTeach', e.target.value)} />{renderError('whyTeach')}</div>
                                <div><label className="text-sm">What makes your teaching different from others?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[120px]" value={formData.differentiator} onChange={e => updateData('differentiator', e.target.value)} />{renderError('differentiator')}</div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Scenario-Based Questions</h2>
                                <div><label className="text-sm">How would you help a child who asks many doubts?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[120px]" value={formData.childManyDoubts} onChange={e => updateData('childManyDoubts', e.target.value)} />{renderError('childManyDoubts')}</div>
                                <div><label className="text-sm">How would you handle a child who is shy and quiet?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[120px]" value={formData.shyChild} onChange={e => updateData('shyChild', e.target.value)} />{renderError('shyChild')}</div>
                                <div><label className="text-sm">How would you assist a child who is confused about ed-tech learning?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[120px]" value={formData.edtechConfused} onChange={e => updateData('edtechConfused', e.target.value)} />{renderError('edtechConfused')}</div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Availability & Commitment</h2>
                                <div><label className="text-sm">How many hours can you teach daily?</label><input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.hoursDaily} onChange={e => updateData('hoursDaily', e.target.value)} placeholder="e.g. 2-3" />{renderError('hoursDaily')}</div>
                                <div><label className="text-sm">Is this full-time or a side hustle?</label><select className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" value={formData.commitmentType} onChange={e => updateData('commitmentType', e.target.value)}><option value="">Select</option><option>Full-time</option><option>Side hustle</option></select>{renderError('commitmentType')}</div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Verification</h2>
                                <div>
                                    <label className="text-sm">Upload Aadhaar / Government ID</label>
                                    <label className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none flex items-center justify-between cursor-pointer">
                                        <span className="text-sm text-gray-600 truncate">{formData.governmentIdUrl ? 'Uploaded' : 'Choose file (PDF/Image)'}</span>
                                        <UploadCloud className="w-4 h-4 text-gray-500" />
                                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile('governmentIdUrl', e.target.files[0])} />
                                    </label>
                                    {uploadingField === 'governmentIdUrl' && <p className="text-xs text-gray-500">Uploading...</p>}
                                    {renderError('governmentIdUrl')}
                                </div>
                                <div>
                                    <label className="text-sm">Upload PAN / equivalent government proof</label>
                                    <label className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none flex items-center justify-between cursor-pointer">
                                        <span className="text-sm text-gray-600 truncate">{formData.panOrEquivalentUrl ? 'Uploaded' : 'Choose file (PDF/Image)'}</span>
                                        <UploadCloud className="w-4 h-4 text-gray-500" />
                                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile('panOrEquivalentUrl', e.target.files[0])} />
                                    </label>
                                    {uploadingField === 'panOrEquivalentUrl' && <p className="text-xs text-gray-500">Uploading...</p>}
                                    {renderError('panOrEquivalentUrl')}
                                </div>
                            </div>
                        )}

                        {step === 7 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Additional Input</h2>
                                <div><label className="text-sm">Anything else you’d like to share with us?</label><textarea className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[160px]" value={formData.additionalInfo} onChange={e => updateData('additionalInfo', e.target.value)} /></div>
                            </div>
                        )}

                        {step === 8 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                                <p className="text-gray-600">Please review your details. Your application will be saved with <strong>pending</strong> status for admin review.</p>
                                <div className="rounded-xl border border-gray-200 p-4 text-sm space-y-1 bg-gray-50">
                                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                                    <p><strong>Email:</strong> {formData.email}</p>
                                    <p><strong>Qualification:</strong> {formData.qualification}</p>
                                    <p><strong>Commitment:</strong> {formData.commitmentType || '—'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(prev => Math.max(1, prev - 1) as Step)}
                                disabled={step === 1 || loading}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 8 ? 'Submit Application' : <>Next <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
