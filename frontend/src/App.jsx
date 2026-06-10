import { useState } from "react";
import { fetchAllRecords, createRecord, deleteRecord } from "./api.js";
import "./App.css";

function App() {
  // change state to an empty array to store fetched records
  const [expenses, setExpenses] = useState([]); // each record is one expense and the expenses -> [expense 1 , expense 2]
  // expense1 : { "id": 1, "description": "book", "amount": 20, "date": "2026-06-05" }
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // GET handler
  const handleViewRecords = async () => {
    try {
      const data = await fetchAllRecords();
      setExpenses(data);
    } catch (error) {
      alert("could not load records. is the server running?", error);
    }
  };

  // POST handler
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      const savedRecord = await createRecord(description, amount);
      console.log(e);

      //update UI list layout
      setExpenses([...expenses, savedRecord]);
      setDescription(""); //reset form fields
      setAmount("");
    } catch (error) {
      alert("could not save your expense");
    }
  };

  // DELETE handler
  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      //send request to backend server
      await deleteRecord(id);

      //UPDATE THE UI : filter out the deleted record by its id
      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("could not delete your expense, please try again later");
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Add Item
        </button>
      )}
      {isOpen && (
        <form onSubmit={handleAddRecord}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          ></input>

          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          ></input>

          <button type="submit">Submit record</button>
          <button
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <button onClick={handleViewRecords}>View Records</button>
      <div className="records-container">
        {expenses.length === 0 ? (
          <p className="empty-message">No records yet, click to button </p>
        ) : (
          <ul className="records-list">
            {expenses.map((expense) => (
              <li key={expense.id} className="record-item">
                <span className="record-text">
                  <strong>{expense.description}</strong> - ${expense.amount} (
                  {expense.date})
                </span>

                <button>Edit Record</button>
                <button onClick={() => handleDeleteRecord(expense.id)}>
                  Delete Record
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
