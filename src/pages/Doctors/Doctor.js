import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../components/Title";
import { IoIosArrowBack } from "react-icons/io";
import Sidebar from "../../components/Sidebar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../../config";
import Cookies from "universal-cookie";
import { GoDash } from "react-icons/go";
import { FiPlus } from "react-icons/fi";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import successImage from "../../assets/success.gif";
import { FiFilter } from "react-icons/fi";
import error from "../../assets/error.gif";
import { BsThreeDots } from "react-icons/bs";

export default function Doctor() {
  // States
    // Loading Spinner To Communicating With Backend
    const [isLoading, setIsLoading] = useState(false);
    // Modal Inforomations
    const [modal, setModal] = useState({
      isOpen: false,
      message: "",
      image: "",
    });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appointments, setAppointments] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftFrom, setShiftFrom] = useState("");
  const [shiftTo, setShiftTo] = useState("");
  const [shiftTarget, setShiftTarget] = useState("");

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // useLocation
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const doctorId = params.get("doctorId");

  // useEffects
    // Modal Timer useEffect
    useEffect(() => {
        if (modal.isOpen) {
          const timer = setTimeout(() => {
            setModal((prev) => ({ ...prev, isOpen: false }));
          }, 3000);
          return () => clearTimeout(timer);
        }
    }, [modal.isOpen]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    fetchAppointments(today, today, activeFilter);
  }, [refreshFlag]);

  async function sendStatus(status, appointmentId) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("appointment_status", status);
    formData.append("_method", "patch");
    try {
      const response = await axios.post(
        `${BaseUrl}/appointment/${appointmentId}`, formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 1) {
        setRefreshFlag((prev) => prev + 1)
      }
      setSelectedAppointment(null);
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        message: "Something Went Wrong!",
        image: error,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function sendShift() {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("from", formatDateTime(shiftFrom));
    formData.append("to", formatDateTime(shiftTo));
    formData.append("target_time", formatDateTime(shiftTarget));
    try {
      const response = await axios.post(
        `${BaseUrl}/doctor/${doctorId}/appointments/shift`,
        formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 1) {
        setRefreshFlag((prev) => prev + 1);
        setShiftFrom("");
        setShiftTo("");
        setShiftTarget("");
        setModal({
          isOpen: true,
          message: "The Appointments Have Been Shifted Successfully",
          image: successImage,
        });
      }

      setSelectedAppointment(null);
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        message: "Something Went Wrong!",
        image: error,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = "00";
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  // Fetch Appointments
  const fetchAppointments = async (from = fromDate, to = toDate, status = "") => {
    setIsLoading(true);
    try {
      let url = `${BaseUrl}/doctor/${doctorId}/appointments?filter[date_range][from]=${from}&filter[date_range][to]=${to}`;
      if (status) url += `&filter[status]=${status}`;

      const response = await axios.get(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 1) {
        setAppointments(response.data.data);
      } else {
        setModal({ isOpen: true, message: response.data.message || "Failed to fetch appointments!", image: error });
      }
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, message: "Something went wrong!", image: error });
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownRef = useRef(null);

  const filters = [
    { label: "All", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Scheduled", value: "Scheduled" },
    { label: "Refused", value: "Refused" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "No Show", value: "No Show" },
    { label: "Checked In", value: "Checked In" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Deleted", value: "Deleted" },
  ];

  return(
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <IoIosArrowBack
            onClick={() => nav(`/doctors`)}
            className="text-2xl cursor-pointer duration-300 hover:text-[#089bab]"
          />
          <Title className="flex-1" label="Doctor Appointments" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="cursor-pointer shadow-lg rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="cursor-pointer shadow-lg rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
            />
          </div>

          {/* Dropdown filter */}
          <div className="relative inline-block text-center shadow-lg bg-transparent rounded-xl" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border-none shadow-lg inline-flex justify-center items-center px-4 py-[9px] bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100"
            >
              <FiFilter className="mr-2 text-lg" />
              {activeFilter ? activeFilter : "Filter"}
            </button>

            {isDropdownOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                {filters.map((filter) => (
                  <li
                    key={filter.value}
                    className={`cursor-pointer px-4 py-2 hover:bg-[#089bab] hover:text-white ${
                      activeFilter === filter.value ? "bg-[#089bab] text-white" : ""
                    }`}
                    onClick={() => {
                      setActiveFilter(filter.value);
                      setIsDropdownOpen(false);
                      fetchAppointments(fromDate, toDate, filter.value);
                    }}
                  >
                    {filter.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => fetchAppointments(fromDate, toDate, activeFilter)}
            className="px-4 py-2 bg-[#089bab] text-white rounded-xl hover:bg-[#077c89]"
          >
            Apply Date
          </button>
        </div>

        <button
          onClick={() => setIsShiftModalOpen(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
        >
          Shift Appointments
        </button>

        {/* Appointments Table */}
        {appointments?.length > 0 ? (
          <div className="overflow-x-auto md:overflow-visible shadow-xl rounded-2xl mt-2">
            <table className="min-w-full border border-gray-200 bg-white rounded-xl shadow-sm">
              <thead className="bg-[#089bab] text-white">
                <tr>
                    <th className="px-4 py-2 text-center rounded-tl-2xl">Doctor</th>
                    <th className="px-4 py-2 text-center">Patient</th>
                    <th className="px-4 py-2 text-center">Date</th>
                    <th className="px-4 py-2 text-center">Time</th>
                    <th className="px-4 py-2 text-center">Duration (min)</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center rounded-tr-2xl">Edit Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.map((appt, index) => (
                  <tr key={appt.id} className={`p-3 ${
                    index !== appointments?.length - 1
                      ? "border-b-[1px] border-b-gray-300"
                      : ""
                  } text-center font-semibold`}>
                    <td className="px-4 py-2">{appt.doctor?.name}</td>
                    <td className={`px-4 py-2`}>{appt.patient?.name}</td>
                    <td className="px-4 py-2">{appt.date}</td>
                    <td className="px-4 py-2">{appt.start_time} - {appt.end_time}</td>
                    <td className="px-4 py-2">{appt.duration}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          appt.status === "Pending"
                            ? "text-black"
                            : appt.status === "Scheduled"
                            ? "text-yellow-500"
                            : appt.status === "Cancelled"
                            ? "text-red-600"
                            : appt.status === "In Progress"
                            ? "text-blue-500"
                            : appt.status === "Checked In"
                            ? "text-gray-500"
                            : appt.status === "Completed"
                            ? "text-green-500"
                            : appt.status === "Refused"
                            ? "text-red-600"
                            : appt.status === "Deleted"
                            ? "text-red-600"
                            : "text-black"
                        }
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center relative">
                      {["Refused", "Deleted", "Completed", "Cancelled", "No Show"].includes(appt.status) ? (
                        "-"
                      ) : (
                        <BsThreeDots
                          className="justify-self-center cursor-pointer"
                          onClick={() =>
                            setSelectedAppointment(
                              selectedAppointment === appt.id ? null : appt.id
                            )
                          }
                        />
                      )}

                      {selectedAppointment === appt.id &&
                        !["Refused", "Deleted", "Completed", "Cancelled", "No Show"].includes(appt.status) && (
                          <div
                            ref={dropdownRef}
                            className="absolute w-44 bg-white border rounded-lg shadow-lg z-50"
                            style={{
                              top: index >= appointments.length - 3 ? '-120%' : '100%',
                              right: 0,
                            }}
                          >
                            <ul className="text-sm text-gray-700">
                              {appt.status === "Pending" && (
                                <>
                                  <li
                                    onClick={() => sendStatus("Scheduled", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Scheduled
                                  </li>
                                  <li
                                    onClick={() => sendStatus("Refused", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Refused
                                  </li>
                                  <li
                                    onClick={() => sendStatus("Deleted", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Deleted
                                  </li>
                                </>
                              )}

                              {appt.status === "Scheduled" && (
                                <>
                                  <li
                                    onClick={() => sendStatus("Checked In", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Checked In
                                  </li>
                                  <li
                                    onClick={() => sendStatus("No Show", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    No Show
                                  </li>
                                  <li
                                    onClick={() => sendStatus("Cancelled", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Cancelled
                                  </li>
                                </>
                              )}

                              {appt.status === "Checked In" && (
                                <>
                                  <li
                                    onClick={() => sendStatus("In Progress", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    In Progress
                                  </li>
                                  <li
                                    onClick={() => sendStatus("Cancelled", appt.id)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Cancelled
                                  </li>
                                </>
                              )}

                              {appt.status === "In Progress" && (
                                <li
                                  onClick={() => sendStatus("Completed", appt.id)}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  Completed
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
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

      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl p-6 shadow-xl w-[400px] relative">
            <h2 className="text-center font-bold text-2xl mb-4">Shift Appointments</h2>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-bold text-gray-600">From</label>
                <input
                  type="datetime-local"
                  value={shiftFrom}
                  onChange={(e) => setShiftFrom(e.target.value)}
                  className="w-full cursor-pointer shadow-lg rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
                />
              </div>
              <div>
                <label className="font-bold text-gray-600">To</label>
                <input
                  type="datetime-local"
                  value={shiftTo}
                  onChange={(e) => setShiftTo(e.target.value)}
                  className="w-full cursor-pointer shadow-lg rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
                />
              </div>
              <div>
                <label className="font-bold text-gray-600">Target Time</label>
                <input
                  type="datetime-local"
                  value={shiftTarget}
                  onChange={(e) => setShiftTarget(e.target.value)}
                  className="w-full cursor-pointer shadow-lg rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={() => {
                  setIsShiftModalOpen(false);
                  setShiftFrom("");
                  setShiftTo("");
                  setShiftTarget("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sendShift();
                  setIsShiftModalOpen(false);
                  setShiftFrom("");
                  setShiftTo("");
                  setShiftTarget("");
                }}
                disabled={!shiftFrom || !shiftTo || !shiftTarget}
                className={`px-4 py-2 rounded-xl text-white 
                  ${!shiftFrom || !shiftTo || !shiftTarget 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-[#089bab] hover:bg-[#077c89]"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner When Communicating With Backend */}
      {isLoading && <Loading />}

      {/* State Of The Communicating With Backend (Successfull Or Failure) */}
      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}