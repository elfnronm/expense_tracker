import { useState } from "react";
import {
  fetchAllRecords,
  createRecord,
  deleteRecord,
  patchRecord,
} from "./api.js";
import "./App.css";

function App() {
  // change state to an empty array to store fetched records
  const [expenses, setExpenses] = useState([]); // each record is one expense and the expenses -> [expense 1 , expense 2]
  // expense1 : { "id": 1, "description": "book", "amount": 20, "date": "2026-06-05" }
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingID, setEditingID] = useState(null);

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

  // PATCH handler
  //trigger this function when clicking the edit record button
  const handleStartEdit = (expense) => {
    setEditingID(expense.id); //tell react which item layout to switch
    setDescription(expense.description); // pre fill the description input box
    setAmount(expense.amount); // pre fill the amount input box
  };

  //cancel current editing action
  const handleCancelEdit = () => {
    setEditingID(null);
    setDescription("");
    setAmount("");
  };

  const handlePatchRecord = async (e, id) => {
    e.preventDefault(); //stop page reload
    if (!description || !amount) return;

    try {
      //send changes to backend file
      const updatedData = { description, amount: Number(amount) };
      const savedUpdatedRecord = await patchRecord(id, updatedData);

      //update the UI list: replace the old item with the updated one
      const updatedExpenses = expenses.map((expense) =>
        expense.id === id ? savedUpdatedRecord : expense,
      );
      setExpenses(updatedExpenses);

      //reset editing states back to default
      setEditingID(null);
      setDescription("");
      setAmount("");
    } catch (error) {
      alert("could not update your expense");
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
      {!isOpen && <button onClick={() => setIsOpen(true)}>Add Item</button>}
      {isOpen && (
        <form onSubmit={handleAddRecord}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          />

          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          />

          <button type="submit">Submit record</button>
          <button type="button" onClick={() => setIsOpen(false)}>
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
                {/* TERNARY SWITCH */}
                {editingID === expense.id ? (
                  // FIXED: Form elements are now flat siblings instead of children of the input
                  <form
                    onSubmit={(e) => handlePatchRecord(e, expense.id)}
                    style={{ display: "inline" }}
                  >
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ padding: "4px", marginRight: "5px" }}
                    />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ padding: "4px", marginRight: "5px" }}
                    />
                    <button type="submit">Save</button>
                    <button type="button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  // FIXED: Cleaned up structural fragments and double </li> placement
                  <>
                    <span className="record-text">
                      <strong>{expense.description}</strong> - ${expense.amount}{" "}
                      ({expense.date})
                    </span>

                    {/* FIXED: Attached handleStartEdit handler to the edit button */}
                    <button onClick={() => handleStartEdit(expense)}>
                      Edit Record
                    </button>

                    <button onClick={() => handleDeleteRecord(expense.id)}>
                      Delete Record
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
