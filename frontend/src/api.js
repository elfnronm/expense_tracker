// t his file making the requests to the backend - server.ts

import { supabase } from "./supabaseClient.js";

// const BASE_URL = "https://expense-tracker.elfnronm.deno.net/records";
const BASE_URL = "http://localhost:8000/records";

//get the current token
const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all records from server.ts

export const fetchAllRecords = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(BASE_URL, { headers }); // returns a response object stream, we need to extract the body part
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
    const headers = await getAuthHeaders();

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: headers,
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
    const headers = await getAuthHeaders();

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: headers,
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: headers,
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
