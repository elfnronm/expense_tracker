interface Record {
  id: number;
  description: string;
  amount: number;
  date: string;
}
//OPTIONS

const corsHeaders = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST , PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handler(req: Request) {
  const url = new URL(req.url);
  const file = await Deno.readTextFile("expenses.json");
  const records: Record[] = JSON.parse(file);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // GET Requests

  // 1- Get all the records
  const getRecordsPattern = new URLPattern({
    pathname: "/records",
  });

  if (getRecordsPattern.test(url) && req.method == "GET") {
    return new Response(JSON.stringify(records), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // 2- Get the record with the given id

  const getRecordIdPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (getRecordIdPattern.test(url) && req.method == "GET") {
    const match = getRecordIdPattern.exec(url);
    const userID = Number(match?.pathname.groups.id);

    for (const record of records) {
      if (record.id == userID) {
        return new Response(JSON.stringify(record), {
          status: 200,
          headers: corsHeaders,
        });
      }
    }
  }

  // 3- Get the summary

  const getSummaryPattern = new URLPattern({
    pathname: "/summary",
  });

  if (getSummaryPattern.test(url) && req.method == "GET") {
    let sum = 0;
    for (const record of records) {
      sum = sum + record.amount;
    }
    return new Response(JSON.stringify(sum), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // POST Requests
  // 1- Add a new record to the list

  const putRecordPattern = new URLPattern({
    pathname: "/records",
  });

  // each record has id, description, amount and date. User don't write the id.
  if (putRecordPattern.test(url) && req.method == "POST") {
    // get the details for the new record
    const recordDetails = await req.json();

    //create the id for the new user:
    // initialize a variable to hold the highest id
    let highestID = 0;
    //check if the records has item in it
    if (records.length > 0) {
      // create an array of id's
      const ids = records.map((record) => record.id);
      highestID = Math.max(...ids);
      const nextID = highestID + 1;

      // add the id to the new record
      const newRecordWithID = { id: nextID, ...recordDetails };
      // add the new record to the records list
      const newRecords = [...records, newRecordWithID];
      // write the new record to the file
      Deno.writeTextFile("expenses.json", JSON.stringify(newRecords));
      //respond to client with the new record
      return new Response(JSON.stringify(newRecordWithID), {
        status: 201,
        headers: corsHeaders,
      });
    }
  }

  //PUT Requests

  // 1- update the record

  // DELETE Requests
  const deleteRecordPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (deleteRecordPattern.test(url) && req.method == "DELETE") {
    const match = deleteRecordPattern.exec(url);
    const idToDelete = Number(match?.pathname.groups.id);

    const newRecords = records.filter((record) => {
      return record.id !== idToDelete;
    });

    Deno.writeTextFile("expenses.json", JSON.stringify(newRecords));
    return new Response(JSON.stringify({ message: "record deleted!" }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // PATCH Requests

  const patchRecordPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (patchRecordPattern.test(url) && req.method == "PATCH") {
    const match = patchRecordPattern.exec(url);
    const idToPatch = Number(match?.pathname.groups.id);

    // get the partial updates from the request body
    const updates = await req.json();
    console.log(updates);
    console.log(JSON.stringify(updates));

    //create an array to hold the updates
    let updatedRecord: Record | null = null;

    for (let i = 0; i < records.length; i++) {
      if (records[i].id === idToPatch) {
        //merge old record data with the incoming updates
        records[i] = { ...records[i], ...updates };
        updatedRecord = records[i];
        break;
      }
    }

    //if the record existed and was updated, save it to the file
    if (updatedRecord) {
      Deno.writeTextFile("expenses.json", JSON.stringify(records));
      return new Response(JSON.stringify(updatedRecord), {
        status: 200,
        headers: corsHeaders,
      });
    }
  }

  return new Response(null, { status: 404 });
}

Deno.serve(handler);
