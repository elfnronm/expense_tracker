// t his file making the requests to the backend - server.ts

const BASE_URL = "http://localhost:8000/records";

// Fetch all records from server.ts

export const fetchAllRecords = async () => {
  try {
    const response = await fetch(BASE_URL); // returns a response object stream, we need to extract the body part
    console.log(response);
    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(responseBody.message);
    }

    return responseBody;
  } catch (error) {
    console.error("API Error (GET):", error);
    throw error;
  }
};

// Send a new expense record to the server.ts

export const createRecord = async (description, amount) => {
  // validate the data before making the network request
  const parsedAmount = Number(amount);
  if (!description || isNaN(parsedAmount) || !Number.isFinite(parsedAmount)) {
    throw new Error("invalid description or amount provided");
  }
  const newExpense = {
    description: description,
    amount: Number(amount),
    date: new Date().toISOString().split("T")[0], //generates YYYY-MM-DD
  };

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newExpense),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(responseBody.message);
    }
    return responseBody;
  } catch (error) {
    console.error("API Error (POST)", error);
    throw error;
  }
};

// Delete a record

export const deleteRecord = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(responseBody.message);
    }
    return responseBody;
  } catch (error) {
    console.error("API Error (DELETE)", error);
    throw error;
  }
};

// patch a record
export const patchRecord = async (id, newData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      throw new Error(responseBody.message);
    }
    return responseBody;
  } catch (error) {
    console.error("API Error (PATCH)", error);
    throw error;
  }
};
