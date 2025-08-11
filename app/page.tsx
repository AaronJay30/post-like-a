"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Settings, Youtube } from "lucide-react";
import SettingsModal from "@/components/settings-modal";
import MechanicsModal from "@/components/mechanics-modal";
import GameScreen from "@/components/game-screen";
import WarmupScreen from "@/components/warmup-screen";

type GameState = "landing" | "settings" | "mechanics" | "game" | "warmup";

export default function HomePage() {
    const [gameState, setGameState] = useState<GameState>("landing");
    const [gameSettings, setGameSettings] = useState({
        rounds: 5,
        playersPerRound: 1,
        names: [] as string[],
        words: [] as string[],
        warmupVideo: "",
        posingTimer: 10,
        explanationTimer: 20,
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedNames = localStorage.getItem("gameNames");
        const savedWords = localStorage.getItem("gameWords");
        const savedWarmup = localStorage.getItem("warmupVideo");
        const savedRounds = localStorage.getItem("gameRounds");
        const savedPlayersPerRound = localStorage.getItem("playersPerRound");
        const savedPosingTimer = localStorage.getItem("posingTimer");
        const savedExplanationTimer = localStorage.getItem("explanationTimer");

        setGameSettings((prev) => ({
            ...prev,
            names: savedNames
                ? JSON.parse(savedNames)
                : ["Alice", "Bob", "Charlie", "Diana"],
            words: savedWords
                ? JSON.parse(savedWords)
                : [
                      "a superhero",
                      "a cat",
                      "someone famous",
                      "a robot",
                      "a dancer",
                  ],
            warmupVideo: savedWarmup || "",
            rounds: savedRounds ? Number.parseInt(savedRounds) : 10,
            playersPerRound: savedPlayersPerRound
                ? Number.parseInt(savedPlayersPerRound)
                : 1,
            posingTimer: savedPosingTimer
                ? Number.parseInt(savedPosingTimer)
                : 10,
            explanationTimer: savedExplanationTimer
                ? Number.parseInt(savedExplanationTimer)
                : 20,
        }));
    }, []);

    const handleStartGame = () => {
        if (
            gameSettings.names.length === 0 ||
            gameSettings.words.length === 0
        ) {
            import("sweetalert2").then((Swal) => {
                Swal.default.fire({
                    icon: "warning",
                    title: "Missing Info",
                    text: "Please add some names and words in Settings first!",
                });
            });
            return;
        }
        setGameState("mechanics");
    };

    const handleStartWarmup = () => {
        if (!gameSettings.warmupVideo) {
            import("sweetalert2").then((Swal) => {
                Swal.default.fire({
                    icon: "warning",
                    title: "Missing Warmup Video",
                    text: "Please set a warmup video in Settings first!",
                });
            });
            return;
        }
        setGameState("warmup");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
            <AnimatePresence mode="wait">
                {gameState === "landing" && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen flex flex-col items-center justify-center p-8"
                    >
                        <motion.h1
                            initial={{ y: -50, opacity: 0 }}
                            animate={{
                                opacity: 1,
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 1,
                                y: {
                                    duration: 3,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                },
                            }}
                            className="text-6xl md:text-8xl font-extrabold text-center mb-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
                            style={{
                                fontFamily: "Pacifico, cursive",
                                textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            Post Like a...
                        </motion.h1>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex flex-col gap-4 w-full max-w-sm"
                        >
                            <Button
                                onClick={handleStartWarmup}
                                size="lg"
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                <Youtube className="mr-2 h-5 w-5" />
                                Start a Warmup
                            </Button>

                            <Button
                                onClick={handleStartGame}
                                size="lg"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Start the Game
                            </Button>

                            <Button
                                onClick={() => setGameState("settings")}
                                variant="outline"
                                size="lg"
                                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold py-4 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                <Settings className="mr-2 h-5 w-5" />
                                Settings
                            </Button>
                        </motion.div>
                    </motion.div>
                )}

                {gameState === "settings" && (
                    <SettingsModal
                        isOpen={true}
                        onClose={() => setGameState("landing")}
                        settings={gameSettings}
                        onSettingsChange={setGameSettings}
                    />
                )}

                {gameState === "mechanics" && (
                    <MechanicsModal
                        isOpen={true}
                        onClose={() => setGameState("landing")}
                        onStartGame={() => setGameState("game")}
                        settings={gameSettings}
                    />
                )}

                {gameState === "game" && (
                    <GameScreen
                        settings={gameSettings}
                        onEndGame={() => setGameState("landing")}
                    />
                )}

                {gameState === "warmup" && (
                    <WarmupScreen
                        videoUrl={gameSettings.warmupVideo}
                        onClose={() => setGameState("landing")}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
