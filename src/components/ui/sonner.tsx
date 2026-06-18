"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-3.5" />
        ),
        info: (
          <InfoIcon className="size-3.5" />
        ),
        warning: (
          <TriangleAlertIcon className="size-3.5" />
        ),
        error: (
          <OctagonXIcon className="size-3.5" />
        ),
        loading: (
          <Loader2Icon className="size-3.5 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "19rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !gap-2 !p-3",
          title: "!text-[0.8rem] !font-medium",
          description: "!text-xs !text-black !opacity-100",
          icon: "!size-3.5",
          closeButton:
            "!bg-white !text-black !border-border hover:!bg-neutral-100 hover:!text-black",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
