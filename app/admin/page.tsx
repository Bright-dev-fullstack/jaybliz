import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin";

export default async function AdminPage() {
  const session = await auth();

  // 1. If not logged in, send to sign-in
  if (!session || !session.user?.email) {
    redirect("/sigin");
  }

  // 2. Compare logged-in user email against the admin environment variable
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = session.user.email.trim().toLowerCase();

  if (!adminEmail || userEmail !== adminEmail) {
    redirect("/about"); // Not an admin, kick back home
  }

return(
    <main>
        <AdminDashboard session={session}/>
    </main>
)
}