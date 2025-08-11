"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MechanicsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartGame: () => void;
    settings: {
        rounds: number;
        playersPerRound: number;
        names: string[];
        words: string[];
        warmupVideo: string;
        posingTimer: number;
    };
}

export default function MechanicsModal({
    isOpen,
    onClose,
    onStartGame,
    settings,
}: MechanicsModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const steps = [
        {
            id: 1,
            title: "See the Prompt",
            image: "/step1.webp",
            description: (
                <p className="text-gray-700 text-lg leading-relaxed">
                    The screen displays <strong>"Post Like a..."</strong>{" "}
                    followed by a random word or phrase (like "a superhero" or
                    "someone famous"). Get ready to be creative!
                </p>
            ),
        },
        {
            id: 2,
            title: "Strike Your Pose",
            image: "/step2.webp",
            description: (
                <p className="text-gray-700 text-lg leading-relaxed">
                    All players have{" "}
                    <strong>{settings.posingTimer} seconds</strong> to pose
                    according to their interpretation. Watch the countdown timer
                    - when it hits zero, freeze in your pose!
                </p>
            ),
        },
        {
            id: 3,
            title: "Random Player Selection",
            image: "/step3.jpeg",
            description: (
                <p className="text-gray-700 text-lg leading-relaxed">
                    The slot machine spins and randomly selects{" "}
                    <strong>
                        {settings.playersPerRound === 1
                            ? "one player"
                            : `${settings.playersPerRound} players`}
                    </strong>{" "}
                    to explain their pose. Selected players won't be picked
                    again in the same round.
                </p>
            ),
        },
        {
            id: 4,
            title: "Explain Your Pose",
            image: "/step4.webp",
            description: (
                <p className="text-gray-700 text-lg leading-relaxed">
                    The selected player explains their creative interpretation.
                    Everyone listens and enjoys the fun reasoning behind the
                    pose!
                </p>
            ),
        },
        {
            id: 5,
            title: "Continue the Game",
            image: "/step5.webp",
            description: (
                <p className="text-gray-700 text-lg leading-relaxed">
                    After the explanation, click <strong>"Next"</strong> to
                    either select more players (if set to multiple per round) or
                    move to the next round. The game continues until all rounds
                    are complete!
                </p>
            ),
        },
    ];

    const currentStepData = steps[currentStep - 1];

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            onStartGame();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            How to Play
                        </h2>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: `${
                                        (currentStep / totalSteps) * 100
                                    }%`,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Step {currentStep}</span>
                            <span>
                                {Math.round((currentStep / totalSteps) * 100)}%
                                Complete
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="ml-4"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Step number and title */}
                            <div className="flex flex-row items-center gap-4">
                                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                                    {currentStep}
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">
                                    {currentStepData.title}
                                </h3>
                            </div>

                            {/* Image */}
                            <div className="flex justify-center">
                                <Image
                                    src={
                                        currentStepData.image ||
                                        "/placeholder.svg"
                                    }
                                    alt={currentStepData.title}
                                    width={500}
                                    height={400}
                                    className="rounded-lg shadow-md"
                                />
                            </div>

                            {/* Description */}
                            <div>{currentStepData.description}</div>

                            {/* Special note for final step */}
                            {currentStep === totalSteps && (
                                <div className="bg-purple-50 rounded-xl p-4 max-w-md mx-auto">
                                    <p className="text-purple-700 font-medium">
                                        🎉 Ready to start? Be creative, have
                                        fun, and remember - there are no wrong
                                        answers!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer with navigation */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onStartGame}
                            className="bg-transparent"
                        >
                            Skip Tutorial
                        </Button>
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="bg-transparent"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                            {currentStep} of {totalSteps}
                        </span>
                        <Button
                            onClick={handleNext}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {currentStep === totalSteps ? (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Playing!
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
