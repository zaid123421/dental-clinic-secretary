  // Components
  import Button from "../../components/Button";
  import FormInput from "../../components/FormInput";
  import PlusButton from "../../components/PlusButton";
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
  import { FiPlus } from "react-icons/fi";
  // Images
  import successImage from "../../assets/success.gif";
  import error from "../../assets/error.gif";
  import confirmDelete from "../../assets/deleteConfirm.jpg"
  import Unban from "../../assets/UnBan.jpg";
  // Hooks
  import { useEffect, useRef, useState } from "react";
  // Axios Library
  import axios from "axios";
  // Commuunicating With Backend
  import { BaseUrl } from "../../config";
  // Cookies
  import Cookies from "universal-cookie";
  // react router dom tool
  import { useNavigate } from "react-router-dom";

  export default function Users() {
    // States
    // refreshFlag To Refresh The Component After An Event
    const [refreshFlag, setRefreshFlag] = useState(0);
    // SelectedType To Choose The Type Of Data (Employees Or Patients)
    const [selectedType, setSelectedType] = useState("Employees");
    // These Two States To Store The Data From The Backend
    const [employees, setEmployees] = useState(null);
    const [patients, setPatients] = useState(null);
    // Loading Spinner To Communicating With Backend
    const [isLoading, setIsLoading] = useState(false);
    // To Show Ban Box
    const [banBox, setBanBox] = useState(false);
    // To Show UnBan Confirm Box
    const [confirmUnBanBox, setConfirmUnBanBox] = useState(false);
    // To Manipulate Style According To Checked Or Not
    const [isChecked, setIsChecked] = useState(true);
    // These Two States To Show Confirm Delete Box (Employee and Patient)
    const [confirmDeleteEmployee, setConfirmDeleteEmployee] = useState(false);
    const [confirmDeletePatient, setConfirmDeletePatient] = useState(false);
    // Pagination
    const [pagination, setPagination] = useState({
      current_page: 1,
      last_page: null,
    });

    // State To Store Ban Duration If its Exist
    const [banDuration, setBanDuration] = useState({
      duration_unit: "days",
      duration_value: 1,
    });

    // Employee Informations
    const [employee, setEmployee] = useState({
      id: null,
      name: "",
      phone_number: null,
    });

    // Patient Informations
    const [patient, setPatient] = useState({
      id: null,
      name: "",
      phone_number: null,
    });

    // Modal Informations
    const [modal, setModal] = useState({
      isOpen: false,
      message: "",
      image: "",
    });

    // useRef To Store id and url When Need To Communicating Backend
    const banId = useRef(null);
    const banUrl = useRef(null);

    // useNavigate
    const nav = useNavigate();
// State للبحث
const [search, setSearch] = useState("");

// فلترة المرضى حسب الاسم أو رقم الهاتف
const filteredPatients = patients?.filter((patient) =>
  patient.name.toLowerCase().includes(search.toLowerCase()) ||
  patient.phone_number.toString().includes(search)
);
    // Cookies
    const cookie = new Cookies();
    // Get The Token That Stored In The Browser
    const token = cookie.get("token");

    useEffect(() => {
      axios
        .get(`${BaseUrl}/employee`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((data) => {
          setEmployees(data.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, [refreshFlag]);

    useEffect(() => {
      axios
        .get(`${BaseUrl}/patient?page=${pagination.current_page}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((data) => {
          console.log(data);
          setPatients(data.data.data.data);
          setPagination({
            current_page: data.data.data.current_page,
            last_page: data.data.data.last_page
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }, [refreshFlag]);

    useEffect(() => {
      if (modal.isOpen) {
        const timer = setTimeout(() => {
          setModal((prev) => ({ ...prev, isOpen: false }));
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [modal.isOpen]);

    useEffect(() => {
      if (confirmDeleteEmployee || confirmDeletePatient || banBox) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [confirmDeleteEmployee, confirmDeletePatient, banBox]);

  async function DeleteEmployee() {
    setIsLoading(true);
    try {
      await axios.delete(`${BaseUrl}/employee/${employee.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setRefreshFlag((prev) => prev + 1);
      setModal({
        isOpen: true,
        message: "The Employee Has Been Deleted Successfully !",
        image: successImage,
      });
    } catch {
      setModal({
        isOpen: true,
        message: "Something Went Wrong !",
        image: error,
      });
    } finally {
      setConfirmDeleteEmployee(false);
      setIsLoading(false);
    }
  }

  async function DeletePatient() {
    setIsLoading(true);
    try {
      await axios.delete(`${BaseUrl}/patient/${patient.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setRefreshFlag((prev) => prev + 1);
      setModal({
        isOpen: true,
        message: "The Patient Has Been Deleted Successfully !",
        image: successImage,
      });
    } catch {
      setModal({
        isOpen: true,
        message: "Something Went Wrong !",
        image: error,
      });
    } finally {
      setConfirmDeletePatient(false);
      setIsLoading(false);
    }
  }

  function hanldeIncremetPage() {
    if(pagination.current_page < pagination.last_page) {
      setPagination((prev) => ({
        ...prev,
        current_page: pagination.current_page + 1
      }))
      setRefreshFlag((prev) => prev + 1)
    }
  }

  function handleDecrementPage() {
    if(pagination.current_page > 1) {
      setPagination((prev) => ({
        ...prev,
        current_page: pagination.current_page - 1
      }))
      setRefreshFlag((prev) => prev + 1)
    }
  }

  const showPatients = filteredPatients?.map((patient, index) => (
    <tr
      key={patient.id}
      onClick={() => nav(`/show-patient?patientId=${patient.id}`)}
      className={`p-3 ${
        index !== filteredPatients.length - 1
          ? "border-b-[1px] border-b-gray-300"
          : ""
      } text-center font-semibold bg-white hover:text-white hover:bg-[#089bab] cursor-pointer`}
    >
      <td className={`p-3 ${index === filteredPatients.length - 1 ? "rounded-bl-2xl" : ""}`}>
        {patient.name}
      </td>
      <td className="p-3">{patient.phone_number}</td>
      <td
        className={`${
          patient.balance > 0
            ? "text-green-500"
            : patient.balance < 0
            ? "text-red-500"
            : "text-gray-500"
        }`}
      >
        {patient.balance.toLocaleString()}
      </td>
      <td className="p-3">
        {patient.is_banned ? (
          <FaBan className="text-2xl text-red-500 cursor-pointer justify-self-center" />
        ) : (
          <GoDash className="text-2xl text-green-500 cursor-pointer justify-self-center" />
        )}
      </td>
      <td className={`p-3 ${index === filteredPatients.length - 1 ? "rounded-br-2xl" : ""}`}>
        <MdDelete
          onClick={(e) => {
            e.stopPropagation();
            setPatient((prev) => ({
              ...prev,
              id: patient.id,
              name: patient.name,
            }));
            setConfirmDeletePatient(true);
          }}
          className="text-2xl text-red-500 hover:text-red-700 duration-300 cursor-pointer justify-self-center"
        />
      </td>
    </tr>
  ));

    return (
      <>

        <Sidebar />
        <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
          <Title label="Users" />
          <div className="mt-3 flex items-center">
            <Button
              onClick={() => nav(`/add-patient`)}
              className="hidden md:flex"
              variant="primary"
              icon={<FiPlus className="mr-3 text-2xl" />}
              children="Add Patient"
            />
            <Button
              onClick={() => nav(`/add-patient`)}
              className="flex md:hidden"
              variant="plus"
              icon={<FiPlus className="text-2xl" />}
            />
            <FormInput
            icon={<IoIosSearch className="text-black text-lg" />}
            placeholder="Search by name or phone"
            className="w-full md:w-[250px] bg-white border-[#089bab] placeholder-black shadow-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto shadow-xl rounded-2xl mt-5">
            <table className="w-full bg-transparent">
              <thead className="font-bold bg-gray-300">
                <th className="p-3 rounded-tl-2xl">Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Payments</th>
                <th className="p-3">Banned</th>
                <th className="py-3 rounded-tr-2xl ">Delete</th>
              </thead>
              <tbody className="rounded-2xl">
                {!patients || patients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 bg-white  font-semibold p-5">
                      No Patients Yet
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 bg-white font-semibold p-5">
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  showPatients
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {!patients || patients.length === 0 ? (
            <p className="text-center text-gray-500 font-semibold mt-5">
              No Patients Yet
            </p>
          ) : (
            <div className="flex justify-center items-center w-full mt-5 text-xl">
              {/* Previous Page Button */}
              <button
                onClick={handleDecrementPage}
                disabled={pagination.current_page === 1 || pagination.last_page === 1}
                className={`w-[25px] h-[25px] rounded-full flex justify-center items-center border-2 duration-300 
                  ${pagination.current_page === 1 || pagination.last_page === 1
                    ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                    : "bg-[#089bab] border-[#089bab] text-white hover:bg-transparent hover:text-black"
                  }`}
              >
                <GoDash className="text-sm" />
              </button>

              <span className="text-2xl font-semibold mx-5">
                {pagination.current_page}
              </span>

              {/* Next Page Button */}
              <button
                onClick={hanldeIncremetPage}
                disabled={pagination.current_page === pagination.last_page || pagination.last_page === 1}
                className={`w-[25px] h-[25px] rounded-full flex justify-center items-center border-2 duration-300 
                  ${pagination.current_page === pagination.last_page || pagination.last_page === 1
                    ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                    : "bg-[#089bab] border-[#089bab] text-white hover:bg-transparent hover:text-black"
                  }`}
              >
                <FiPlus className="text-sm" />
              </button>
            </div>
          )}

        </div>


        {/* Show Delete Employee Confirm Box */}
        {confirmDeleteEmployee && (
          <Confirm
            img={confirmDelete}
            label={<>Do You Want Really To Delete <span className="font-bold">{employee.name}</span> ?</>}
            onCancel={() => setConfirmDeleteEmployee(false)}
            onConfirm={() => DeleteEmployee()}
          />
        )}

        {/* Show Delete Patient Confirm Box */}
        {confirmDeletePatient && (
          <Confirm
            img={confirmDelete}
            label={<>Do You Want Really To Delete <span className="font-bold">{patient.name}</span> ?</>}
            onCancel={() => setConfirmDeletePatient(false)}
            onConfirm={() => DeletePatient()}
          />
        )}

        {/* Loading Spinner When Communicating With Backend */}
        {isLoading && <Loading />}

        {/* State Of The Communicating With Backend (Successfull Or Failure) */}
        {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}

      </>
    );
  }
