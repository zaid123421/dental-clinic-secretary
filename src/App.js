import { Route, Routes } from "react-router-dom";
import Login from "./pages/Authentication/Login";
import Patients from "./pages/Patients/Patients";
import AddPatient from "./pages/Patients/AddPatient";
import ShowPatient from "./pages/Patients/ShowPatient";
import Appointments from "./pages/Appointments/Appointments";
import Queue from "./pages/Queue/Queue";
import ShowPatientAppointments from "./pages/Patients/ShowPatientAppointments";
import Profile from "./pages/Profile/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/queue" element={<Queue />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/add-patient" element={<AddPatient />} />
      <Route path="/show-patient" element={<ShowPatient />} />
      <Route path="/show-patient-appointments" element={<ShowPatientAppointments />} />
      <Route path="/employee/profile" element={<Profile />} />
    </Routes>
  );
}
