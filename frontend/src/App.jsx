import { useState } from "react";

import "./App.css";

function App() {
  // change state to an empty array to store fetched records
  const [expenses, setExpenses] = useState([]);

  //create the function to talk to deno backend
  const fetcRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/records");
      if (!response.ok) {
        throw new Error("Failed to fetch records :(");
      }
      console.log(response);
      const data = await response.json(); // turn the json string into a js array

      setExpenses(data); //save the array into the state
    } catch (error) {
      console.error("error fetching data:", error);
    }
  };

  return (
    <>
      {/* add the function to the onclick handler */}
      <button onClick={fetcRecords}>View Records</button>

      {/* 4. Display the records on the screen once they are loaded */}
      <div style={{ marginTop: "20px" }}>
        {expenses.length === 0 ? (
          <p>No records loaded yet. Click the button!</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {/* FIX: Put the parentheses around (expense) before the arrow */}
            {expenses.map((expense) => (
              <li
                key={expense.id}
                style={{ margin: "10px 0", textAlign: "left" }}
              >
                {/* Changed expense.category to expense.date to match your JSON */}
                <strong>{expense.description}</strong> - ${expense.amount} (
                {expense.date})
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
