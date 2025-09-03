import Loading from "../../components/Loading";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import Title from "../../components/Title";
import { useEffect, useRef, useState } from "react";
import { BaseUrl } from "../../config";
import Cookies from "universal-cookie";
import successImage from "../../assets/success.gif";
import errorImage from "../../assets/error.gif";
import { MdBlock } from "react-icons/md";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";
import Pusher from "pusher-js";

export default function Queue() {
  // Modal Informations
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // State For Queue Data
  const [queue, setQueue] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [addAppointment, setAddAppointment] = useState(false);

  const dropdownRef = useRef(null);

  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // Handle Modal Auto Close
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
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
        console.error("Error fetching doctors:", error);
      }
    };

    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/patient`, {
          headers: { Authorization: `Bearer ${token}` },
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
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
    fetchDoctors();
  }, []);

  // Pusher Setup
  useEffect(() => {
    const pusher = new Pusher("461f10be7b84c1ef6776", {
      cluster: "eu",
      authEndpoint: `${BaseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const channel = pusher.subscribe("queue-channel");

    channel.bind("queue-turns", (data) => {
      console.log("Received queue-turns:", data);
      if (data?.status === 1) {
        setQueue(data.data);
      } else {
        setModal({
          isOpen: true,
          message: data.message || "Failed to load queue",
        });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [token]);

  async function sendStatus(status, turnId) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("queue_turn_status", status);
    formData.append("_method", "patch");
    try {
      await axios.post(
        `${BaseUrl}/queue-turns/${turnId}`, formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const addNewAppointment = async (e) => {
  e.preventDefault();

  if (!doctorId || !patientId) {
    setModal({
      isOpen: true,
      message: "Please fill all fields!",
      image: errorImage,
    });
    return;
  }


  setIsLoading(true);
  try {
    const response = await axios.post(
      `${BaseUrl}/queue-turns`,
      {
        doctor_id: doctorId,
        patient_id: patientId,
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

    setDoctorId("");
    setPatientId("");
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

  return (
    <>

      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        <Title label="Queue" className="px-1" />

        <button
          onClick={() => setAddAppointment(true)}
          className="w-fit rounded-xl p-3 fixed bottom-[25px] right-[25px] bg-[#089bab] hover:bg-[#047986] text-white duration-300"
        >
          <FiPlus className="text-2xl" />
        </button>

        <div className="overflow-x-auto md:overflow-visible shadow-xl rounded-2xl mt-5">
          <table className="min-w-full border border-gray-200 bg-white rounded-xl shadow-sm">
            <thead className="bg-[#089bab] text-white">
              <tr>
                <th className="px-4 py-2 text-center rounded-tl-2xl">Patient</th>
                <th className="px-4 py-2 text-center">Doctor</th>
                <th className="px-4 py-2 text-center">Arrival Time</th>
                <th className="px-4 py-2 text-center">Appointment Time</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center rounded-tr-2xl">Edit Status</th>
              </tr>
            </thead>
            <tbody>
              {queue.length > 0 ? (
                queue.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-center">
                    <td className="px-4 py-2">{item.patient?.name || "-"}</td>
                    <td className="px-4 py-2">{item.doctor?.name || "-"}</td>
                    <td className="px-4 py-2">{item.arrival_time}</td>
                    <td className="px-4 py-2">{item.appointment_time}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          item.status === "Cancelled"
                          ? "text-red-600"
                          : item.status === "In Progress"
                          ? "text-blue-500"
                          : item.status === "Checked In"
                          ? "text-gray-500"
                          : item.status === "Completed"
                          ? "text-green-500"
                          : "text-black"
                        }>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center relative">
                      {["Completed", "Cancelled"].includes(item.status) ? (
                        <MdBlock className="text-red-300 text-xl mx-auto" title="Cannot change status" />
                      ) : (
                        <BsThreeDots
                          className="justify-self-center cursor-pointer"
                          onClick={() =>
                            setSelectedAppointment(
                              selectedAppointment === item.id ? null : item.id
                            )
                          }
                        />
                      )}

                      {selectedAppointment === item.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute w-44 bg-white border rounded-lg shadow-lg z-50"
                          style={{
                            top: index >= queue.length - 3 ? '-120%' : '100%',
                            right: 0,
                          }}
                        >
                          <ul className="text-sm text-gray-700">
                            {item.status === "Checked In" ? (
                              <>
                                <li
                                  onClick={() => sendStatus("In Progress", item.id)}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  In Progress
                                </li>
                                <li
                                  onClick={() => sendStatus("Cancelled", item.id)}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  Cancelled
                                </li>
                              </>
                            ) : item.status === "In Progress" ? (
                              <li
                                onClick={() => sendStatus("Completed", item.id)}
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No queue data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Box */}
      {addAppointment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl p-5 text-xl items-center shadow-xl w-[500px] relative">
            <span onClick={() =>{
              setDoctorId("")
              setPatientId("")
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!doctorId?.toString() || !patientId?.toString()}
                className={`w-full py-2 rounded-lg text-white transition
                  ${!doctorId?.toString() || !patientId?.toString()
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
      {modal.isOpen && (<Modal message={modal.message} imageSrc={modal.image} />)}

    </>
  );
}
