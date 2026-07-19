import {SignIn} from "@clerk/nextjs";

/** Sign-in page rendering the Clerk `<SignIn>` component. */
export default function Page(){
    return ( <SignIn forceRedirectUrl={"/"}/>)
}