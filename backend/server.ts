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
  // const file = await Deno.readTextFile("expenses.json");
  // const records: Record[] = JSON.parse(file);

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
    const records = JSON.parse(await Deno.readTextFile("expenses.json"));
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
    const records = JSON.parse(await Deno.readTextFile("expenses.json"));
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

  // POST Requests
  // 1- Add a new record to the list

  const putRecordPattern = new URLPattern({
    pathname: "/records",
  });

  // each record has id, description, amount and date. User don't write the id.
  if (putRecordPattern.test(url) && req.method == "POST") {
    const records = JSON.parse(await Deno.readTextFile("expenses.json"));
    // get the details for the new record
    const recordDetails = await req.json();

    //create the id for the new user:

    // determine the next unique ID based on existing records
    let nextID: number;
    // if there are existing records, find the highest ID and add 1
    if (records.length > 0) {
      // create an array of id's
      const ids = records.map((record: Record) => record.id); // extract all existing IDs into an array
      nextID = Math.max(...ids) + 1; // find the largest id and increment it
    } else {
      nextID = 1; // no records yet, so start IDs from 1
    }

    // add the id to the new record
    const newRecordWithID = { id: nextID, ...recordDetails };
    // add the new record to the records list
    const newRecords = [...records, newRecordWithID];
    // write the new record to the file
    await Deno.writeTextFile("expenses.json", JSON.stringify(newRecords));
    //respond to client with the new record
    return new Response(JSON.stringify(newRecordWithID), {
      status: 201,
      headers: corsHeaders,
    });
  }

  //PUT Requests

  // 1- update the record

  // DELETE Requests
  const deleteRecordPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (deleteRecordPattern.test(url) && req.method == "DELETE") {
    const records = JSON.parse(await Deno.readTextFile("expenses.json"));
    const match = deleteRecordPattern.exec(url);
    const idToDelete = Number(match?.pathname.groups.id);

    const newRecords = records.filter((record: Record) => {
      return record.id !== idToDelete;
    });

    await Deno.writeTextFile("expenses.json", JSON.stringify(newRecords));
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
    const records = JSON.parse(await Deno.readTextFile("expenses.json"));
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
      await Deno.writeTextFile("expenses.json", JSON.stringify(records));
      return new Response(JSON.stringify(updatedRecord), {
        status: 200,
        headers: corsHeaders,
      });
    }
  }

  return new Response(null, { status: 404 });
}

Deno.serve(handler);
