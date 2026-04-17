import { X, Clock, Video, FileText } from 'lucide-react';
import { Booking } from '../../../lib/api';

interface StudentBookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export function StudentBookingDetailsModal({ isOpen, onClose, booking }: StudentBookingDetailsModalProps) {
    if (!isOpen || !booking) return null;

    const mentorName = booking.mentors?.name || 'Mentor';
    const scheduledDate = new Date(booking.scheduled_at);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    <h2 className="text-xl font-bold mb-1">Session Details</h2>
                    <p className="text-amber-100 text-sm">with <span className="text-white font-semibold">{mentorName}</span></p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Time & Date */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center font-bold text-gray-900 border border-gray-100 shadow-sm">
                            <span className="text-[10px] text-gray-400 uppercase leading-tight">{scheduledDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg leading-none">{scheduledDate.getDate()}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{scheduledDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Platform Session Access */}
                    {booking.status === 'confirmed' && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> Join Session
                            </h3>
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-sm">
                                This session is confirmed. Join directly inside Mentozy using the in-platform WebRTC session controls.
                            </div>
                        </div>
                    )}

                    {booking.status === 'accepted' && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                            Your mentor has accepted this request. Session confirmation will be triggered automatically after successful Razorpay payment.
                        </div>
                    )}

                    {/* Mentor Note */}
                    {booking.mentor_note && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Mentor Note
                            </h3>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                                {booking.mentor_note}
                            </div>
                        </div>
                    )}

                    {/* Payment Proof (If visible to student, usually not necessary but user asked for "upload image of payment scanner - for now") 
                        Assuming this is for the student to Pay? Or for the mentor to prove they received it? 
                        
                        Re-reading request: "mentor should add ... upload image of payment scanner - for now, and student get re notified with details"
                        This phrasing "upload image of payment scanner" by the MENTOR is weird. 
                        Usually students upload payment proof.
                        
                        Interpretations:
                        A) Mentor uploads a QR code/Scanner for the Student TO PAY.
                        B) Mentor uploads proof that they received payment? (Unlikely)

                        Given "student get notified with details" and "mentor adds... payment scanner", 
                        Reasonable assumption: Mentor adds their QR code (Scanner) for payment collection if not done automatically.
                        So Student needs to SEE this image to PAY.
                    */}
                    {/* Status Banner */}
                    <div className={`mt-4 py-2 px-4 rounded-lg text-center text-sm font-bold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>
            </div>
        </div>
    );
}
