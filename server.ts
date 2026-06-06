interface Record {
  id: number;
  description: string;
  amount: number;
  date: string;
}

async function handler(req: Request) {
  const url = new URL(req.url);
  const file = await Deno.readTextFile("expenses.json");
  const records: Record[] = JSON.parse(file);

  // GET Requests

  // 1- Get the record with the id given

  const getRecordIdPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (getRecordIdPattern.test(url) && req.method == "GET") {
    const match = getRecordIdPattern.exec(url);
    const userID = Number(match?.pathname.groups.id);

    for (const record of records) {
      if (record.id == userID) {
        return new Response(JSON.stringify(record), { status: 200 });
      }
    }
  }

  // 2- Get all the records
  const getRecordsPattern = new URLPattern({
    pathname: "/records",
  });

  if (getRecordsPattern.test(url) && req.method == "GET") {
    return new Response(JSON.stringify(records));
  }

  // POST Requests
  // 1- Post a new record to the list

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

      return new Response(JSON.stringify(newRecordWithID), { status: 201 });
    }
  }

  // DELETE Requests

  return new Response(null, { status: 404 });
}

Deno.serve(handler);
