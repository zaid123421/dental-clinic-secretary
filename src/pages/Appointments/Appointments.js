import Loading from "../../components/Loading";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import Title from "../../components/Title";
import { useEffect, useRef, useState } from "react";
import { BaseUrl } from "../../config";
import axios from "axios";
import Cookies from "universal-cookie";
import successImage from "../../assets/success.gif";
import errorImage from "../../assets/error.gif";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";
import { BsThreeDots } from "react-icons/bs";
import { MdBlock } from "react-icons/md";

export default function Appointments() {
  // Modal Informations
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    image: "",
  });
  // Loading Spinner To Communicating With Backend
  const [isLoading, setIsLoading] = useState(false);
  // State For Seatch
  const [search, setSearch] = useState("");
  // State For Appointments Data
  const [appointments, setAppointments] = useState([]);
  // State For Date Range
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [addAppointment, setAddAppointment] = useState(false);

  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const dropdownRef = useRef(null);

  // Cookies
  const cookie = new Cookies();
  // Get The Token That Stored In The Browser
  const token = cookie.get("token");

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
    fetchAppointments(today, today);
  }, []);

  useEffect(() => {
    fetchAppointments(fromDate, toDate);
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

    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/patient`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.data.status === 1) {
          setPatients(
            response.data.data.data.map((pat) => ({
              value: pat.id,
              label: pat.name,
            }))
          );
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching patients:", error);
        }
      }
    };

    fetchPatients();
    fetchDoctors();

    return () => controller.abort();
  }, [token]);

  useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setSelectedAppointment(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
  }, []);

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

  const addNewAppointment = async (e) => {
  e.preventDefault();

  if (!doctorId || !patientId || !startTime || !endTime) {
    setModal({
      isOpen: true,
      message: "Please fill all fields!",
      image: errorImage,
    });
    return;
  }

  if (new Date(endTime) <= new Date(startTime)) {
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
        start_time: formatDateTime(startTime),
        end_time: formatDateTime(endTime),
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

    setDoctorId("");
    setPatientId("");
    setStartTime("");
    setEndTime("");
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

  async function fetchAppointments(from = fromDate, to = toDate) {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BaseUrl}/appointment?filter[date_range][from]=${from}&filter[date_range][to]=${to}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 1) {
        setAppointments(response.data.data);
      } else {
        setModal({
          isOpen: true,
          message: response.data.message || "Failed to fetch appointments!",
          image: errorImage,
        });
      }
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

  return(
    <>

      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        <Title label="Appointments" className="px-1"/>
        <button
          onClick={() => setAddAppointment(true)}
          className="w-fit rounded-xl p-3 fixed bottom-[25px] right-[25px] bg-[#089bab] hover:bg-[#047986] text-white duration-300"
        >
          <FiPlus className="text-2xl" />
        </button>
        <div className="flex flex-col md:flex-row gap-3 mt-5 flex-wrap">
          <div className="flex items-center">
            <label className="mb-1 text-sm font-bold text-gray-600 mr-2 w-[50px] md:w-fit">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#089bab]"
            />
          </div>

          <div className="flex items-center">
            <label className="mb-1 text-sm font-bold text-gray-600 mr-2 w-[50px] md:w-fit">To</label>
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

        {/* Results */}
        <div className="mt-5 realtive">
          {appointments.length > 0 ? (
            <div className="overflow-x-auto md:overflow-visible shadow-xl rounded-2xl mt-5">
              <table className="min-w-full border border-gray-200 bg-white rounded-xl shadow-sm">
                <thead className="bg-[#089bab] text-white">
                  <tr className="">
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
                      <td className={`px-4 py-2 text-center`}>{appt.patient?.name}</td>
                      <td className="px-4 py-2 text-center">{appt.doctor?.name}</td>
                      <td className="px-4 py-2 text-center">{appt.date}</td>
                      <td className="px-4 py-2 text-center">{appt.start_time} - {appt.end_time}</td>
                      <td className="px-4 py-2 text-center">{appt.duration}</td>
                      <td className="px-4 py-2 text-center font-semibold">
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
                      <td className="px-4 py-2 text-center relative">
                        {["Completed", "Cancelled", "No Show"].includes(appt.status) ? (
                          <MdBlock className="text-red-300 text-xl mx-auto" title="Cannot change status" />
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

                        {selectedAppointment === appt.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute w-44 bg-white border rounded-lg shadow-lg z-50"
                            style={{
                              top: index >= appointments.length - 3 ? '-120%' : '100%',
                              right: 0,
                            }}
                          >
                            <ul className="text-sm text-gray-700">
                              {appt.status === "Scheduled" ? (
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
                              ) : appt.status === "Checked In" ? (
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
                              ) : appt.status === "In Progress" ? (
                                <li
                                  onClick={() => sendStatus("Completed", appt.id)}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  Completed
                                </li>
                              ) : null}
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
            <p className="text-gray-500 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-center">No appointments found.</p>
          )}
        </div>
      </div>

      {/* Add Appointment Box */}
      {addAppointment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl p-5 text-xl items-center shadow-xl w-[500px] relative">
            <span onClick={() =>{
              setDoctorId("")
              setPatientId("")
              setStartTime("")
              setEndTime("")
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

              {/* Patient */}
              <div>
                <label className="block text-gray-700 mb-1">Patient</label>
                <Select
                  options={patients}
                  onChange={(option) => setPatientId(option.value)}
                  placeholder="Search Patient..."
                  isSearchable
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-[#089bab]"
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-[#089bab]"
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!doctorId?.toString() || !patientId?.toString() || !startTime || !endTime}
                className={`w-full py-2 rounded-lg text-white transition
                  ${!doctorId?.toString() || !patientId?.toString() || !startTime || !endTime
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#089bab] hover:bg-[#067c88]"}`}
              >
                Add Appointment
              </button>

            </form>
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