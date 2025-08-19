// Components
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
// Images
import Manager from "../../assets/Manager.webp";
// Hooks
import { useState } from "react";
// Axios Library
import axios from "axios";
// To Communicating With Backend
import { BaseUrl } from "../../config";
// react router dom tool
import { useNavigate } from "react-router-dom";
// Cookies
import Cookies from "universal-cookie";

export default function Login() {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });
  const [error, setError] = useState(""); // <-- لإظهار رسالة الخطأ

  // useNavigate
  const nav = useNavigate();

  // Cookies
  const cookie = new Cookies();

  // Functions
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // يمسح رسالة الخطأ عند التعديل
  };

  async function Submit() {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BaseUrl}/receptionist/login`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      cookie.set("token", res.data.data.token, { path: "/" });
      cookie.set("username", res.data.data.name, { path: "/" });
      nav("/patients");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid phone number or password");
      } else {
        setError("An unexpected error occurred, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* The Main Container */}
      <div className="flex items-center justify-center h-screen bg-[#089bab1c] md:p-5">
        <div className="flex flex-col-reverse md:flex-row bg-white w-full h-full md:w-[900px] md:h-[500px] rounded-2xl shadow-2xl ">
          {/* Main Section */}
          <div className="flex-1 flex flex-col">
            <p className="mt-5 md:mt-10 mb-3 text-2xl font-bold text-center">
              Sign in
            </p>
            {/* Form */}
            <form
              className="p-3 md:p-10"
              onSubmit={(e) => {
                e.preventDefault();
                Submit();
              }}
            >
              <FormInput
                className="w-full bg-[#089bab1c]"
                autoFocus
                name="phone_number"
                label="Phone Number"
                type="number"
                placeholder="Enter Phone Number"
                onChange={handleChange}
              />
              <FormInput
                className="w-full bg-[#089bab1c]"
                name="password"
                label="Password"
                type="password"
                placeholder="Enter Your Password"
                onChange={handleChange}
              />

              {error && (
                <p className="text-red-500 font-semibold mt-3">{error}</p>
              )}

              <Button variant="primary" className="mt-10 w-full">
                Sign in
              </Button>
            </form>
          </div>

          {/* Image Section */}
          <div className="md:flex-1 flex justify-center mb-2 md:mb-0 mt-10 md:mt-0">
            <img
              className="w-[100px] h-[100px] md:w-full md:h-full object-cover rounded-2xl"
              src={Manager}
              alt="manager"
            />
          </div>
        </div>
      </div>

      {isLoading && <Loading />}
    </>
  );
}
