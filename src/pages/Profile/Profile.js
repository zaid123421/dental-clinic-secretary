// React & Hooks
import { useEffect, useState } from "react";
// Axios
import axios from "axios";
// Cookies
import Cookies from "universal-cookie";
// Config
import { BaseUrl, ImageUrl } from "../../config";
// Components
import Loading from "../../components/Loading";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

import avatar from "../../assets/avatar.webp";
import error from "../../assets/error.gif";
import successImage from "../../assets/success.gif";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: "", image: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [changePassword, setChangePassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPasswrod, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPasswordError, setOldPasswordError] = useState("");

  const cookie = new Cookies();
  const token = cookie.get("token");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${BaseUrl}/employee/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setProfile(res.data.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Auto-close modal
  useEffect(() => {
    if (modal.isOpen) {
      const timer = setTimeout(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen]);


  // Send New Password
  async function sendNewPassword() {
    setIsLoading(true);
    const formData = new FormData();

    formData.append("old_password", oldPassword);
    formData.append("new_password", newPasswrod);

    try {
      await axios.post(`${BaseUrl}/password/change`, formData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePassword(false);
      setOldPasswordError(null);
      setModal({ isOpen: true, message: "The Password Has Been Changed Successfully !", image: successImage });
    } catch (err){
      console.log(err.response.data.message)
      if (err.response?.data?.message === "Old password is wrong.") {
        setOldPasswordError(err.response.data.message);
      } else {
        setModal({ isOpen: true, message: "Something Went Wrong!", image: error });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Sidebar />
      <div className="page-content p-3 md:py-5 md:p-5 bg-[#089bab1c]">
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg mt-10">
            {profile && (
              <>
                {/* صورة البروفايل */}
                <div className="flex flex-col items-center">
                  <img
                    src={profile.image ? `${ImageUrl}${profile.image}` : avatar}
                    alt="profile"
                    className="w-32 h-32 rounded-full mb-4 border"
                  />
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <span className="text-gray-500 capitalize">{profile.gender}</span>
                </div>

                {/* معلومات الموظف */}
                <div className="mt-6 space-y-3">
                  <p><span className="font-bold mr-3"> Phone:</span> {profile.phone_number || "No Information"}</p>
                  <p><span className="font-bold mr-3"> Birthdate:</span> {profile.birthdate}</p>
                  <p><span className="font-bold mr-3"> Age:</span> {profile.age}</p>
                  <p><span className="font-bold mr-3"> SSN:</span> {profile.ssn || "No Information"}</p>
                  <p><span className="font-bold mr-3"> Address:</span> {profile.address || "No Information"}</p>
                  <p>
                    <span className="font-bold mr-3"> Status:</span>{" "}
                    {profile.is_banned ? "Banned" : "Active"}
                  </p>
                </div>

                {/* الأدوار */}
                <div className="mt-6">
                  <h2 className="font-bold mb-2">Roles:</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#089bab] text-white rounded-full text-sm capitalize"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          <button onClick={() => setChangePassword(true)} className="mt-5 border-2 border-orange-500 bg-orange-500 text-white rounded-2xl px-4 py-1 hover:bg-transparent hover:text-black duration-300">Change Password</button>
        </div>
      </div>

        {changePassword && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
            <div className="bg-white rounded-xl p-5 text-xl items-center shadow-xl w-[500px] relative">
              <h2 className="text-center font-bold text-2xl">Change Password</h2>
              <div className="flex flex-col">

                <label className="mb-2 font-bold">
                  Old Password <span className="ml-1 text-sm text-red-500 font-semibold">required</span>
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5 w-full
                  border border-transparent focus:border-[#089bab] focus:ring-1 focus:ring-[#089bab]"
                />
                {oldPasswordError && <p className="text-red-500 text-sm mb-3 mt-[-10px] font-semibold">{oldPasswordError}</p>}

                <label className="mb-2 font-bold">
                  New Password <span className="ml-1 text-sm text-red-500 font-semibold">required</span>
                </label>
                  <input
                  type="password"
                  value={newPasswrod}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5 w-full
                  border border-transparent focus:border-[#089bab] focus:ring-1 focus:ring-[#089bab]"
                />

                <label className="mb-2 font-bold">
                  Confirm Password <span className="ml-1 text-sm text-red-500 font-semibold">required</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-gray-200 rounded-xl py-1 px-4 outline-none mb-5 w-full
                  border border-transparent focus:border-[#089bab] focus:ring-1 focus:ring-[#089bab']"
                />
                {/* {confirmPasswordError && <p className="text-red-500 text-sm mb-3 mt-[-10px] font-semibold">{confirmPasswordError}</p>} */}

              </div>

              <div className="flex justify-center gap-5">
                <button
                  onClick={() => {
                    setChangePassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setOldPasswordError(null);
                  }}
                  className="bg-gray-400 text-white duration-300 rounded-xl py-1 px-4 outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendNewPassword()}
                  disabled={
                    !oldPassword || !newPasswrod || !confirmPassword || 
                    oldPassword.length < 8 || newPasswrod.length < 8 || confirmPassword.length < 8 ||
                    newPasswrod !== confirmPassword
                  }
                  className={`rounded-xl py-1 px-4 outline-none duration-300
                    ${
                      !oldPassword || !newPasswrod || !confirmPassword || 
                      oldPassword.length < 8 || newPasswrod.length < 8 || confirmPassword.length < 8 ||
                      newPasswrod !== confirmPassword
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#089bab] text-white hover:bg-[#077c89]"
                    }
                  `}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && <Loading />}

        {/* Modal */}
        {modal.isOpen && <Modal message={modal.message} imageSrc={modal.image} />}
    </>
  );
}
