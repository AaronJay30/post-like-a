"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WarmupScreenProps {
  videoUrl: string
  onClose: () => void
}

export default function WarmupScreen({ videoUrl, onClose }: WarmupScreenProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 text-white hover:bg-white/20 z-10"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="w-full h-full flex items-center justify-center p-4">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full max-w-6xl max-h-[80vh] rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsVideoLoaded(true)}
          />
        ) : (
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid YouTube URL</h2>
            <p className="mb-6">Please check the video URL in settings.</p>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-white border-white hover:bg-white/20 bg-transparent"
            >
              Back to Menu
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
