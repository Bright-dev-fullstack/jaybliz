import { redirect } from "next/navigation";
import ProfileClient from "./profileClient";
import { auth } from "@/auth";


export default async function ProfilePage() {
      const session = await auth()
      if (!session){
        redirect("/signin")
      }

     return (
       <main>
        <ProfileClient session={session}/>
       </main>
     )
   }  
