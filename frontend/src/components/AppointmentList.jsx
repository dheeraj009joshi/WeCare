import { useParams } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import log from "../assets/log.png";
const mockData = [
  {
    id: "001",
    name: "Deena Cooley",
    age: 65,
    doctor: "Vicki Walsh",
    department: "Surgeon",
    date: "2025-07-23",
    time: "9:30AM",
    disease: "Diabetes",
  },
  {
    id: "002",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-01",
    time: "9:45AM",
    disease: "Fever",
  },
  {
    id: "003",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-06",
    time: "9:45AM",
    disease: "Fever",
  },
  {
    id: "004",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-05",
    time: "9:45AM",
    disease: "Fever",
  },
  {
    id: "005",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-04",
    time: "9:45AM",
    disease: "Fever",
  },
  {
    id: "006",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-03",
    time: "9:45AM",
    disease: "Fever",
  },
  {
    id: "007",
    name: "Jerry Wilcox",
    age: 73,
    doctor: "April Gallegos",
    department: "Gynecologist",
    date: "2025-07-02",
    time: "9:45AM",
    disease: "Fever",
  },
  // Add remaining entries
];

const AppointmentList = () => {
  const { date } = useParams();
  const appointments = mockData.filter((a) => a.date === date);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center h-[100px] shadow-md shadow-cyan-800 rounded-md px-3 mb-4 bg-[#f8f9fa]">
        <img src={log} alt="We Cure Consultancy Logo" className="w-20" />
        <h2 className="sm:text-3xl md:text-4xl font-extrabold text-[#5b21b6] flex items-center ">
          {/* <Stethoscope className="sm:w-6 md:w-10 sm:h-6 md:h-10" /> */}
          📜 Appointments List
        </h2>
        <div className=""></div>
      </div>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">#</th>
            <th className="p-2">Patient Name</th>
            <th className="p-2">Age</th>
            <th className="p-2">Consulting Doctor</th>
            <th className="p-2">Department</th>
            <th className="p-2">Date</th>
            <th className="p-2">Time</th>
            <th className="p-2">Disease</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-t text-center">
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.name}</td>
              <td className="p-2">{a.age}</td>
              <td className="p-2">{a.doctor}</td>
              <td className="p-2">{a.department}</td>
              <td className="p-2">{a.date}</td>
              <td className="p-2">{a.time}</td>
              <td className="p-2">{a.disease}</td>
              <td className="p-2 space-x-2">
                <button className="bg-[#083] text-white px-2 py-1 rounded">
                  ✔
                </button>
                <button className="bg-red-700 text-white px-2 py-1 rounded">
                  ✘
                </button>
                <button className="bg-gray-300 px-2 py-1 rounded">✎</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;
