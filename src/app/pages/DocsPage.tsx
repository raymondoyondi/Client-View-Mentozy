import { useState, useEffect } from 'react';
import { LogIn, UserPlus, MonitorPlay, BookOpen, MessageSquare, Search, PlayCircle, ChevronRight, Menu, X } from 'lucide-react';

export function DocsPage() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Scroll spy
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['getting-started', 'students', 'mentors', 'open-library', 'troubleshooting'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Fine-tune offset based on header height
                    if (rect.top >= 0 && rect.top <= 250) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'getting-started', label: 'Getting Started' },
        { id: 'students', label: 'For Students' },
        { id: 'mentors', label: 'For Mentors' },
        { id: 'open-library', label: 'Open Library' },
        { id: 'troubleshooting', label: 'Troubleshooting' },
    ];

    const scrollToSection = (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col pt-20"> {/* PT-20 for header spacing */}

            {/* Mobile Nav Top Bar */}
            <div className="md:hidden sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <span className="font-bold text-gray-900 text-sm tracking-tight">Documentation</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-gray-500 rounded-lg hover:bg-gray-100">
                    {isMobileMenuOpen ? <X className="w-5 h-5 cursor-pointer" /> : <Menu className="w-5 h-5 cursor-pointer" />}
                </button>
            </div>

            <div className="flex flex-1 max-w-[1400px] w-full mx-auto relative relative">

                {/* Left Sidebar */}
                <aside
                    className={`fixed md:sticky top-[132px] left-0 h-[calc(100vh-132px)] w-64 border-r border-gray-100 bg-white/95 backdrop-blur-xl md:bg-transparent overflow-y-auto transition-transform duration-300 z-30 
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                >
                    <div className="p-6">
                        <div className="relative mb-8">
                            <input
                                type="text"
                                placeholder="Search docs..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow transition-colors"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={`side-${item.id}`}
                                    onClick={(e) => scrollToSection(item.id, e)}
                                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left cursor-pointer
                                    ${activeSection === item.id
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 py-10 px-6 md:px-12 lg:px-20 scroll-smooth">
                    <div className="max-w-3xl mx-auto pb-32">

                        {/* Title Intro */}
                        <div className="mb-12 border-b border-gray-100 pb-10">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Mentozy Documentation</h1>
                            <p className="text-xl text-gray-600 leading-relaxed font-normal">
                                Everything you need to know about setting up and using Mentozy, from account creation to booking sessions.
                            </p>
                        </div>

                        {/* Formatting container */}
                        <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-bold prose-h2:mt-16 prose-h2:mb-6 prose-a:text-indigo-600 hover:prose-a:underline prose-p:leading-relaxed prose-li:leading-relaxed">

                            {/* Getting Started */}
                            <section id="getting-started" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 border-b-0">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200/50">
                                        <LogIn className="w-6 h-6" />
                                    </div>
                                    Getting Started
                                </h2>
                                <p>Welcome to Mentozy! To begin your journey, you need an account. You can register either as a <strong>Student</strong> or a <strong>Mentor/Teacher</strong>. Both accounts have distinct capabilities tailored to your goals on the platform.</p>

                                <h3 className="text-xl font-bold mt-8 mb-4">How to Login & Sign Up</h3>
                                <div className="space-y-4 not-prose">
                                    <div className="flex gap-4 p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100 font-bold text-sm text-blue-600">1</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Choose your role</p>
                                            <p className="text-sm text-gray-600 mt-1">Select whether you are joining as a Student to learn, or a Mentor to teach on the Sign Up page.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100 font-bold text-sm text-blue-600">2</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Authenticate</p>
                                            <p className="text-sm text-gray-600 mt-1">Enter your credentials manually, or use <strong>Continue with Google</strong> for a swift sign-in experience.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100 font-bold text-sm text-blue-600">3</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Complete Onboarding</p>
                                            <p className="text-sm text-gray-600 mt-1">Provide your age, grade, subjects of interest, or teaching expertise to personalize your dashboard interface.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="my-16 border-gray-200" />

                            {/* For Students */}
                            <section id="students" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 border-b-0">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm border border-emerald-200/50">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    For Students
                                </h2>
                                <p>The Student Dashboard is your central hub for learning. Explore the native features designed to help you succeed:</p>

                                <div className="grid sm:grid-cols-2 gap-5 not-prose mt-6">
                                    <div className="p-6 border border-gray-200 rounded-2xl bg-white hover:border-emerald-200 hover:shadow-md transition-all">
                                        <Search className="w-6 h-6 text-emerald-500 mb-4" />
                                        <h4 className="font-bold text-gray-900 text-lg mb-2">Find Mentors</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">Browse and filter mentors by skill and rating. View their availability and book 1:1 sessions seamlessly.</p>
                                    </div>
                                    <div className="p-6 border border-gray-200 rounded-2xl bg-white hover:border-emerald-200 hover:shadow-md transition-all">
                                        <PlayCircle className="w-6 h-6 text-emerald-500 mb-4" />
                                        <h4 className="font-bold text-gray-900 text-lg mb-2">Premium Courses</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">Access structured learning tracks, watch high-quality videos, and download attached PDF materials.</p>
                                    </div>
                                </div>
                            </section>

                            <hr className="my-16 border-gray-200" />

                            {/* For Mentors */}
                            <section id="mentors" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 border-b-0">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shadow-sm border border-amber-200/50">
                                        <MonitorPlay className="w-6 h-6" />
                                    </div>
                                    For Mentors & Teachers
                                </h2>
                                <p>Mentors have access to powerful tools to create courses, manage schedules, and track earnings using an intuitive dashboard.</p>

                                <h3>Creating a Course</h3>
                                <p>Go to the <strong>Courses</strong> tab in your mentor dashboard and click <strong>Create Course</strong>. The course builder allows you to:</p>
                                <ul>
                                    <li>Upload video lectures directly.</li>
                                    <li>Attach supplementary materials (PDFs and Docs).</li>
                                    <li>Set your pricing (subject to Mentozy's commission tier).</li>
                                </ul>

                                <h3>Managing Availability</h3>
                                <p>You can toggle your public availability status from the <strong>Settings</strong> page to instantly show up as "Online" to students. Control your hourly rate from the Onboarding process or Profile settings.</p>
                            </section>

                            <hr className="my-16 border-gray-200" />

                            {/* Open Library */}
                            <section id="open-library" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 border-b-0">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shadow-sm border border-purple-200/50">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    Open Library
                                </h2>
                                <p>The Open Library is a community-driven, crowdsourced repository of free study materials.</p>
                                <ul>
                                    <li><strong>Previewing:</strong> Click the "Eye" preview button to view a resource immediately via the built-in modal and increment its global view count.</li>
                                    <li><strong>Downloading:</strong> High-quality slides, PDFs, and notes can be downloaded directly to your device via the Download button.</li>
                                    <li><strong>Liking:</strong> React to helpful resources using the Heart icon to boost their visibility across the platform.</li>
                                    <li><strong>Uploading:</strong> Anyone can share educational files by clicking "Share Notes" and providing a title, category, and uploading the file.</li>
                                </ul>
                            </section>

                            <hr className="my-16 border-gray-200" />

                            {/* Troubleshooting */}
                            <section id="troubleshooting" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 border-b-0">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-xl shadow-sm border border-red-200/50">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    Troubleshooting
                                </h2>

                                <div className="space-y-3 not-prose mt-6">
                                    <details className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer shadow-sm">
                                        <summary className="font-bold text-gray-900 flex items-center justify-between outline-none">
                                            Forgot Password?
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            Click on "Forgot Password" on the Login screen, or send a reset link via the Security tab in your Dashboard Settings if you're already logged in. The link will be sent directly to your registered email.
                                        </div>
                                    </details>

                                    <details className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer shadow-sm">
                                        <summary className="font-bold text-gray-900 flex items-center justify-between outline-none">
                                            Uploading PDF Issues
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            Files must strictly be in .pdf, .doc, or .docx format. The maximum file size limit is 30MB depending on your internet connection to the cloud storage bucket. If an upload fails, verify the file size, wait a few seconds, and try again.
                                        </div>
                                    </details>

                                    <details className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer shadow-sm">
                                        <summary className="font-bold text-gray-900 flex items-center justify-between outline-none">
                                            Can't Sign In with Google?
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            Ensure third-party cookies are enabled on your web browser. Privacy extensions or ad-blockers can sometimes block the authentication popup. Alternatively, reset your password and use the standard email login route.
                                        </div>
                                    </details>
                                </div>
                            </section>

                        </div>
                    </div>
                </main>

                {/* On Page Navigation (Right TOC) */}
                <aside className="hidden xl:block w-64 pt-10 px-6 sticky top-[132px] h-[calc(100vh-132px)] overflow-y-auto border-l border-gray-100">
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">On this page</h5>
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={`right-${item.id}`}
                                onClick={(e) => scrollToSection(item.id, e)}
                                className={`block w-full text-sm text-left px-2 py-1.5 rounded transition-colors cursor-pointer
                                    ${activeSection === item.id
                                        ? 'text-indigo-600 font-semibold border-l-2 border-indigo-600 ml-[-2px] bg-indigo-50/50'
                                        : 'text-gray-500 hover:text-gray-900 border-l-2 border-transparent ml-[-2px] hover:border-gray-300'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
