import { auth } from "@/auth";
import MembershipDashboard from "./memb";
import { redirect } from "next/navigation";

export default async function Member(){
  const session = await auth()
  if (!session){
    redirect("/signup")
  }
  return(
    <main>
      <MembershipDashboard session={session}/>
    </main>
  )
}