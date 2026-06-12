import { useState, useEffect } from "react";
import {
  fetchAllRecords,
  createRecord,
  deleteRecord,
  patchRecord,
} from "./api.js";
import "./App.css";
import { supabase } from "./supabaseClient.js";
import Auth from "./Auth.jsx";

function App() {
  const [session, setSession] = useState(null);
  // change state to an empty array to store fetched records
  const [expenses, setExpenses] = useState([]); // each record is one expense and the expenses -> [expense 1 , expense 2]
  // expense1 : { "id": 1, "description": "book", "amount": 20, "date": "2026-06-05" }
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingID, setEditingID] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      //check if user is already logged in
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        handleViewRecords();
      }
    };
    checkSession();

    //listen for login/logout changes
    //const {data: listener} = result : this says take the value of result.data and store it in
    // a new variable called listener
    //it is equivalent to const listener= result.data
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setExpenses([]);
        if (session) {
          handleViewRecords();
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

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
      setIsOpen(false);
    } catch (error) {
      alert(error.message || "could not save your expense");
    }
  };

  // PATCH handler
  //trigger this function when clicking the edit record button
  const handleStartEdit = (expense) => {
    setIsOpen(false);
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

  // get the summary
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (!session) {
    return <Auth />;
  }

  return (
    <>
      <div className="app">
        <button onClick={() => supabase.auth.signOut()}>Log Out</button>
        <div className="header">
          <h1>Expenses</h1>
          <p>Track your spending</p>
        </div>

        <div className="summary-row">
          <div className="metric">
            <div className="metric-label">Summary of spent</div>
            <div className="metric-value">${total.toFixed(2)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Records</div>
            <div className="metric-value">{expenses.length}</div>
          </div>
        </div>
        {/* toolbar */}
        <div className="toolbar">
          <span className="toolbar-label">All records</span>
          <button className="btn-add" onClick={() => setIsOpen(!isOpen)}>
            + Add expense
          </button>
        </div>
        {/* add form */}
        <form
          onSubmit={handleAddRecord}
          className={`add-form ${isOpen ? "open" : ""}`}
        >
          <div className="form-row">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              min={0}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
        {/* records list */}
        <div className="records-container">
          {expenses.length === 0 ? (
            <p className="empty-message">No expenses yet. Add one above!</p>
          ) : (
            <ul className="records-list">
              {expenses.map((expense) => (
                <li key={expense.id} className="record-item">
                  {editingID === expense.id ? (
                    <form
                      onSubmit={(e) => handlePatchRecord(e, expense.id)}
                      className="edit-form"
                    >
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="edit-input"
                      />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="edit-input"
                      />
                      <button type="submit" className="save-btn">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <div>
                        <div className="record-desc">{expense.description}</div>
                        <div className="record-date">{expense.date}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="record-amount">${expense.amount}</span>
                        <div className="record-actions">
                          <button
                            onClick={() => handleStartEdit(expense)}
                            className="edit-btn"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(expense.id)}
                            className="delete-btn"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
