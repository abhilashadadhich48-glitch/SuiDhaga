import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import { Calendar, User as UserIcon, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Appointment {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  timeSlot: string;
  notes?: string;
  status: string;
}

const TailorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await appointmentAPI.updateAppointmentStatus(id, status);
      setSuccess(`Consultation slot ${status.toLowerCase()} successfully.`);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-6xl border-b border-[#e8e4de] pb-6 mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Consultation <span className="text-[#2f5d50] italic font-normal">Agenda</span>
        </h1>
        <p className="mt-1.5 text-xs text-[#6b7280]">
          Manage and review incoming booking slots requested by clients.
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        {success && (
          <div className="flex items-center gap-2 border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-3.5 text-xs text-[#2f5d50] mb-6 rounded-md">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{success}</span>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-lg">
            <Clock className="h-10 w-10 text-[#d4a373]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#2c2c2c] tracking-wider uppercase">
              Schedule is Clear
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              No consultation requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white border border-[#e8e4de] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-sm transition-all rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-[#d4a373]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider uppercase">
                      Client: {appt.customer.name}
                    </h3>
                    <p className="text-xs text-[#6b7280]">{appt.customer.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#6b7280]">
                      <Calendar className="h-4 w-4 text-[#d4a373]" />
                      <span>
                        {new Date(appt.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{appt.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {appt.notes && (
                  <div className="flex-1 md:mx-6 bg-[#faf8f5] p-3.5 border border-[#e8e4de] text-xs text-[#6b7280] flex gap-2 rounded-md">
                    <MessageSquare className="h-4.5 w-4.5 shrink-0 text-[#d4a373] mt-0.5" />
                    <p className="italic">"{appt.notes}"</p>
                  </div>
                )}

                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                  {appt.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appt._id, 'Approved')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#2f5d50] bg-[#2f5d50] hover:bg-transparent hover:text-[#2f5d50] text-[10px] font-bold uppercase tracking-widest text-white transition-all rounded-none"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Decline
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 border rounded-sm ${
                        appt.status === 'Approved'
                          ? 'bg-[#a3b18a]/10 text-[#2f5d50] border-[#a3b18a]/20'
                          : 'bg-red-50 text-red-500 border-red-200'
                      }`}
                    >
                      {appt.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorAppointments;
