import { motion } from 'motion/react';
import { FileSignature, CheckCircle2, AlertCircle, Scale, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfServicePage() {
    return (
        <div className="pt-32 pb-32 bg-[#fafafa] min-h-screen font-sans relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-[30rem] h-[30rem] bg-indigo-100/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-60 left-20 w-[25rem] h-[25rem] bg-amber-100/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-6">
                        <Scale className="w-4 h-4" />
                        Legal Agreement
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Service</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        These Terms govern your use of the Mentozy platform. By accessing our services, you agree to comply with the rules outlined below.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">Effective Date: March 2026</p>
                </motion.div>

                {/* Content Sections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100/50"
                >
                    <div className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-indigo-500 hover:prose-a:text-indigo-600">
                        <p className="lead text-lg mb-10">
                            Welcome to Mentozy. By registering on our platform as a student, mentor, or institution, you agree to be bound by these legally binding terms. Please read them carefully.
                        </p>

                        <div className="space-y-12">
                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">1. Account Responsibilities</h2>
                                </div>
                                <p>When creating an account on Mentozy, you agree to:</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>Provide accurate, truthful, and up-to-date information for your profile.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>Maintain the confidentiality of your login credentials and immediately notify us of any unauthorized use.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>Not impersonate another person, institution, or mentor.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <FileSignature className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">2. Code of Conduct</h2>
                                </div>
                                <p>To maintain a safe and productive educational environment, all users must adhere to strict behavioral guidelines:</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Respectful Interaction:</strong> Harassment, hate speech, bullying, or discrimination against any user will not be tolerated.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Academic Integrity:</strong> Sharing illegal, copyrighted, or plagiarized materials via the Open Library or direct transfer is strictly forbidden.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Appropriate Use:</strong> Profiles must not be used to spam, advertise external unapproved services, or conduct illegal activities.</span>
                                    </li>
                                </ul>
                                <p className="mt-4 text-sm text-gray-500 italic">Failure to comply with these guidelines may result in immediate account suspension or termination.</p>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">3. Payments, Fees, & Subscriptions</h2>
                                </div>
                                <p>Certain features on Mentozy involve payments or commission structures:</p>
                                <div className="bg-gray-50 rounded-2xl p-6 mt-4 border border-gray-100">
                                    <ul className="space-y-4 m-0">
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            <span><strong>For Students:</strong> All payments for private 1:1 sessions or premium courses are finalized via our secure processors. Refunds are handled on a case-by-case basis according to our Refund Policy.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            <span><strong>For Mentors:</strong> Free-tier mentors are subject to an 8% commission fee on paid sessions/courses. Premium and Ultra-tier organizations are subject to their respective subscription monthly costs and reduced commission agreements (4% and 2% respectively).</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">4. Limitation of Liability</h2>
                                </div>
                                <p>
                                    Mentozy acts solely as a technological bridge between students and educational resources/mentors. We do not guarantee specific academic outcomes, job placements, or the absolute accuracy of materials provided by third-party mentors on the Open Library or in courses.
                                </p>
                                <p className="mt-2">
                                    We provide the service "as is" and without any warranty or condition, express, implied, or statutory.
                                </p>
                            </section>

                            {/* Section 5 */}
                            <section>
                                <h2 className="text-2xl mb-4">5. Termination</h2>
                                <p>
                                    You may terminate your account at any time. We also reserve the right to suspend or terminate your account at our sole discretion, without notice or liability, for any reason, including if you breach these Terms of Service.
                                </p>
                            </section>

                            <hr className="border-gray-100 my-8" />

                            <div className="bg-indigo-50/50 rounded-2xl p-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Need Further Clarification?</h3>
                                <p className="mb-6 text-gray-600">If you have any questions regarding these terms before signing up, contact our support team.</p>
                                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                    Contact Legal Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
