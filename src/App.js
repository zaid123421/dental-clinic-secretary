import { Route, Routes } from "react-router-dom";
import Login from "./pages/Authentication/Login";
import Patients from "./pages/Patients/Patients";
import AddPatient from "./pages/Patients/AddPatient";
import ShowPatient from "./pages/Patients/ShowPatient";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/add-patient" element={<AddPatient />} />
      <Route path="/show-patient" element={<ShowPatient />} />
    </Routes>
  );
}
