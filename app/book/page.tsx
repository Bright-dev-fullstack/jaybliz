import BookService from "./book";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function  Post(){
        const session = await auth()
        if (!session){
          redirect("/signin")
        }
    return(
        <main>
            <BookService  session={session}/>
        </main>
    )
}