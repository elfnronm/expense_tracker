import { createClient } from "@supabase/supabase-js";

interface Record {
  id: number;
  description: string;
  amount: number;
  date: string;
}

//connect to supabase

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

//OPTIONS

const corsHeaders = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "https://brilliant-phoenix-172a37.netlify.app",
  "Access-Control-Allow-Methods": "GET, POST , PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

//extract the token from the request and verify it with supabase
async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return null;

  return data.user;
}

async function handler(req: Request) {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const user = await getUser(req);
  if (!user) {
    return new Response(JSON.stringify({ message: "unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // GET Requests

  // 1- Get all the records
  const getRecordsPattern = new URLPattern({
    pathname: "/records",
  });

  if (getRecordsPattern.test(url) && req.method == "GET") {
    console.log("Logged in user:", user.id);
    const result = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);
    const data = result.data;
    const error = result.error;

    console.log("returned data:", data);

    if (error)
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: corsHeaders,
      });

    return new Response(JSON.stringify(data), {
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

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", userID)
      .eq("user_id", user.id)
      .single();

    if (error)
      return new Response(JSON.stringify(error), {
        status: 404,
        headers: corsHeaders,
      });

    return new Response(JSON.stringify(data), {
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
    const { data, error } = await supabase
      .from("expenses")
      .insert({ ...recordDetails, user_id: user.id })
      .select()
      .single();

    if (error)
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: corsHeaders,
      });

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: corsHeaders,
    });
  }

  // DELETE Requests
  const deleteRecordPattern = new URLPattern({
    pathname: "/records/:id",
  });

  if (deleteRecordPattern.test(url) && req.method == "DELETE") {
    const match = deleteRecordPattern.exec(url);
    const idToDelete = Number(match?.pathname.groups.id);

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", idToDelete)
      .eq("user_id", user.id);

    if (error)
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: corsHeaders,
      });
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

    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", idToPatch)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error)
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: corsHeaders,
      });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(null, { status: 404 });
}

Deno.serve(handler);
