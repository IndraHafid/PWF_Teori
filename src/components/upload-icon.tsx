"use client"

import * as React from "react"
import Image from "next/image"
import type { SetState } from "@/types"
import { useState } from "react"
import { toast } from "react-hot-toast"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

interface UploadIconProps {
  setIconPicker: SetState<boolean>
  setIcon: SetState<any>
}

const UploadIcon = ({ setIconPicker, setIcon }: UploadIconProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed")
      return
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Use the icon object returned from API
        const newIcon = result.icon

        setIcon(newIcon)
        setIconPicker(false)
        toast.success("Image uploaded successfully!")
      } else {
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-medium sm:text-2xl">Upload Custom Image</div>
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square h-32 w-32 min-w-[80px] overflow-hidden rounded bg-neutral-800">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icons.upload className="h-8 w-8 text-neutral-500" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Icons.spinner className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            onClick={() => {
              const fileInput = document.getElementById('file-upload') as HTMLInputElement
              fileInput?.click()
            }}
          >
            {isUploading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Icons.upload className="mr-2 h-4 w-4" />
                Choose File
              </>
            )}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          
          <div className="text-xs text-neutral-500">
            JPEG, PNG, WebP • Max 5MB
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadIcon
