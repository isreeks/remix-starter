import { redirect } from "@remix-run/node";
import { auth } from "./lib/auth.server";


export async function requireUserSession(request : Request) {
    // get the session
    const session = await auth.api.getSession({
        headers: request.headers,
    });
  
    // validate the session, `userId` is just an example, use whatever value you
    // put in the session when the user authenticated
    if (!session?.user.id) {
      // if there is no user session, redirect to login
      throw redirect("/signin");
    }
  
    return session;
  }