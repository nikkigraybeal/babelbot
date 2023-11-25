import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useSession, signIn } from "next-auth/react";

export default function Login() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col justify-start gap-12 items-center h-[50vh]">
      <h1 className="text-white mt-16 text-xl">Multi-Lingual Chatbot</h1>
      <button
        className="bg-blue-500 p-2 text-white rounded-md"
        onClick={() => signIn("google", { redirect: false })}
      >
        <div className="flex gap-4 px-5">
          <div className="text-2xl m-auto">
            <FcGoogle />
          </div>
          <div className="font-bold">Continue with Google</div>
        </div>
      </button>
    </div>
  );
}
