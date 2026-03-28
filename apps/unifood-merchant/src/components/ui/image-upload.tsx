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
      <div className="flex items-center justify-center w-full">
        {value ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border shadow-inner bg-muted/20">
            <div className="z-10 absolute top-3 right-3">
              <Button
                type="button"
                onClick={() => onRemove()}
                variant="destructive"
                size="icon"
                className="h-8 w-8 shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              className="object-cover w-full h-full"
              alt="Food Image"
              src={value}
            />
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-video w-full rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-all duration-300 group",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "pointer-events-none"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-medium text-muted-foreground">Uploading Image...</span>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <UploadCloud className="h-10 w-10 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-muted-foreground block">
                    Click to upload image
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    Recommended: 1920 x 1080 (16:9)
                  </span>
                </div>
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
