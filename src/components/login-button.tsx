"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { toast } from "react-hot-toast"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      await signIn("google")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setTimeout(() => setIsLoading(false), 2500)
    }
  }

  const loginWithCredentials = async () => {
    setIsEmailLoading(true)
    try {
      await signIn("credentials", {
        email: "admin@gmail.com",
        password: "admin",
        callbackUrl: "/",
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setTimeout(() => setIsEmailLoading(false), 2500)
    }
  }

  return (
    <div className="grid gap-4">
      <Button
        aria-label="Login with Google"
        variant="brand"
        className="w-full"
      //className="w-full bg-blue-600 text-white hover:bg-blue-700"
        onClick={isLoading ? undefined : loginWithGoogle}
        disabled={isLoading || isEmailLoading}
      >
        {isLoading ? (
          <Icons.spinner
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900 px-2 text-zinc-400">Or use bypass</span>
        </div>
      </div>
      <Button
        aria-label="Instant Access"
        variant="outline"                                                    //default
        className="w-full bg-blue-600 text-white hover:bg-blue-700"     //warna button
        onClick={isEmailLoading ? undefined : loginWithCredentials}
        disabled={isLoading || isEmailLoading}
      >
        {isEmailLoading ? (
          <Icons.spinner
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Icons.user className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        Instant Guest Access
      </Button>
    </div>
  )
}

export default LoginButton
