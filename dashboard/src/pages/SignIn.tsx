import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-[#0f172a]">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
