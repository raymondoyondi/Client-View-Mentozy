import { motion } from 'motion/react';
import { Cookie, CheckCircle2, Search, Settings, ShieldAlert, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookiePolicyPage() {
    return (
        <div className="pt-32 pb-32 bg-[#fafafa] min-h-screen font-sans relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-40 w-[30rem] h-[30rem] bg-orange-100/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-20 left-20 w-[25rem] h-[25rem] bg-amber-100/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6">
                        <Cookie className="w-4 h-4" />
                        Website Tracking
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Cookie <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Learn how Mentozy uses cookies and similar tracking technologies to improve your educational experience on our platform.
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
                    <div className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-orange-500 hover:prose-a:text-orange-600">
                        <p className="lead text-lg mb-10">
                            At Mentozy, we believe in being clear and open about how we collect and use data related to you. This Cookie Policy applies to any Mentozy product or service that links to this policy or incorporates it by reference.
                        </p>

                        <div className="space-y-12">
                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">1. What are cookies?</h2>
                                </div>
                                <p>Cookies are small text files that are placed on your device (computer, smartphone, or other electronic device) when you visit our website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
                                <p className="mt-2">We use cookies to improve your user experience by enabling our website to 'remember' you, either for the duration of your visit (using a 'session cookie') or for repeat visits (using a 'persistent cookie').</p>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">2. How we use cookies</h2>
                                </div>
                                <p>We use different types of cookies for various purposes. Here are the categories of cookies we use:</p>
                                <ul className="space-y-4 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <strong className="block text-gray-900 mb-1">Essential Cookies</strong>
                                            <span className="text-sm">These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as secure login areas and maintaining your session state.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <strong className="block text-gray-900 mb-1">Functional & Preference Cookies</strong>
                                            <span className="text-sm">These allow us to remember choices you make when you use our website, such as remembering your login details or language preference. The purpose of these cookies is to provide you with a more personal experience.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-1">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <strong className="block text-gray-900 mb-1">Analytics & Performance Cookies</strong>
                                            <span className="text-sm">These help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the way our website works.</span>
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl m-0">3. Your Cookie Choices</h2>
                                </div>
                                <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser or from our cookie banner.</p>
                                <ul className="space-y-2 mt-4 list-none pl-0">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span><strong>Browser Controls:</strong> You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas may be restricted.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span><strong>Opt-out Tools:</strong> Many advertising networks offer you a way to opt out of targeted advertising.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <h2 className="text-2xl mb-4">4. Updates to this policy</h2>
                                <p>
                                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                                </p>
                            </section>

                            <hr className="border-gray-100 my-8" />

                            <div className="bg-orange-50/50 rounded-2xl p-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                                <p className="mb-6 text-gray-600">If you have any questions about our use of cookies or other technologies, please email us.</p>
                                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
