import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import log from "../assets/log.png";

const DoctorAppointment = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([
    { date: "2025-07-01", count: 5 },
    { date: "2025-07-02", count: 9 },
    { date: "2025-07-03", count: 12 },
    { date: "2025-07-04", count: 9 },
    { date: "2025-07-05", count: 9 },
    { date: "2025-07-06", count: 16 },
    { date: "2025-07-07", count: 9 },
    { date: "2025-07-08", count: 20 },
    { date: "2025-07-09", count: 9 },
    { date: "2025-07-10", count: 3 },
    { date: "2025-07-11", count: 2 },
    { date: "2025-07-12", count: 9 },
    { date: "2025-07-13", count: 18 },
    { date: "2025-07-14", count: 9 },
    { date: "2025-07-15", count: 9 },
    { date: "2025-07-16", count: 4 },
    { date: "2025-07-17", count: 9 },
    { date: "2025-07-18", count: 2 },
    { date: "2025-07-19", count: 1 },
    { date: "2025-07-20", count: 7 },
    { date: "2025-07-21", count: 3 },
    { date: "2025-07-22", count: 9 },
    { date: "2025-07-23", count: 9 },
    { date: "2025-07-24", count: 6 },
    { date: "2025-07-25", count: 9 },
    { date: "2025-07-26", count: 11 },
    { date: "2025-07-27", count: 10 },
    { date: "2025-07-28", count: 9 },
    { date: "2025-07-29", count: 5 },
    { date: "2025-07-30", count: 9 },
  ]);

  const handleEventClick = (clickInfo) => {
    navigate(clickInfo.event.startStr.split("T")[0]);
    clickInfo.jsEvent.preventDefault();
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="fc-event-main-frame">
        <div className="fc-event-title-container">
          <div
            className="fc-event-title fc-sticky hover:cursor-pointer w-full text-black border border-[#5b21b6] bg-white text-center "
            onClick={(e) => {
              navigate(eventInfo.event.startStr.split("T")[0]);
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {eventInfo.event.title}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="bg-[#f8f9fa] flex justify-between items-center h-[100px] shadow-md shadow-cyan-800 rounded-md px-3 mb-4">
        <img src={log} alt="We Cure Consultancy Logo" className="w-20" />
        <h2 className="sm:text-3xl md:text-4xl font-extrabold text-[#5b21b6] flex items-center">
          🗓 All Appointments
        </h2>
        <div className=""></div>
      </div>
      <div className="bg-[#f8f9fa] shadow-md shadow-cyan-800 rounded-md p-3 ">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={appointments.map((a) => ({
            title: `${a.count} Appointments`,
            date: a.date,
          }))}
          eventContent={renderEventContent}
          height="auto"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
        />
      </div>
    </div>
  );
};

export default DoctorAppointment;
