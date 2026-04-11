import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function RazorpayPaymentButton({ buttonId }: { buttonId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form || injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;
    form.appendChild(script);

    return () => {
      injected.current = false;
      if (form.contains(script)) form.removeChild(script);
    };
  }, [buttonId]);

  return <form ref={formRef} className="w-full" />;
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
        <div className={`grid md:grid-cols-2 ${activePlans.length === 3 ? 'lg:grid-cols-3 max-w-6xl' : 'lg:grid-cols-4 max-w-7xl'} gap-8 mx-auto`}>
          {activePlans.map((plan) => {
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 flex flex-col
                  ${plan.popular ? 'border-amber-500 shadow-lg scale-105 z-10' : 'border-gray-200 shadow-sm'}
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-2 text-${plan.color === 'gray' ? 'gray-900' : plan.color + '-600'}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.amountINR ? (
                    <p className="text-xs text-gray-400 mt-1">≈ ₹{plan.amountINR.toLocaleString('en-IN')} INR</p>
                  ) : null}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={`mt-0.5 w-5 h-5 rounded-full bg-${plan.color === 'gray' ? 'green' : plan.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <Check className={`w-3 h-3 text-${plan.color === 'gray' ? 'green' : plan.color}-600`} />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-gray-300" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.razorpayButtonId ? (
                  <RazorpayPaymentButton buttonId={plan.razorpayButtonId} />
                ) : (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all
                      ${plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25'
                        : plan.color === 'rose'
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'}
                    `}
                  >
                    {plan.cta}
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
