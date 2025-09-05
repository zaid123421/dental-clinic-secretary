import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../components/Title";
import { IoIosArrowBack } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { BaseUrl } from "../../config";
import Cookies from "universal-cookie";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import successImage from "../../assets/success.gif";
import error from "../../assets/error.gif";
import { BsThreeDots } from "react-icons/bs";
import errorImage from "../../assets/error.gif";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";

export default function ShowPatientAppointments() {
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const patientId = params.get("patientId");

  const cookie = new Cookies();
  const token = cookie.get("token");

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: "", image: "" });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [addAppointment, setAddAppointment] = useState(false);
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal auto-close
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => setModal(prev => ({ ...prev, isOpen: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);

  // Initialize dates to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    fetchAppointments(today, today, activeFilter);
  }, [refreshFlag]);

  useEffect(() => {
  const controller = new AbortController();

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (response.data.status === 1) {
        setDoctors(
          response.data.data.map((doc) => ({
            value: doc.id,
            label: doc.name,
          }))
        );
      }
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Error fetching doctors:", error);
      }
    }
  };

  fetchDoctors();

    return () => controller.abort();
  }, [token]);

  // Fetch Appointments
  const fetchAppointments = async (from = fromDate, to = toDate, status = "") => {
    setIsLoading(true);
    try {
      let url = `${BaseUrl}/patient/${patientId}/appointments?filter[date_range][from]=${from}&filter[date_range][to]=${to}`;
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

  const addNewAppointment = async (e) => {
  e.preventDefault();
  if (!doctorId || !patientId || !date || !fromTime || !toTime) {
    setModal({
      isOpen: true,
      message: "Please fill all fields!",
      image: errorImage,
    });
    return;
  }
  const startDateTime = `${date}T${fromTime}`;
  const endDateTime = `${date}T${toTime}`;
  if (new Date(endDateTime) <= new Date(startDateTime)) {
    setModal({
      isOpen: true,
      message: "End time must be after start time!",
      image: errorImage,
    });
    return;
  }
  setIsLoading(true);
  try {
  const response = await axios.post(
    `${BaseUrl}/appointment`,
    {
      doctor_id: doctorId,
      patient_id: patientId,
      start_time: formatDateTime(startDateTime),
      end_time: formatDateTime(endDateTime),
    },
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data.status === 1) {
    setModal({
      isOpen: true,
      message: response.data.message || "Appointment added successfully!",
      image: successImage,
    });
    setAddAppointment(false);
    fetchAppointments();

    setDoctorId("")
    setDate("")
    setFromTime("")
    setToTime("")
    setAddAppointment(false)
    } else {
      setModal({
        isOpen: true,
        message: response.data.message || "Failed to add appointment!",
        image: errorImage,
      });
    }
  } catch (error) {
    console.error("Error adding appointment:", error);
    setModal({
      isOpen: true,
      message: "Something went wrong!",
      image: errorImage,
    });
  } finally {
    setIsLoading(false);
  }
  };

  const formatDateTime = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  async function sendStatus(status, appointmentId) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("appointment_status", status);
    formData.append("_method", "patch");
    console.log(status);
    console.log(appointmentId);
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
        image: errorImage,
      });
    } finally {
      setIsLoading(false);
    }
  }

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
          <Title className="flex-1" label="Patient Appointments" />
        </div>

        <button
          onClick={() => setAddAppointment(true)}
          className="z-[50] w-fit rounded-xl p-3 fixed bottom-[25px] right-[25px] bg-[#089bab] hover:bg-[#047986] text-white duration-300"
        >
          <FiPlus className="text-2xl" />
        </button>

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

        {/* Appointments Table */}
        {appointments?.length > 0 ? (
          <div className="overflow-x-auto md:overflow-visible shadow-xl rounded-2xl mt-2">
            <table className="min-w-full border border-gray-200 bg-white rounded-xl shadow-sm">
              <thead className="bg-[#089bab] text-white">
                <tr>
                    <th className="px-4 py-2 text-center rounded-tl-2xl">Patient</th>
                    <th className="px-4 py-2 text-center">Doctor</th>
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
                    index !== appointments.length - 1
                      ? "border-b-[1px] border-b-gray-300"
                      : ""
                  } text-center font-semibold`}>
                    <td className={`px-4 py-2`}>{appt.patient?.name}</td>
                    <td className="px-4 py-2">{appt.doctor?.name}</td>
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

      {/* Add Appointment Box */}
      {addAppointment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl p-5 text-xl items-center shadow-xl w-[500px] relative">
            <span onClick={() =>{
              setDoctorId("")
              setDate("")
              setFromTime("")
              setToTime("")
              setAddAppointment(false)
              }}
              className="absolute right-[20px] top-[20px] text-black hover:cursor-pointer">X</span>
            <h2 className="text-center text-2xl font-bold">Add Appointment</h2>
            <form className="space-y-4" onSubmit={addNewAppointment}>

              {/* Doctor */}
              <div>
                <label className="block text-gray-700 mb-1">Doctor</label>
                <Select
                  options={doctors}
                  onChange={(option) => setDoctorId(option.value)}
                  placeholder="Search Doctor..."
                  isSearchable
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-[#089bab]"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* From Time */}
              <div>
                <label className="block text-gray-700 mb-1">From</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-[#089bab]"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                />
              </div>

              {/* To Time */}
              <div>
                <label className="block text-gray-700 mb-1">To</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-[#089bab]"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!doctorId?.toString() || !patientId?.toString() || !date || !fromTime || !toTime}
                className={`w-full py-2 rounded-lg text-white transition
                  ${!doctorId?.toString() || !patientId?.toString() || !date || !fromTime || !toTime
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#089bab] hover:bg-[#067c88]"}`}
              >
                Add Appointment
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Loading & Modal */}
      {isLoading && <Loading />}

      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
