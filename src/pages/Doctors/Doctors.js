// Components import
import Button from "../../components/Button";
import FormInput from "../../components/FormInput";
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import Confirm from "../../components/Confirm";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";

// Icons
import { MdDelete } from "react-icons/md";
import { FaBan } from "react-icons/fa";
import { GoDash } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import { FiPlus, FiFilter } from "react-icons/fi";
import { IoIosNotifications } from "react-icons/io";

// Images
import successImage from "../../assets/success.gif";
import error from "../../assets/error.gif";
import confirmDelete from "../../assets/deleteConfirm.jpg";

// Hooks
import { useEffect, useRef, useState } from "react";

// Axios Library
import axios from "axios";

// Communicating With Backend
import { BaseUrl } from "../../config";

// Cookies
import Cookies from "universal-cookie";

// react router dom tool
import { useNavigate } from "react-router-dom";

export default function Doctors() {
  // States
  const [doctors, setDoctors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: "", image: "" });

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // Fetch Doctors
  useEffect(() => {
    axios
      .get(`${BaseUrl}/doctor`, {
        headers: {
          "ngrok-skip-browser-warning": true,
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDoctors(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });

  }, [token]);

  // Auto-close modal
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);

  // Show Doctors rows
  const showDoctors = doctors?.map((doctor, index) => (
    <tr
      key={doctor.id}
      onClick={() => nav(`/doctor?doctorId=${doctor.id}`)}
      className={`p-3 ${index !== doctors.length - 1 ? "border-b-[1px] border-b-gray-300" : ""} text-center font-semibold bg-white hover:text-white hover:bg-[#089bab] cursor-pointer`}
    >
      <td className={`p-3 ${index === doctors.length - 1 ? "rounded-bl-2xl" : ""}`}>{doctor.name}</td>
      <td className="p-3">{doctor.phone_number}</td>
      <td className="p-3">{doctor.birthdate}</td>
      <td className="p-3">
        {doctor.is_banned ? <FaBan className="text-2xl text-red-500 justify-self-center" /> : <GoDash className="text-2xl text-green-500 justify-self-center" />}
      </td>
    </tr>
  ));

  return (
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        <Title label="Doctors" />

        {/* Doctors table */}
        <div className="overflow-x-auto shadow-xl rounded-2xl mt-5">
          <table className="w-full bg-transparent">
            <thead className="font-bold bg-gray-300">
              <tr>
                <th className="p-3 rounded-tl-2xl">Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Birthdate</th>
                <th className="p-3">Banned</th>
              </tr>
            </thead>
            <tbody className="rounded-2xl">
              {!doctors || doctors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 bg-white font-semibold p-5">
                    No Doctors Yet
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 bg-white font-semibold p-5">
                    No Results Found
                  </td>
                </tr>
              ) : (
                showDoctors
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Loading */}
      {isLoading && <Loading />}

      {/* Modal */}
      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
