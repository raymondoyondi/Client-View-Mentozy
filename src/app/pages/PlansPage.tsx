import { useState, useEffect, useRef } from 'react';
import { Check, X, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function RazorpayPaymentButton({ buttonId, planName, isPopular, color }: { buttonId: string; planName: string; isPopular?: boolean; color: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const form = formRef.current;
    if (!form || injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => setIsLoading(false), 500);
    };
    
    form.appendChild(script);

    return () => {
      injected.current = false;
      if (form.contains(script)) form.removeChild(script);
    };
  }, [buttonId]);

  // Determine button colors based on plan
  const getButtonStyles = () => {
    if (isPopular) {
      return 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25';
    }
    if (color === 'indigo') {
      return 'from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 shadow-indigo-500/25';
    }
    return 'from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black shadow-gray-500/15';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Custom styled overlay button */}
      <div className={`relative w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r ${getButtonStyles()} 
        shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer
        flex items-center justify-center gap-3 group overflow-hidden`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {isPopular ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            <span className="relative">Subscribe to {planName}</span>
          </>
        )}
      </div>
      
      {/* Hidden Razorpay form - positioned to capture clicks */}
      <form 
        ref={formRef} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&_.razorpay-payment-button]:!w-full [&_.razorpay-payment-button]:!h-full [&_.razorpay-payment-button]:!opacity-0"
      />
    </div>
  );
}

const studentPlans = [
  {
    name: 'Starter',
    price: '$0',
    amountINR: 0,
    period: '/month',
    description: 'Everything you need to join the global tech conversation.',
    features: [
      { name: 'Access to Mentozy Open Library', included: true },
      { name: 'Join Public Community Forums', included: true },
      { name: 'View Elite Mentor Profiles', included: true },
      { name: 'Book 1-on-1 Sessions (Standard Rate)', included: true },
      { name: 'General Hackathon Updates', included: true },
    ],
    cta: 'Get Started',
    razorpayButtonId: null,
    popular: false,
    color: 'gray'
  },
  {
    name: 'Premium',
    price: '$30',
    amountINR: 2499,
    period: '/month',
    description: 'Accelerate your growth with priority access and exclusive feedback.',
    features: [
      { name: 'Priority Booking (48-Hour Head Start on Mentor Calendars)', included: true },
      { name: '10% Off All 1-on-1 Mentor Sessions', included: true },
      { name: '1x Monthly Asynchronous Resume or Code Review', included: true },
      { name: 'Access to 1 Live Group Masterclass per Month', included: true },
    ],
    cta: 'Subscribe Now',
    razorpayButtonId: 'pl_Sc2vq7uLAFgdgR',
    popular: true,
    color: 'amber'
  },
  {
    name: 'Ultra',
    price: '$60',
    amountINR: 4999,
    period: '/month',
    description: 'The VIP pipeline. Maximum access to top-tier engineers and referrals.',
    features: [
      { name: 'Exclusive Access to the FAANG Opportunity & Referral Board', included: true },
      { name: 'First-In-Line Booking (72-Hour Head Start on Mentor Calendars)', included: true },
      { name: '20% Off All 1-on-1 Mentor Sessions', included: true },
      { name: 'Unlimited Live Group Masterclass Access', included: true },
      { name: 'Fast-Track Priority for Mentozy Hackathons', included: true },
    ],
    cta: 'Go Ultra',
    razorpayButtonId: 'pl_Sc31AvlmcIzvnD',
    popular: false,
    color: 'indigo'
  }
];

const teacherPlans = [
  {
    name: 'Elite Individual',
    price: '$0',
    amountINR: 0,
    period: '/month',
    description: 'Zero upfront cost. Perfect for elite solo mentors and industry executives.',
    features: [
      { name: '1 Individual Mentor Dashboard', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Global Calendar Syncing', included: true },
      { name: 'Automated Payment Processing', included: true },
      { name: 'Standard Search Visibility', included: true },
    ],
    cta: 'Get Started',
    razorpayButtonId: null,
    popular: false,
    color: 'gray'
  },
  {
    name: 'Premium Squad',
    price: '$50',
    amountINR: 4199,
    period: '/month',
    description: 'Manage your entire coaching team under one unified platform.',
    features: [
      { name: '5 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Centralized Agency Payouts', included: true },
      { name: 'Team Scheduling & unified Calendar', included: true },
      { name: 'Basic Revenue Analytics', included: true },
    ],
    cta: 'Subscribe Now',
    razorpayButtonId: 'pl_Sc337IXZpGrRXs',
    popular: true,
    color: 'amber'
  },
  {
    name: 'Ultra Agency',
    price: '$95',
    amountINR: 7999,
    period: '/month',
    description: 'Scale your academy with priority student visibility and advanced tools.',
    features: [
      { name: '8 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Priority Algorithmic Placement (Rank higher in Mentozy student search)', included: true },
      { name: 'Advanced Agency Revenue Analytics', included: true },
      { name: 'Everything in Premium Squad', included: true },
    ],
    cta: 'Go Ultra',
    razorpayButtonId: 'pl_Sc34BV76MHTPsg',
    popular: false,
    color: 'indigo'
  },
  {
    name: 'Enterprise',
    price: '$150',
    amountINR: null,
    period: '/month',
    description: 'Maximum infrastructure for large educational institutions and bootcamps.',
    features: [
      { name: '12 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Dedicated Mentozy Account Manager', included: true },
      { name: 'Custom Agency Onboarding Support', included: true },
      { name: 'Everything in Ultra Agency', included: true },
    ],
    cta: 'Contact Sales',
    razorpayButtonId: null,
    popular: false,
    color: 'rose'
  }
];

type Plan = (typeof studentPlans)[number] | (typeof teacherPlans)[number];

export function PlansPage() {
  const [planType, setPlanType] = useState<'student' | 'teacher'>('student');
  const navigate = useNavigate();
  const activePlans = planType === 'student' ? studentPlans : teacherPlans;

  const handlePlanClick = (plan: Plan) => {
    if (plan.cta === 'Contact Sales') {
      navigate('/contact');
      return;
    }
    if (plan.amountINR === 0) {
      navigate('/signup');
      return;
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple Plans for <span className="text-amber-600">Big Dreams</span>
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your learning journey. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Toggle Student / Teacher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-full border border-gray-200 inline-flex shadow-sm">
            <button
              onClick={() => setPlanType('student')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${planType === 'student'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:text-amber-600'
                }`}
            >
              For Students
            </button>
            <button
              onClick={() => setPlanType('teacher')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${planType === 'teacher'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:text-amber-600'
                }`}
            >
              For Teachers
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={`grid md:grid-cols-2 ${activePlans.length === 3 ? 'lg:grid-cols-3 max-w-6xl' : 'lg:grid-cols-4 max-w-7xl'} gap-6 mx-auto`}>
          {activePlans.map((plan) => {
            // Get color classes based on plan
            const getColorClasses = () => {
              if (plan.color === 'amber') return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', check: 'bg-amber-100 text-amber-600' };
              if (plan.color === 'indigo') return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', check: 'bg-indigo-100 text-indigo-600' };
              if (plan.color === 'rose') return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', check: 'bg-rose-100 text-rose-600' };
              return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', check: 'bg-emerald-100 text-emerald-600' };
            };
            const colors = getColorClasses();

            return (
              <div
                key={plan.name}
                className={`group relative bg-white rounded-3xl p-8 border-2 hover:shadow-2xl transition-all duration-500 flex flex-col
                  ${plan.popular 
                    ? 'border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02] z-10 ring-1 ring-amber-400/50' 
                    : 'border-gray-100 shadow-lg hover:border-gray-200 hover:-translate-y-1'}
                `}
              >
                {/* Background gradient for popular */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-orange-50/30 rounded-3xl pointer-events-none" />
                )}

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-5 py-2 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                <div className="relative mb-8">
                  {/* Plan icon */}
                  <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {plan.color === 'gray' && <span className="text-xl font-bold">S</span>}
                    {plan.color === 'amber' && <Sparkles className="w-6 h-6" />}
                    {plan.color === 'indigo' && <CreditCard className="w-6 h-6" />}
                    {plan.color === 'rose' && <span className="text-xl font-bold">E</span>}
                  </div>

                  <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{plan.description}</p>
                  
                  <div className="mt-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                      <span className="text-gray-400 font-medium">{plan.period}</span>
                    </div>
                    {plan.amountINR ? (
                      <p className="text-sm text-gray-400 mt-2 font-medium">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                          ₹{plan.amountINR.toLocaleString('en-IN')} INR
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      {feature.included ? (
                        <div className={`mt-0.5 w-6 h-6 rounded-full ${colors.check} flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <X className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      )}
                      <span className={`text-sm leading-relaxed ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.razorpayButtonId ? (
                  <RazorpayPaymentButton 
                    buttonId={plan.razorpayButtonId} 
                    planName={plan.name}
                    isPopular={plan.popular}
                    color={plan.color}
                  />
                ) : (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`relative w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden
                      ${plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-0.5'
                        : plan.color === 'rose'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-xl hover:shadow-rose-500/25 hover:-translate-y-0.5'
                        : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:shadow-xl hover:shadow-gray-500/15 hover:-translate-y-0.5'}
                    `}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative">{plan.cta}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust note */}
        <div className="mt-20 text-center space-y-2">
          <p className="text-gray-400 text-sm">🔒 Secure payments powered by Razorpay</p>
          <p className="text-gray-500 text-sm">
            *Unlimited plans are subject to reasonable use policy. Need a custom team plan?{' '}
            <Link to="/contact" className="text-amber-600 font-bold hover:underline">Contact us</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
