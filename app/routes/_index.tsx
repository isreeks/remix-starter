import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Session, User } from "better-auth";
import { json } from "drizzle-orm/mysql-core";
import { r } from "node_modules/better-auth/dist/auth-Cr3tLhNt";
import { a } from "node_modules/better-auth/dist/index-BbA-TqZ5";
import { authClient } from "~/lib/auth.client";
import { auth } from "~/lib/auth.server";
import { requireUserSession } from "~/session";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: { request: Request }) {
  const authData = await requireUserSession(request);

  if (!authData?.user) {
    return null;
  }

  return authData?.user;
}

export default function Index() {
  const session = useLoaderData<User | null>();
  return (
    <div>
      {session ? (
        <div>
          <h1>Welcome {session.name}</h1>
          <button
            onClick={async () => {
              await authClient.signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <a href="/signin">Sign In</a>
          <a href="/signup">Sign Up</a>
        </div>
      )}
    </div>
  );
}
