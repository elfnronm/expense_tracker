import { useState } from "react";
import { supabase } from "./supabaseClient.js";

function Auth() {
  //store what the user types in the email/password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // toggle between sign up mode and log in mode
  const [isSignUp, setIsSignUp] = useState(false);

  // store any error message to show the user
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); //stop page reload
    setError(""); //clear any previous error before trying again

    try {
      if (isSignUp) {
        //create a new account with supabase auth
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error; // if supabase returns an error, jump to catch block
        alert("check your email to confirm your account!");
      } else {
        // login with an existing account
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      //show the error message to user
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      {/* heading changes depending on mode */}
      <h2>{isSignUp ? "Sign Up" : "Log in"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        ></input>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        ></input>

        {/* only show error paragraph if there is an error */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" className="save-btn">
          {isSignUp ? "Sign up" : "Log in"}
        </button>
      </form>

      {/* link to switch between login and signup */}
      <button onClick={() => setIsSignUp(!isSignUp)} className="cancel-btn">
        {isSignUp
          ? "Already have an account ? Log in"
          : "Need an account? sign up"}
      </button>
    </div>
  );
}

export default Auth;
