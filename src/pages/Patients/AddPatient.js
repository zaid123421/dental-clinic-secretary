// Components
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
// Icons
import { IoIosArrowBack } from "react-icons/io";
// Images
import successImage from "../../assets/success.gif";
import error from "../../assets/error.gif";
// Hooks
import { useEffect, useState } from "react";
// Axios Library
import axios from "axios";
// Communicating With Backend
import { BaseUrl } from "../../config";
// Cookies
import Cookies from "universal-cookie";
// react router dom tool
import { useNavigate } from "react-router-dom";

export default function AddPatient() {
  // States
    // Loading Spinner To Communicating With Backend
    const [isLoading, setIsLoading] = useState(false);
    const [dieases, setDieases] = useState(null);
    const [intake, setInTake] = useState(null);
    // Modal Inforomations
    const [modal, setModal] = useState({
      isOpen: false,
      message: "",
      image: "",
    });
    // Patient Informations
    const [patient, setPatient] = useState({
      id: null,
      name: null,
      phone_number: "09",
      birthdate: null,
      gender: null,
      job: null,
      address: "",
      marital_satus: null,
      social_history: null,
      intake_medications: [],
      dieases: [],
    });

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
    // Get The Token That Stored In The Browser
    const token = cookie.get("token");

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
      axios.get(`${BaseUrl}/disease`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((data) => {
          setDieases(data.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, []);

    useEffect(() => {
      axios.get(`${BaseUrl}/intake-medication`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((data) => {
          setInTake(data.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, []);

  // Functions
    // Add Employee Function
    async function AddPatient() {
      setIsLoading(true);
      const formData = new FormData();

      if (patient.name) formData.append("name", patient.name);
      if (patient.phone_number) formData.append("phone_number", patient.phone_number);
      if (patient.birthdate) formData.append("birthdate", patient.birthdate);
      if (patient.gender) formData.append("gender", patient.gender);
      if (patient.job) formData.append("job", patient.job);
      if (patient.address) formData.append("address", patient.address);
      if (patient.marital_satus) formData.append("marital_status", patient.marital_satus);
      if (patient.social_history) formData.append("social_history", patient.social_history);

      patient.dieases.forEach((id) => {
        formData.append("diseases_ids[]", id);
      });

      patient.intake_medications.forEach((id) => {
        formData.append("intake_medications_ids[]", id);
      });

      try {
        await axios.post(`${BaseUrl}/patient`, formData, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setModal({
          isOpen: true,
          message: "The Patient Has Been Added Successfully !",
          image: successImage,
        });
        setTimeout(() => {
          nav(`/patients`);
        }, 3000);
      } catch (err) {
        console.log(err);
        setModal({
          isOpen: true,
          message: "Something Went Wrong !",
          image: error,
        });
      } finally {
        setIsLoading(false);
      }
    }

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar />
      {/* Container Of The Page */}
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        {/* Introduction Section */}
        <div className="flex items-center">
          <IoIosArrowBack
            onClick={() => nav("/patients")}
            className="text-2xl cursor-pointer duration-300 hover:text-[#089bab]"
          />
          <Title className="flex-1" label="Add Patient" />
        </div>
        {/* Container Of The Page Content */}
        <div className="p-5 text-xl flex flex-col items-center bg-white rounded-xl shadow-xl my-4 ">
          {/* Informations Section */}
          <div className="flex flex-col lg:flex-row gap-5 font-semibold w-full">

            {/* First Informations Section */}
            <div className="flex flex-col w-full lg:w-1/3">
              <label className="mb-2">Name</label>
              <input
                value={patient.name}
                onChange={(e) =>
                  setPatient((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              />

              <label className="mb-2">Phone Number</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="09\d{8}"
                maxLength={10}
                value={patient.phone_number || ""}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  if (onlyNums.startsWith("09") || onlyNums === "") {
                    const trimmed = onlyNums.slice(0, 10);
                    setPatient((prev) => ({ ...prev, phone_number: trimmed }));
                  }
                }}
                placeholder="Phone Number"
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              />

              <label className="mb-2">Birthdate</label>
              <input
                type="date"
                value={patient.birthdate || ""}
                onChange={(e) =>
                  setPatient((prev) => ({
                    ...prev,
                    birthdate: e.target.value,
                  }))
                }
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              />

              <label className="mb-2">Gender</label>
              <select
                value={patient.gender || ""}
                onChange={(e) =>
                  setPatient((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              >
                <option value="" disabled selected>Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

            </div>

            {/* Second Informations Section */}
            <div className="flex flex-col w-full lg:w-1/3">
              <label className="mb-2">Job</label>
              <input
                placeholder="Add job"
                value={patient.job || ""}
                onChange={(e) =>
                  setPatient((prev) => ({
                    ...prev,
                    job: e.target.value,
                  }))
                }
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              />

              <label className="mb-2">Marital Status</label>
              <select
                value={patient.marital_satus || ""}
                onChange={(e) =>
                  setPatient((prev) => ({ ...prev, marital_satus: e.target.value }))
                }
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5"
              >
                <option value="">Select an option</option>
                <option value="Single">Single</option>
                <option value="Engaged">Engaged</option>
                <option value="Married">Married</option>
              </select>

              <label className="mb-2">Address</label>
              <input
                value={patient.address}
                onChange={(e) =>
                  setPatient((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Address"
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5 max-w-full"
              />

              <label className="mb-2">Social History</label>
              <input
                placeholder="Add social history"
                type="text"
                onChange={(e) =>
                  setPatient((prev) => ({ ...prev, social_history: e.target.value }))
                }
                className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5 max-w-full"
              />
            </div>

            {/* Third Informations Section */}
            <div className="flex flex-col w-full lg:w-1/3">

              <label className="mb-2">Intake Medications</label>
                {intake?.map((med) => (
                  <label key={med.id} className="flex gap-2 items-center text-sm">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                      checked={patient.intake_medications?.includes(med.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPatient((prev) => ({
                          ...prev,
                          intake_medications: checked
                            ? [...prev.intake_medications, med.id]
                            : prev.intake_medications.filter((r) => r !== med.id),
                        }));
                      }}
                    />
                    {med.name}
                  </label>
                ))}

                <label className="mb-2">Dieases</label>
                <div className="flex flex-col gap-1 px-4 mb-5 max-w-full">
                {dieases?.map((diease) => (
                  <label key={diease.id} className="flex gap-2 items-center text-sm">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                      checked={patient.dieases?.includes(diease.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPatient((prev) => ({
                          ...prev,
                          dieases: checked
                            ? [...prev.dieases, diease.id]
                            : prev.dieases.filter((r) => r !== diease.id),
                        }));
                      }}
                    />
                    {diease.name}
                  </label>
                ))}
              </div>
            </div>

          </div>
          {/* Add Employee Button */}
          <div className="flex justify-center w-full">
            <button
              onClick={() => AddPatient()}
              className="px-3 bg-[#089bab] text-white p-1 rounded-xl hover:bg-transparent hover:text-black duration-300 ml-7 border-2 border-[#089bab]"
            >
              Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner When Communicating With Backend */}
      {isLoading && <Loading />}

      {/* State Of The Communicating With Backend (Successfull Or Failure) */}
      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
