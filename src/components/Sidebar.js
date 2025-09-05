// import components
import Link from "./Link";
import Loading from "./Loading";
// import images
import avatar from "../assets/avatar.webp";
import logout from "../assets/logout.jpg";
// import icons
import { FaArrowRight, FaUsers } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { TbWorld } from "react-icons/tb";
import { MdDateRange } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
// Hooks
import { useState } from "react";
// Cookies
import Cookies from "universal-cookie";
// Axios Library
import axios from "axios";
// Commuunicating With Backend
import { BaseUrl } from "../config";
// react router dom tool
import { useNavigate } from "react-router-dom";
import Confirm from "./Confirm";
import { HiQueueList } from "react-icons/hi2";

export default function Sidebar() {
  // States
    // Loading Spinner To Communicating With Backend
    const [isLoading, setIsLoading] = useState(false);
    // To Make The Sidebar Responsive In Small Screens
    const [responsive, setResponsive] = useState(true);
    // To Show Confirm Logout Box
    const [logutConfirmBox, setLogoutConfirmBox] = useState(false);

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();
  // Get The Username And Token That Stored In The Browser
  const username = cookie.get("username");
  const token = cookie.get("token");

  // Functions

    // To Send Login From To The backend
    async function handleLogout() {
      setIsLoading(true);
      console.log(token);
      try {
        await axios.get(`${BaseUrl}/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        cookie.remove("username");
        cookie.remove("token");
        nav("/");
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
        setLogoutConfirmBox(false);
      }
    }

  return(
    <>

      <div className={`text-sm md:text-lg ${responsive ? `w-[60px]` : 'w-[250px]'} md:w-[250px] text-white bg-[#089bab] h-screen flex flex-col items-center p-5 font-bold fixed z-10 transition-all duration-300`}>
        <button onClick={() => setResponsive(!responsive)} className="md:hidden absolute right-[-15px] top-[10px] text-white bg-[#089bab] w-[20px] h-[50px] rounded-br-lg rounded-tr-lg flex justify-end items-center px-1 "><FaArrowRight className="text-sm" /></button>
        <div
          className={`flex flex-col items-center md:flex mb-2 ${responsive ? 'hidden' : 'flex'}`}
          onClick={() => nav("/employee/profile")}
        >
          <img
            className="w-[75px] h-[75px] md:w-[100px] md:h-[100px] rounded-[50%] cursor-pointer hover:opacity-80"
            src={avatar}
            alt="profile_picture"
          />
          <h1 className="text-[16px] md:text-[20px] font-extrabold mt-5 cursor-pointer hover:underline">
            {username}
          </h1>
          <span className="text-xs text-gray-200 cursor-pointer">A Secretary</span>
        </div>
        <ul>
          <Link to="/queue" label="Queue" responsive={responsive} icon= {<HiQueueList className={`md:mr-3 ${responsive ? '' : 'mr-3'} text-lg md:text-2xl`}/>}/>
          <Link to="/appointments" label="Appointments" responsive={responsive} icon= {<MdDateRange className={`md:mr-3 ${responsive ? '' : 'mr-3'} text-lg md:text-2xl`}/>}/>
          <Link to="/doctors" label="Doctors" responsive={responsive} icon= {<MdDateRange className={`md:mr-3 ${responsive ? '' : 'mr-3'} text-lg md:text-2xl`}/>}/>
          <Link to="/patients" label="Patients" responsive={responsive} icon= {<FaUserDoctor className={`md:mr-3 ${responsive ? '' : 'mr-3'} text-lg md:text-2xl`}/>}/>
          <button
          className={`${responsive ? 'w-full' : 'w-[200px]'} md:w-[220px] p-2 rounded-md cursor-pointer my-2 flex items-center duration-[0.3s] hover:bg-white hover:text-[#089bab]`}
          onClick={() => setLogoutConfirmBox(true)}
          >
            <RiLogoutBoxRLine className={`md:mr-3 ${responsive ? '' : 'mr-3'} text-lg md:text-2xl`}/>
            <span className={`${responsive ? "hidden" : "block"} md:block`}>Logout</span>
          </button>
        </ul>
      </div>

      {/* Show Logout Confirm Box */}
      {logutConfirmBox &&(
        <Confirm
          img={logout}
          label="Do You Want Really To Logout ?"
          onCancel={() => setLogoutConfirmBox(false)}
          onConfirm={() => handleLogout()}
          confirmButtonName="Logout"
        />
      )}

      {/* Loading Spinner When Communicating With Backend */}
      {isLoading && <Loading />}

    </>
  );
}