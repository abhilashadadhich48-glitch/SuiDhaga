import React, { useState, useEffect } from 'react';
import { appointmentAPI, getImageUrl } from '../../services/api';
import { Calendar, MessageSquare, Compass } from 'lucide-react';

interface Appointment {
  _id: string;
  tailor: {
    name: string;
    profilePicture?: string;
  };
  date: string;
  timeSlot: string;
  notes?: string;
  status: string;
}

const CustomerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mx-auto max-w-6xl text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Styling <span className="text-[#2f5d50] italic font-normal">Consultations</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xs text-[#6b7280] font-sans tracking-wide">
          Manage your booked styling, fitting, and design sessions with master custom tailors.
        </p>
        <div className="mt-4 h-[1px] w-20 bg-[#e8e4de] mx-auto"></div>
      </div>

      <div className="mx-auto max-w-4xl">
        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-lg">
            <Compass className="h-10 w-10 text-[#d4a373]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#2c2c2c] tracking-wider uppercase">
              No Booked Consultations
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              Schedule fitting sessions from any atelier profile.
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
                  <img
                    src={getImageUrl(appt.tailor.profilePicture) || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&fit=crop'}
                    alt={appt.tailor.name}
                    className="h-12 w-12 rounded-full object-cover border border-[#e8e4de]"
                  />
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider uppercase">
                      {appt.tailor.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6b7280]">
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
                  <div className="flex-1 md:mx-6 bg-[#faf8f5] p-3 border border-[#e8e4de] text-xs text-[#6b7280] flex gap-2 rounded-md">
                    <MessageSquare className="h-4 w-4 shrink-0 text-[#d4a373] mt-0.5" />
                    <p className="italic">"{appt.notes}"</p>
                  </div>
                )}

                <div className="shrink-0 self-end md:self-auto">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 border rounded-sm ${
                      appt.status === 'Approved'
                        ? 'bg-[#a3b18a]/10 text-[#2f5d50] border-[#a3b18a]/20'
                        : appt.status === 'Rejected'
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-[#d4a373]/10 text-[#d4a373] border-[#d4a373]/20'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
