"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        {session?.user?.name} <Button onClick={() => signOut()}>Sign Out</Button>
      </>
    )
  }
  return <Button onClick={() => signIn()}>Sign In</Button>
}
