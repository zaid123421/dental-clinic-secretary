import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../components/Title";
import { IoIosArrowBack } from "react-icons/io";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../../config";
import Cookies from "universal-cookie";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import successImage from "../../assets/success.gif";
import error from "../../assets/error.gif";

export default function ShowPatientAppointments() {
  // States
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    image: "",
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // useNavigate & useLocation
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const patientId = params.get("patientId");

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // Modal Timer
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);

  // Initialize dates to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    fetchAppointments(today, today);
  }, []);

  // Fetch Appointments with optional date range
  const fetchAppointments = async (from = fromDate, to = toDate) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BaseUrl}/patient/${patientId}/appointments?filter[date_range][from]=${from}&filter[date_range][to]=${to}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 1) {
        setPatient(response.data.data);
      } else {
        setModal({
          isOpen: true,
          message: response.data.message || "Failed to fetch appointments!",
          image: error,
        });
      }
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        message: "Something went wrong!",
        image: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <IoIosArrowBack
            onClick={() => nav(`/show-patient?patientId=${patientId}`)}
            className="text-2xl cursor-pointer duration-300 hover:text-[#089bab]"
          />
          <Title className="flex-1" label="Patient Information" />
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
            />
          </div>
          <button
            onClick={() => fetchAppointments()}
            className="px-4 py-2 bg-[#089bab] text-white rounded-xl hover:bg-[#077c89]"
          >
            Apply Filter
          </button>
        </div>

        {/* Appointments List */}
        {patient && patient.appointments?.length > 0 ? (
          <div className="overflow-x-auto md:overflow-visible shadow-xl rounded-2xl mt-2">
            <table className="min-w-full border border-gray-200 bg-white rounded-xl shadow-sm">
              <thead className="bg-[#089bab] text-white">
                <tr>
                  <th className="px-4 py-2 text-center rounded-tl-2xl">Date</th>
                  <th className="px-4 py-2 text-center">Time</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {patient.appointments.map((appt) => (
                  <tr key={appt.id} className="text-center font-semibold border-b border-gray-300">
                    <td className="px-4 py-2">{appt.date}</td>
                    <td className="px-4 py-2">{appt.start_time} - {appt.end_time}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          appt.status === "Scheduled"
                            ? "text-yellow-500"
                            : appt.status === "Cancelled"
                            ? "text-red-600"
                            : appt.status === "In Progress"
                            ? "text-blue-500"
                            : appt.status === "Checked In"
                            ? "text-gray-500"
                            : appt.status === "Completed"
                            ? "text-green-500"
                            : "text-black"
                        }
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">No appointments found.</p>
        )}
      </div>

      {/* Loading Spinner */}
      {isLoading && <Loading />}
      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
