import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin";

export default async function AdminPage() {
  const session = await auth();

  // 1. If not logged in, send to sign-in
  if (!session || !session.user?.email) {
    redirect("/signin"); // Note: Fixed the spelling from "/sigin"
  }

  // 2. Fetch the correct environment variable
  const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

  // 3. Convert the comma-separated string into an array of clean emails
  const adminEmails = envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase());

  const userEmail = session.user.email.trim().toLowerCase();

  // 4. Check if the user's email exists in the array
  if (!adminEmails.includes(userEmail)) {
    console.log(`Access Denied: ${userEmail} is not in the admin list.`);
    redirect("/about"); // Not an admin, kick back home
  }

  return (
    <main>
        <AdminDashboard session={session}/>
    </main>
  );
}