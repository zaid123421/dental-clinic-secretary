import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import Model from "../../components/Modal";
import failureImage from "../../assets/error.gif";
import { BaseUrl } from "../../config";

export default function RequireAuth() {
  const cookies = new Cookies();
  const [isValid, setIsValid] = useState(true);
  const [failed, setFailed] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const token = cookies.get("token");
    if (token) {
      checkTokenValidity(token);
    } else {
      handleInvalidToken();
    }
  }, []);

  const checkTokenValidity = (token) => {
    fetch(`${BaseUrl}/medication`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      console.log(res);
      if (!res.ok) {
        handleInvalidToken();
      }
    });
  };

  const handleInvalidToken = () => {
    cookies.remove("token");
    setIsValid(false);
    setFailed(true);
    setTimeout(() => {
      nav("/");
    }, 3000);
  };

  if (failed) {
    return <Model message="Something Went Wrong !" imageSrc={failureImage} />;
  }

  return isValid ? <Outlet /> : <Navigate to="/" />;
}
