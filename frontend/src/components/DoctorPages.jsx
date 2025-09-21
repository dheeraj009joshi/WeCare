import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";

const DoctorPages = () => {
  return (
    <div className="flex min-h-screen">
      <DoctorSidebar />
      <div className="flex-1 ">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorPages;
