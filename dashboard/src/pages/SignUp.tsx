import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-[#0f172a]">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
