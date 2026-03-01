import { motion } from 'motion/react';
import { Shield, Lock, Eye, CheckCircle2, FileText, Globe, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
    return (
        <div className="pt-32 pb-32 bg-[#fafafa] min-h-screen font-sans relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-[30rem] h-[30rem] bg-amber-100/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-60 right-20 w-[25rem] h-[25rem] bg-emerald-100/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        Trust & Transparency
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        At Mentozy, we prioritize your privacy. This policy outlines how we collect, use, and protect your personal information while you use our educational platform.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">Last Updated: March 2026</p>
                </motion.div>

                {/* Content Sections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100/50"
                >
                    <div className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-amber-500 hover:prose-a:text-amber-600">
                        <p className="lead text-lg mb-10">
                            Welcome to Mentozy. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how your data is collected, used, and safeguarded when you access our platform as a student, mentor, or educational institution.
                        </p>

                        <div className="space-y-12">
                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">1. Information We Collect</h2>
                                </div>
                                <p>We collect information to provide better educational experiences and seamless platform operations. The types of data we gather include:</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Personal Identification Information:</strong> Name, email address, phone number, and account credentials when you register.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Profile Information:</strong> Educational background, career interests, profile pictures, and bios provided by mentors and students.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Usage Data:</strong> Information on how you interact with our courses, library resources, mentorship sessions, and platform features.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Payment Data:</strong> Billing details and transaction history used solely for premium subscriptions or session bookings, handled securely by third-party processors.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">2. How We Use Your Information</h2>
                                </div>
                                <p>Mentozy uses your data ethically and intentionally to improve your learning journey:</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>To personalize course recommendations and mentorship matches.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>To facilitate scheduling, communication, and notifications between mentors and students.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>To process payments and manage your subscriptions or earnings.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>To monitor and maintain platform security, preventing fraudulent activity or abuse.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">3. Data Sharing & Disclosure</h2>
                                </div>
                                <p>We do not sell your personal data. We only share information in the following circumstances:</p>
                                <div className="bg-gray-50 rounded-2xl p-6 mt-4 border border-gray-100">
                                    <ul className="space-y-4 m-0">
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                            <span><strong>With Mentors/Students:</strong> Limited profile information is visible to facilitate the learning connection.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                            <span><strong>Service Providers:</strong> We use trusted third-party services (like Supabase for database management and secure payment gateways) that adhere to strict privacy standards.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                            <span><strong>Legal Requirements:</strong> If required by law, regulation, or legal process to protect the rights, property, or safety of Mentozy, our users, or the public.</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">4. Your Data Rights & Choices</h2>
                                </div>
                                <p>You have full control over your personal data. At any time, you can:</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Access, update, or correct your profile information via the Dashboard.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Request the deletion of your account and associated personal data.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <span>Opt-out of non-essential email communications or promotional updates.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">5. Updates to This Policy</h2>
                                </div>
                                <p>
                                    We may update this Privacy Policy occasionally to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
                                </p>
                            </section>

                            <hr className="border-gray-100 my-8" />

                            <div className="bg-amber-50/50 rounded-2xl p-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Questions About Your Privacy?</h3>
                                <p className="mb-6 text-gray-600">If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our privacy team.</p>
                                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
