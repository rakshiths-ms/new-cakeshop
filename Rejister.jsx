import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AlignCenter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Register = () => {
  const nav = useNavigate();
  const [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    axios
      .post("http://13.60.105.205:5000/api/register", data)
      .then((res) => {
        console.log(res.data.data);
        nav("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <div className="bg-black w-auto h-screen ">
      <div className="pt-[15vh]">
        <div className="mx-22">
          <img src="logo.png" alt="" width={200} />
        </div>
        <div className="p-3">
          <input
            type="text"
            id="btncolor1"
            className="w-[100%] p-2.5 rounded-[10px] text-white font-semibold"
            placeholder="Enter your name"
            name="name"
            value={data.name}
            onChange={handleChange}
          />
          <input
            type="text"
            id="btncolor1"
            className="w-[100%] p-2.5 rounded-[10px] mt-5  text-white font-semibold"
            placeholder="Enter the user name"
            name="username"
            value={data.username}
            onChange={handleChange}
          />
          <input
            type="text"
            id="btncolor1"
            className="w-[100%] p-2.5 rounded-[10px] mt-5  text-white font-semibold"
            placeholder="Enter the email"
            name="email"
            value={data.email}
            onChange={handleChange}
          />
          <input
            type="password"
            id="btncolor1"
            className="w-[100%] p-2.5 rounded-[10px] mt-5  text-white font-semibold"
            placeholder="Enter the password"
            name="password"
            value={data.password}
            onChange={handleChange}
          />
          <div
            className="w-[100%] p-2.5 rounded-[10px] mt-5 bg-blue-400 text-center font-semibold text-white"
            onClick={handleSubmit}
          >
            Enter
          </div>
          <div className="text-center mt-5">
            <p className="text-gray-400 font-semibold text-[13px]">
              Already have account?{" "}
              <Link className="text-blue-400" to={"/login"}>
                login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

