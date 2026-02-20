"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const videos = [
  {
    src: "/videos/App_Demo_Video_Generated.mp4",
    title: "Quick App Demo",
    description: "See how easy it is to record your daily work",
  },
  {
    src: "/videos/Apprentice_Log_Simplifying_Trade_Training.mp4",
    title: "Simplifying Trade Training",
    description: "How Apprentice Log streamlines your BCITO logbook",
  },
  {
    src: "/videos/Video_Generation_With_New_App_Name.mp4",
    title: "On the Job",
    description: "Watch tradies use the app in real work environments",
  },
];

function VideoCard({
  video,
  index,
  isInView,
}: {
  video: (typeof videos)[0];
  index: number;
  isInView: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
      className="group"
    >
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-slate-800">
        {/* Video container */}
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={video.src}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onEnded={() => setIsPlaying(false)}
          />

          {/* Play overlay */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
            }`}
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              ) : (
                <Play className="h-7 w-7 sm:h-8 sm:w-8 text-white ml-1" />
              )}
            </motion.div>
          </div>

          {/* Mute button */}
          {isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Video info */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-white mb-1">
            {video.title}
          </h3>
          <p className="text-slate-400 text-sm">{video.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function VideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="demo" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Play className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">
              See it in Action
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Watch How It
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Works on Site
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real tradies using Apprentice Log in their daily work environment.
            See how quick and easy it is to complete your logbook entries.
          </p>
        </motion.div>

        {/* Videos grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <VideoCard
              key={index}
              video={video}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 mb-4">
            Ready to make your logbook entries this easy?
          </p>
          <a
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
          >
            Start Free Today
          </a>
        </motion.div>
      </div>
    </section>
  );
}
