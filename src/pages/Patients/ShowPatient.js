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
import error from "../../assets/error.gif";

export default function ShowEmployee() {
  // States
    // refreshFlag To Refresh The Component After An Event
    const [refreshFlag, setRefreshFlag] = useState(0);
    const [patient, setPatient] = useState(null);
    const [transactions, setTransactions] = useState(null);
    const [pagination, setPagination] = useState({
      current_page: 1,
      last_page: null,
    });
    const [errorMessage, setErrorMessage] = useState("");
    // Loading Spinner To Communicating With Backend
    const [isLoading, setIsLoading] = useState(false);
    // Modal Inforomations
    const [modal, setModal] = useState({
      isOpen: false,
      message: "",
      image: "",
    });
    const [addTransaction, setAddTransaction] = useState(false);

    const [transaction, setTransaction] = useState({
      type: "",
      amount: null,
      note: null,
    });

  // useRef
  const balance = useRef();

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
  const token = cookie.get("token");

  // useLocation
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const patientId = params.get("patientId");

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
      axios
        .get(`${BaseUrl}/patient/${patientId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((data) => {
          setPatient(data.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, []);

    useEffect(() => {
      if (addTransaction) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [addTransaction]);

    useEffect(() => {
      axios
        .get(`${BaseUrl}/patient/${patientId}/account/transactions?page=${pagination.current_page}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((data) => {
          setTransactions(data.data.data.transactions.data);
          setPagination({
            current_page: data.data.data.transactions.current_page,
            last_page: data.data.data.transactions.last_page
          });
          balance.current = data.data.data.balance;
        })
        .catch((error) => {
          console.log(error);
        });
    }, [refreshFlag]);

  const showTransactions = transactions?.map((transaction, index) => (
    <div key={index} className={`${transaction.type === "debit" ? "bg-red-600" : "bg-green-600"} mt-3 p-5 rounded-lg text-white`}>
      <div className="flex flex-wrap justify-between">
        <span className="mr-3">{transaction.amount?.toLocaleString()}</span>
        <span>{transaction.type}</span>
      </div>
      <div className="flex flex-col">
        <span>{transaction.created_by}</span>
        <span>{transaction.created_at}</span>
        <span>{transaction.note}</span>
      </div>
    </div>
  ));

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

  async function transactionRequest() {
    if (transaction.type === "withdraw" && transaction.amount > balance.current) {
      setErrorMessage("The withdrawal amount is greater than the patient balance!");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    const formData = new FormData();
    if (transaction.amount) formData.append("amount", transaction.amount);
    if (transaction.note) formData.append("note", transaction.note);
    try {
      await axios.post(`${BaseUrl}/patient/${patientId}/account/${transaction.type === "deposit" ? "deposit" : "withdraw"}`, formData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setAddTransaction(false);
      setRefreshFlag((prev) => prev + 1);
      setModal({
        isOpen: true,
        message: "The Transaction Has Been Added Successfully !",
        image: successImage,
      });
      setTransaction({
        type: "",
        amount: null,
        note: null,
      })
    } catch {
      setModal({
        isOpen: true,
        message: "Something Went Wrong !",
        image: error,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c] overflow-hidden">

        {/* Introduction */}
        <div className="flex items-center">
          <IoIosArrowBack onClick={() => nav("/patients")} className="text-2xl cursor-pointer duration-300 hover:text-[#089bab]"/>
          <Title className="flex-1" label="Patient Infomation" />
        </div>
        {/* Buttons */}
        <div className="mt-2">
          <Button
          onClick={() => setAddTransaction(true)}
          className="hidden md:flex"
          variant="primary"
          icon={<FiPlus className="mr-3 text-2xl" />}
          children="Add Transaction"
        />
          <Button
            onClick={() => setAddTransaction(true)}
            className="flex md:hidden"
            variant="plus"
            icon={<FiPlus className="text-2xl" />}
          />
        </div>

        <div className="font-semibold text-xl lg:p-5 flex flex-col lg:flex-row mt-5 lg:mt-0">
          <div>
            <div>
              <label className="mr-5 font-bold">Name:</label>
              <label>{patient?.name}</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Phone:</label>
              <label>{patient?.phone_number}</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Address:</label>
              <label>{patient?.address || "Qudsaya Suburb, Damascus"}</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Gender:</label>
              <label>{patient?.gender}</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Birthdate:</label>
              <label>{patient?.birthdate} ({patient?.age})</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Ban:</label>
              <label>
                {patient?.is_banned === true ? (
                  patient.ban_expired_at === null ? (
                    <span className="text-red-600">Banned Forever</span>
                  ) : (
                    <>
                      <span>
                        Ban Expired At <span className="text-orange-500">{patient?.ban_expired_at?.slice(0, 10)}</span>
                      </span>{" "}
                      <span className="text-blue-600">
                        {patient?.ban_expired_at?.slice(11, 19)}
                      </span>
                    </>
                  )
                ) : (
                  <span className="text-green-600">Not Banned</span>
                )}
              </label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Job:</label>
              <label >{patient?.job || "No Information"}</label>
            </div>
            <div className="mt-5">
              <label className="mr-5 font-bold">Marital Status:</label>
              <label >{patient?.marital_status || "No Information"}</label>
            </div>
            <div className="mt-5">
              <button onClick={() => nav(`/show-patient-appointments?patientId=${patientId}`)} className="bg-orange-500 px-4 py-2 rounded-2xl text-base hover:bg-orange-600 duration-300 text-white">Show Patient Appointments</button>
            </div>
          </div>
          <div className="mt-5 lg:mt-0 lg:ml-[125px]">
            <div className="flex flex-col">
            <label className="font-bold">{patient?.diseases.length === 0 ? "No Diseases" : "Diseases"}</label>
              {patient?.diseases?.map((diease) => (
              <li className="ml-2">{diease.name}</li>
            ))}
            <label className="font-bold mt-5">{patient?.intake_medications.length === 0 ? "No Intake Medications" : "Intake Medications"}</label>
              {patient?.intake_medications?.map((intake) => (
              <li className="ml-2">{intake.name}</li>
            ))}
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-5 mt-5 lg:mt-0 lg:ml-7 flex-1">
            <span className="font-bold mb-5">Transcations</span>
            <div>
              <p>Balance: <span className={`${balance.current > 0 ? "text-green-600" : balance.current < 0 ? "text-red-500" : "text-gray-500"}`}>{balance.current?.toLocaleString()}</span></p>
            </div>
            {showTransactions}
            {/* Pagination Section */}
            {transactions?.length === 0 ? (
              <p className="text-center text-gray-500 font-semibold mt-5">
                No Transactions Yet
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
        </div>
      </div>

      {/* Add Transaction Box */}
      {addTransaction && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl p-5 text-xl flex flex-col items-center shadow-xl w-[500px]">
            <div className=" mb-5 w-full">
              <h1 className="font-bold text-2xl text-center">
                Add Transaction
              </h1>
              <div className="flex flex-col mt-3 font-semibold">
                <label className="px-4 mb-2">Type Of Transaction</label>
                <select
                  value={transaction.type}
                  onChange={(e) =>
                    setTransaction((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="border-2 border-transparent focus:border-[#089bab] bg-gray-300 rounded-xl px-3 py-1 outline-none cursor-pointer"
                >
                  <option value="disabled">Select Type</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                </select>
              </div>
              <div className="flex flex-col font-semibold mt-3">
                <label className="px-4 mb-2">Amount</label>
                <input
                  disabled={transaction.type === "disabled" || transaction.type === ""}
                  name="amount"
                  value={transaction.amount}
                  onChange={(e) =>
                    setTransaction((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="Add transaction amount"
                  className={`${transaction.type === "disabled" || transaction.type === "" ? "cursor-not-allowed" : ""} placeholder:text-base outline-none border-2 border-transparent focus:border-[#089bab] bg-gray-200 rounded-xl py-1 px-4`}
                />
                {errorMessage && (
                  <p className="text-red-600 text-sm font-semibold mt-1 ml-2">
                    {errorMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-col font-semibold mt-3">
                <label className="px-4 flex-1 mb-2">Note</label>
                <input
                  disabled={transaction.type === "disabled" || transaction.type === ""}
                  name="note"
                  value={transaction.note}
                  onChange={(e) =>
                    setTransaction((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Add transaction note"
                  className={`${transaction.type === "disabled" || transaction.type === "" ? "cursor-not-allowed" : ""} placeholder:text-base outline-none border-2 border-transparent focus:border-[#089bab] bg-gray-200 rounded-xl py-1 px-4`}
                />
              </div>
            </div>

            <div className="flex justify-center w-full mt-5">
              <button
                onClick={() => {
                  setAddTransaction(false);
                  setErrorMessage("");
                  setTransaction({
                    type: "",
                    amount: null,
                    note: null,
                  })
                }}
                className="w-[85px] bg-[#9e9e9e] border-2 border-[#9e9e9e] p-1 rounded-xl text-white hover:bg-transparent hover:text-black duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => transactionRequest()}
                disabled={!transaction.amount}
                className={`w-[85px] p-1 rounded-xl ml-7 border-2 duration-300 
                  ${!transaction.amount 
                    ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed" 
                    : "bg-[#089bab] border-[#089bab] text-white hover:bg-transparent hover:text-black"
                  }`}
              >
                Add
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