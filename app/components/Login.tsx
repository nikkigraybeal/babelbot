import React from 'react'
import GoogleButton from 'react-google-button'
import { useSession, signIn } from "next-auth/react";

export default function Login() {
  const { data: session } = useSession()
  console.log("SESSION:", session)

  return (
    <>
    <h1 className="text-white mt-16 text-xl">Multi-Lingual Chatbot</h1>
    <GoogleButton onClick={() => signIn("google")} className="mx-auto mt-16"/>
    
    </>
  )
}