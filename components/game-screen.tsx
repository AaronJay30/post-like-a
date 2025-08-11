"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, Clock } from "lucide-react";

interface GameScreenProps {
    settings: {
        rounds: number;
        playersPerRound: number;
        names: string[];
        words: string[];
        posingTimer: number;
        explanationTimer: number;
    };
    onEndGame: () => void;
}

export default function GameScreen({ settings, onEndGame }: GameScreenProps) {
    const [currentRound, setCurrentRound] = useState(1);
    const [currentWord, setCurrentWord] = useState("");
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [usedPlayers, setUsedPlayers] = useState<string[]>([]);
    const [gamePhase, setGamePhase] = useState<
        | "prompt"
        | "posing"
        | "posing-complete"
        | "selection"
        | "selection-complete"
        | "explanation"
        | "explanation-complete"
    >("prompt");
    const [timeLeft, setTimeLeft] = useState(0);
    const [explanationTimeLeft, setExplanationTimeLeft] = useState(0);
    const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
    const [isSlotMachineRunning, setIsSlotMachineRunning] = useState(false);
    const [currentSlotName, setCurrentSlotName] = useState("");
    const [slotSelectionCount, setSlotSelectionCount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const explanationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const slotRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startNewRound();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (explanationTimerRef.current)
                clearInterval(explanationTimerRef.current);
            if (slotRef.current) clearInterval(slotRef.current);
        };
    }, []);

    const startNewRound = () => {
        setGamePhase("prompt");
        setSelectedPlayers([]);
        setUsedPlayers([]);
        setSlotSelectionCount(0);
        setCurrentExplanationIndex(0);

        // Select random word
        const randomWord =
            settings.words[Math.floor(Math.random() * settings.words.length)];
        setCurrentWord(randomWord);

        setTimeout(() => {
            startPosingPhase();
        }, 2000);
    };

    const startPosingPhase = () => {
        setGamePhase("posing");
        setTimeLeft(settings.posingTimer);

        // Clear any existing timer first
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setGamePhase("posing-complete");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startSelectionPhase = () => {
        setGamePhase("selection");
        runSlotMachine();
    };

    const runSlotMachine = () => {
        setIsSlotMachineRunning(true);
        const availableNames = settings.names.filter(
            (name) => !usedPlayers.includes(name)
        );

        if (availableNames.length === 0) {
            // Reset if all names have been used
            setUsedPlayers([]);
            return runSlotMachine();
        }

        // Clear any existing slot interval
        if (slotRef.current) {
            clearInterval(slotRef.current);
        }

        let slotCount = 0;
        const maxSlots = 20 + Math.random() * 20; // Random duration

        slotRef.current = setInterval(() => {
            const randomName =
                availableNames[
                    Math.floor(Math.random() * availableNames.length)
                ];
            setCurrentSlotName(randomName);
            slotCount++;

            if (slotCount >= maxSlots) {
                if (slotRef.current) {
                    clearInterval(slotRef.current);
                    slotRef.current = null;
                }

                // Select final name
                const finalName =
                    availableNames[
                        Math.floor(Math.random() * availableNames.length)
                    ];
                setCurrentSlotName(finalName);
                setSelectedPlayers((prev) => [...prev, finalName]);
                setUsedPlayers((prev) => [...prev, finalName]);

                // Use a simpler approach to handle next selection
                setSlotSelectionCount((prev) => prev + 1);

                setTimeout(() => {
                    setIsSlotMachineRunning(false);

                    // Check current count after state update
                    setSlotSelectionCount((currentCount) => {
                        if (currentCount < settings.playersPerRound) {
                            setTimeout(() => runSlotMachine(), 1000);
                        } else {
                            setTimeout(
                                () => setGamePhase("selection-complete"),
                                1000
                            );
                        }
                        return currentCount;
                    });
                }, 1000);
            }
        }, 100);
    };

    const startExplanationPhase = () => {
        setGamePhase("explanation");
        setCurrentExplanationIndex(0);
        startExplanationTimer();
    };

    const startExplanationTimer = () => {
        const explanationTime = settings.explanationTimer;
        setExplanationTimeLeft(explanationTime);

        // Clear any existing explanation timer
        if (explanationTimerRef.current) {
            clearInterval(explanationTimerRef.current);
        }

        explanationTimerRef.current = setInterval(() => {
            setExplanationTimeLeft((prev) => {
                if (prev <= 1) {
                    if (explanationTimerRef.current) {
                        clearInterval(explanationTimerRef.current);
                        explanationTimerRef.current = null;
                    }
                    handleExplanationComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleExplanationComplete = () => {
        // Clear the timer
        if (explanationTimerRef.current) {
            clearInterval(explanationTimerRef.current);
            explanationTimerRef.current = null;
        }
    };

    const proceedToNextPlayer = () => {
        const nextIndex = currentExplanationIndex + 1;

        if (nextIndex < selectedPlayers.length) {
            // Move to next player
            setCurrentExplanationIndex(nextIndex);
            setGamePhase("explanation");
            startExplanationTimer();
        } else {
            // All explanations complete, stay in explanation-complete for final buttons
            setGamePhase("explanation-complete");
        }
    };

    const nextRound = () => {
        if (currentRound < settings.rounds) {
            setCurrentRound((prev) => prev + 1);
            startNewRound();
        } else {
            // Game finished
            onEndGame();
        }
    };

    const getTimerColor = () => {
        if (timeLeft > settings.posingTimer * 0.5) return "text-green-400";
        if (timeLeft > settings.posingTimer * 0.25) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        animate={{
                            x: [0, Math.random() * 100 - 50],
                            y: [0, Math.random() * 100 - 50],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Round indicator */}
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">
                    Round {currentRound} of {settings.rounds}
                </span>
            </div>

            {/* Home button */}
            <div className="absolute top-6 left-6">
                <Button
                    onClick={onEndGame}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                >
                    <Home className="h-5 w-5" />
                </Button>
            </div>

            {/* Timer (only show during posing phase) */}
            {gamePhase === "posing" && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2"
                    >
                        <Clock className="h-5 w-5" />
                        <span
                            className={`text-2xl font-bold ${getTimerColor()}`}
                        >
                            {timeLeft}
                        </span>
                    </motion.div>
                </div>
            )}

            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <AnimatePresence mode="wait">
                    {gamePhase === "prompt" && (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            className="text-center space-y-8"
                        >
                            <motion.div>
                                <h1
                                    className="text-4xl md:text-6xl font-bold mb-4"
                                    style={{ fontFamily: "Pacifico, cursive" }}
                                >
                                    Post Like a...
                                </h1>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-6xl md:text-8xl font-bold text-yellow-300"
                                >
                                    {currentWord}
                                </motion.h2>
                            </motion.div>
                        </motion.div>
                    )}

                    {gamePhase === "posing" && (
                        <motion.div
                            key="posing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                }}
                            >
                                <h1
                                    className="text-4xl md:text-6xl font-bold mb-4"
                                    style={{ fontFamily: "Pacifico, cursive" }}
                                >
                                    Strike Your Pose!
                                </h1>
                                <h2 className="text-4xl md:text-6xl font-bold text-yellow-300 mb-8">
                                    {currentWord}
                                </h2>
                            </motion.div>

                            <motion.div
                                className="text-8xl md:text-9xl font-bold"
                                animate={{
                                    scale: timeLeft <= 3 ? [1, 1.2, 1] : 1,
                                    color:
                                        timeLeft <= 3
                                            ? ["#ffffff", "#ff0000", "#ffffff"]
                                            : "#ffffff",
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat:
                                        timeLeft <= 3
                                            ? Number.POSITIVE_INFINITY
                                            : 0,
                                }}
                            >
                                {timeLeft}
                            </motion.div>
                        </motion.div>
                    )}

                    {gamePhase === "posing-complete" && (
                        <motion.div
                            key="posing-complete"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-8">
                                Posing Complete!
                            </h1>
                            <h2 className="text-2xl md:text-3xl text-yellow-300 mb-8">
                                {currentWord}
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">
                                Ready to select players to explain their poses?
                            </p>
                            <Button
                                onClick={() => {
                                    console.log(
                                        "Start Player Selection clicked"
                                    );
                                    startSelectionPhase();
                                }}
                                size="lg"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-full text-xl transition-all duration-200 hover:scale-105 relative z-10 cursor-pointer"
                            >
                                Start Player Selection
                            </Button>
                        </motion.div>
                    )}

                    {gamePhase === "selection" && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-8">
                                Selecting Players...
                            </h1>

                            {/* Slot Machine Display */}
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
                                <motion.div
                                    animate={
                                        isSlotMachineRunning
                                            ? {
                                                  y: [-10, 10, -10],
                                                  scale: [1, 1.1, 1],
                                              }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.1,
                                        repeat: isSlotMachineRunning
                                            ? Number.POSITIVE_INFINITY
                                            : 0,
                                    }}
                                    className="text-4xl md:text-6xl font-bold"
                                >
                                    {currentSlotName || "🎰"}
                                </motion.div>
                            </div>

                            {/* Selected Players List */}
                            {selectedPlayers.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">
                                        Selected:
                                    </h2>
                                    {selectedPlayers.map((player, index) => (
                                        <motion.div
                                            key={`${player}-${index}`}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 text-xl font-semibold"
                                        >
                                            ✓ {player}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Progress indicator */}
                            <div className="text-lg text-gray-300">
                                Selecting {slotSelectionCount + 1} of{" "}
                                {settings.playersPerRound} players...
                            </div>
                        </motion.div>
                    )}

                    {gamePhase === "selection-complete" && (
                        <motion.div
                            key="selection-complete"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-8">
                                Players Selected!
                            </h1>

                            {/* Selected Players List */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">
                                    Selected Players:
                                </h2>
                                {selectedPlayers.map((player, index) => (
                                    <motion.div
                                        key={`selected-${player}-${index}`}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.3 }}
                                        className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 text-xl font-semibold"
                                    >
                                        ✓ {player}
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-xl text-gray-300 mb-8">
                                Ready to start the explanation phase?
                            </p>
                            <Button
                                onClick={() => {
                                    console.log("Start Explanations clicked");
                                    startExplanationPhase();
                                }}
                                size="lg"
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-full text-xl transition-all duration-200 hover:scale-105 relative z-10 cursor-pointer"
                            >
                                Start Explanations
                            </Button>
                        </motion.div>
                    )}

                    {gamePhase === "explanation" && (
                        <motion.div
                            key="explanation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-8">
                                Time to Explain!
                            </h1>

                            {/* Current player explaining */}
                            <div className="space-y-6">
                                <motion.div
                                    key={`current-${currentExplanationIndex}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-8 text-3xl font-bold border-4 border-yellow-400"
                                >
                                    {selectedPlayers[currentExplanationIndex]}{" "}
                                    is explaining...
                                </motion.div>

                                {/* Explanation Timer */}
                                {explanationTimeLeft > 0 && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center justify-center gap-2 mx-auto w-fit">
                                        <Clock className="h-5 w-5" />
                                        <span
                                            className={`text-2xl font-bold ${
                                                explanationTimeLeft <= 5
                                                    ? "text-red-400"
                                                    : "text-white"
                                            }`}
                                        >
                                            {explanationTimeLeft}s
                                        </span>
                                    </div>
                                )}

                                {/* Timer finished - show proceed button */}
                                {explanationTimeLeft === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-xl text-gray-300">
                                            Time's up for{" "}
                                            {
                                                selectedPlayers[
                                                    currentExplanationIndex
                                                ]
                                            }
                                            !
                                        </p>
                                        <Button
                                            onClick={proceedToNextPlayer}
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-full text-xl transition-all duration-200 hover:scale-105 relative z-10 cursor-pointer"
                                        >
                                            {currentExplanationIndex <
                                            selectedPlayers.length - 1
                                                ? "Next Player"
                                                : "Finish Explanations"}
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Progress indicator */}
                                <div className="text-lg text-gray-300">
                                    Player {currentExplanationIndex + 1} of{" "}
                                    {selectedPlayers.length}
                                </div>
                            </div>

                            {/* All selected players list */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">
                                    Selected Players:
                                </h2>
                                <div className="grid gap-3">
                                    {selectedPlayers.map((player, index) => (
                                        <motion.div
                                            key={`explanation-${player}-${index}`}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`backdrop-blur-sm rounded-xl p-4 text-xl font-semibold ${
                                                index ===
                                                currentExplanationIndex
                                                    ? "bg-yellow-500/30 border-2 border-yellow-400"
                                                    : index <
                                                      currentExplanationIndex
                                                    ? "bg-green-500/20 border-2 border-green-400"
                                                    : "bg-white/20"
                                            }`}
                                        >
                                            {index < currentExplanationIndex &&
                                                "✓ "}
                                            {index ===
                                                currentExplanationIndex &&
                                                "🎤 "}
                                            {player}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gamePhase === "explanation-complete" && (
                        <motion.div
                            key="explanation-complete"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-8">
                                All Explanations Complete!
                            </h1>
                            <p className="text-xl text-gray-300 mb-8">
                                Ready to move to the next round?
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button
                                    onClick={() => {
                                        if (currentRound < settings.rounds) {
                                            setCurrentRound((prev) => prev + 1);
                                            startNewRound();
                                        } else {
                                            onEndGame();
                                        }
                                    }}
                                    size="lg"
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full text-xl transition-all duration-200 hover:scale-105 relative z-10 cursor-pointer"
                                >
                                    {currentRound < settings.rounds
                                        ? "Next Round"
                                        : "Finish Game"}
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log("Replay Round clicked");
                                        startNewRound();
                                    }}
                                    variant="outline"
                                    size="lg"
                                    className="border-white text-white hover:bg-white/20 font-semibold px-8 py-4 rounded-full text-xl bg-transparent transition-all duration-200 hover:scale-105 relative z-10 cursor-pointer"
                                >
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Replay Round
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
