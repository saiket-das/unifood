"use client"

import * as React from "react"
import { ImagePlus, X, UploadCloud, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await apiClient.post<{ url: string }>("/menu/upload", formData)
      
      if (response.data) {
        onChange(response.data.url)
        toast.success("Image uploaded successfully")
      } else {
        toast.error(response.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("An error occurred while uploading the image")
    } finally {
      setIsUploading(false)
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-[150px] h-[150px] rounded-md overflow-hidden border">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove()}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              className="object-cover w-full h-full"
              alt="Image"
              src={value}
            />
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-[150px] h-[150px] rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium text-center px-2">
                  Click to upload image
                </span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
