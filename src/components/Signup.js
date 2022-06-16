import React, { useState } from "react";
import { useHistory } from "react-router-dom";

const Signup = (props) => {
  const [credential, setCredential] = useState({ name: "", email: "", password: "", cpassword: "" });

  const onChange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };
  let history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = credential;
    const response = await fetch(`http://localhost:5000/api/auth/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await response.json();
    console.log(json);
    if (json.success) {
      //redirect
      localStorage.setItem("token", json.authtoken);
      history.push("/");
      props.showAlert("Account Created Successfully", "success");
    } else {
      //alert(json.error);
      props.showAlert(json.error, "danger");
    }
  };

  return (
    <div className="container my-3">
      <h2>Create an account to continue to iNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input type="text" className="form-control" value={credential.name} autoComplete="off" id="name" name="name" onChange={onChange} aria-describedby="emailHelp" required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input type="email" className="form-control" value={credential.email} autoComplete="off" id="email" name="email" onChange={onChange} aria-describedby="emailHelp" required />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input type="password" className="form-control" value={credential.password} required minLength={5} id="password" autoComplete="off" onChange={onChange} name="password" />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">
            Confirm Password
          </label>
          <input type="password" className="form-control" value={credential.cpassword} required minLength={5} id="cpassword" autoComplete="off" onChange={onChange} name="cpassword" />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;
