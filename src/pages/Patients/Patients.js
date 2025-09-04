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

export default function Users() {
  // States
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [patients, setPatients] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeletePatient, setConfirmDeletePatient] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: null });
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // فلتر واحد مفعل
  const [patient, setPatient] = useState({ id: null, name: "", phone_number: null });
  const [modal, setModal] = useState({ isOpen: false, message: "", image: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // Fetch patients
  useEffect(() => {
    const controller = new AbortController();

    let url = `${BaseUrl}/patient?page=${pagination.current_page}`;

    if (search) {
      url = `${BaseUrl}/patient?filter[search]=${search}&page=${pagination.current_page}`;
    } else if (activeFilter === "has_treatment") {
      url = `${BaseUrl}/patient?filter[has_treatment]=true&page=${pagination.current_page}`;
    } else if (activeFilter === "has_due") {
      url = `${BaseUrl}/patient?filter[has_due]=true&page=${pagination.current_page}`;
    }

    axios
      .get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      })
      .then((res) => {
        setPatients(res.data.data.data);
        setPagination({
          current_page: res.data.data.current_page,
          last_page: res.data.data.last_page,
        });
      })
      .catch((error) => {
        if (error.name === "CanceledError") {
          console.log("Request aborted");
        } else {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [refreshFlag, pagination.current_page, token, search, activeFilter]);

  // Body overflow for confirm delete
  useEffect(() => {
    document.body.style.overflow = confirmDeletePatient ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [confirmDeletePatient]);

  // Auto-close modal
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);

  // Delete patient
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
      setModal({ isOpen: true, message: "The Patient Has Been Deleted Successfully !", image: successImage });
    } catch {
      setModal({ isOpen: true, message: "Something Went Wrong !", image: error });
    } finally {
      setConfirmDeletePatient(false);
      setIsLoading(false);
    }
  }

  // Pagination
  function hanldeIncremetPage() {
    if (pagination.current_page < pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: pagination.current_page + 1 }));
      setRefreshFlag((prev) => prev + 1);
    }
  }

  function handleDecrementPage() {
    if (pagination.current_page > 1) {
      setPagination((prev) => ({ ...prev, current_page: pagination.current_page - 1 }));
      setRefreshFlag((prev) => prev + 1);
    }
  }

  // Filtered patients
  const filteredPatients = patients?.filter(
    (p) =>
      p.name.toLowerCase().startsWith(search.toLowerCase()) ||
      p.phone_number.toString().startsWith(search)
  );

  // Show patients rows
  const showPatients = filteredPatients?.map((patient, index) => (
    <tr
      key={patient.id}
      onClick={() => nav(`/show-patient?patientId=${patient.id}`)}
      className={`p-3 ${index !== filteredPatients.length - 1 ? "border-b-[1px] border-b-gray-300" : ""} text-center font-semibold bg-white hover:text-white hover:bg-[#089bab] cursor-pointer`}
    >
      <td className={`p-3 ${index === filteredPatients.length - 1 ? "rounded-bl-2xl" : ""}`}>{patient.name}</td>
      <td className="p-3">{patient.phone_number}</td>
      <td className={`${patient.balance > 0 ? "text-green-500" : patient.balance < 0 ? "text-red-500" : "text-gray-500"}`}>
        {patient.balance.toLocaleString()}
      </td>
      <td className="p-3">
        {patient.is_banned ? <FaBan className="text-2xl text-red-500 justify-self-center" /> : <GoDash className="text-2xl text-green-500 justify-self-center" />}
      </td>
      <td className={`p-3 ${index === filteredPatients.length - 1 ? "rounded-br-2xl" : ""}`}>
        <MdDelete
          onClick={(e) => {
            e.stopPropagation();
            setPatient({ id: patient.id, name: patient.name, phone_number: patient.phone_number });
            setConfirmDeletePatient(true);
          }}
          className="text-2xl text-red-500 hover:text-red-700 duration-300 cursor-pointer justify-self-center"
        />
      </td>
    </tr>
  ));

  // Filters list for dropdown
  const filters = [
    { label: "All", value: "" },
    { label: "Has Treatment", value: "has_treatment" },
    { label: "Has Due", value: "has_due" },
  ];

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        <Title label="Users" />

        <div className="mt-3 flex items-center gap-3 flex-wrap">

          <Button
            onClick={() => nav("/add-patient")}
            className="hidden md:flex max-w-[200px] mr-0"
            variant="primary"
            icon={<FiPlus className="mr-3 text-2xl" />}
            children="Add Patient"
          />
          <Button
            onClick={() => nav("/add-patient")}
            className="flex md:hidden"
            variant="plus"
            icon={<FiPlus className="text-2xl" />}
          />

          {/* Search input */}
          <div className="flex flex-col w-fit">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <IoIosSearch className="text-black text-lg" />
                </div>
              <input
                className={`
                  px-4 py-1 border-transparent border-[2px] outline-none rounded-lg focus:border-[#089bab]
                  w-full md:w-[250px] bg-white border-[#089bab] placeholder-black shadow-lg pl-10
                `}
                value={search}
                placeholder="Search by name or phone"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown filter */}
          <div className="relative inline-block text-center shadow-lg rounded-xl" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border-none shadow-lg inline-flex justify-center items-center px-4 py-[6px] bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100"
            >
              <FiFilter className="mr-2 text-lg" />
              {activeFilter
                ? filters.find((f) => f.value === activeFilter)?.label
                : "Filter"}
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
                      setPagination((prev) => ({ ...prev, current_page: 1 }));
                      setRefreshFlag((prev) => prev + 1);
                      setSearch("");
                      setIsDropdownOpen(false);
                    }}
                  >
                    {filter.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Patients table */}
        <div className="overflow-x-auto shadow-xl rounded-2xl mt-5">
          <table className="w-full bg-transparent">
            <thead className="font-bold bg-gray-300">
              <tr>
                <th className="p-3 rounded-tl-2xl">Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Payments</th>
                <th className="p-3">Banned</th>
                <th className="py-3 rounded-tr-2xl">Delete</th>
              </tr>
            </thead>
            <tbody className="rounded-2xl">
              {!patients || patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 bg-white font-semibold p-5">
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

        {/* Pagination */}
        {!patients || patients.length === 0 ? null : (
          <div className="flex justify-center items-center w-full mt-5 text-xl gap-3">
            <button
              onClick={handleDecrementPage}
              disabled={pagination.current_page === 1 || pagination.last_page === 1}
              className={`w-[25px] h-[25px] rounded-full flex justify-center items-center border-2 duration-300 ${
                pagination.current_page === 1 || pagination.last_page === 1
                  ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                  : "bg-[#089bab] border-[#089bab] text-white hover:bg-transparent hover:text-black"
              }`}
            >
              <GoDash className="text-sm" />
            </button>

            <span className="text-2xl font-semibold">{pagination.current_page}</span>

            <button
              onClick={hanldeIncremetPage}
              disabled={pagination.current_page === pagination.last_page || pagination.last_page === 1}
              className={`w-[25px] h-[25px] rounded-full flex justify-center items-center border-2 duration-300 ${
                pagination.current_page === pagination.last_page || pagination.last_page === 1
                  ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                  : "bg-[#089bab] border-[#089bab] text-white hover:bg-transparent hover:text-black"
              }`}
            >
              <FiPlus className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      {confirmDeletePatient && (
        <Confirm
          img={confirmDelete}
          label={
            <>
              Do You Want Really To Delete <span className="font-bold">{patient.name}</span> ?
            </>
          }
          onCancel={() => setConfirmDeletePatient(false)}
          onConfirm={DeletePatient}
        />
      )}

      {/* Loading */}
      {isLoading && <Loading />}

      {/* Modal */}
      {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
