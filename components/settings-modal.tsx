"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: {
        rounds: number;
        playersPerRound: number;
        names: string[];
        words: string[];
        warmupVideo: string;
        posingTimer: number;
        explanationTimer: number;
    };
    onSettingsChange: (settings: any) => void;
}

export default function SettingsModal({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
}: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState("game");
    const [newName, setNewName] = useState("");
    const [newWord, setNewWord] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tabs = [
        { id: "game", label: "Game" },
        { id: "names", label: "Names" },
        { id: "words", label: "Words" },
        { id: "warmup", label: "Warmup" },
    ];

    const handleSettingChange = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        onSettingsChange(newSettings);

        // Save to localStorage
        if (key === "names")
            localStorage.setItem("gameNames", JSON.stringify(value));
        if (key === "words")
            localStorage.setItem("gameWords", JSON.stringify(value));
        if (key === "warmupVideo") localStorage.setItem("warmupVideo", value);
        if (key === "rounds")
            localStorage.setItem("gameRounds", value.toString());
        if (key === "playersPerRound")
            localStorage.setItem("playersPerRound", value.toString());
        if (key === "posingTimer")
            localStorage.setItem("posingTimer", value.toString());
        if (key === "explanationTimer")
            localStorage.setItem("explanationTimer", value.toString());
    };

    const addName = () => {
        if (newName.trim()) {
            handleSettingChange("names", [...settings.names, newName.trim()]);
            setNewName("");
        }
    };

    const removeName = (index: number) => {
        handleSettingChange(
            "names",
            settings.names.filter((_, i) => i !== index)
        );
    };

    const addWord = () => {
        if (newWord.trim()) {
            handleSettingChange("words", [...settings.words, newWord.trim()]);
            setNewWord("");
        }
    };

    const removeWord = (index: number) => {
        handleSettingChange(
            "words",
            settings.words.filter((_, i) => i !== index)
        );
    };

    const handleCSVUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: "names" | "words"
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const items = text
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line);
                handleSettingChange(type, items);
            };
            reader.readAsText(file);
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Settings
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <AnimatePresence mode="wait">
                        {activeTab === "game" && (
                            <motion.div
                                key="game"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <Label htmlFor="rounds">
                                        Number of Rounds
                                    </Label>
                                    <Input
                                        id="rounds"
                                        type="number"
                                        min="1"
                                        value={settings.rounds}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "rounds",
                                                Number.parseInt(
                                                    e.target.value
                                                ) || 1
                                            )
                                        }
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="players">
                                        Number of People Called Per Round
                                    </Label>
                                    <Input
                                        id="players"
                                        type="number"
                                        min="1"
                                        value={settings.playersPerRound}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "playersPerRound",
                                                Number.parseInt(
                                                    e.target.value
                                                ) || 1
                                            )
                                        }
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="posing-timer">
                                        Posing Timer (seconds)
                                    </Label>
                                    <Input
                                        id="posing-timer"
                                        type="number"
                                        min="5"
                                        max="60"
                                        value={settings.posingTimer}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "posingTimer",
                                                Number.parseInt(
                                                    e.target.value
                                                ) || 10
                                            )
                                        }
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        How long players have to strike their
                                        pose
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="explanation-timer">
                                        Explanation Timer (seconds)
                                    </Label>
                                    <Input
                                        id="explanation-timer"
                                        type="number"
                                        min="5"
                                        max="60"
                                        value={settings.explanationTimer}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "explanationTimer",
                                                Number.parseInt(
                                                    e.target.value
                                                ) || 20
                                            )
                                        }
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        How long players have to explain their
                                        pose
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "names" && (
                            <motion.div
                                key="names"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <Button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        variant="outline"
                                        className="mb-4"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) =>
                                            handleCSVUpload(e, "names")
                                        }
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a name..."
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && addName()
                                        }
                                    />
                                    <Button onClick={addName}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                    {settings.names.map((name, index) => (
                                        <Card
                                            key={index}
                                            className="p-3 flex items-center justify-between"
                                        >
                                            <span>{name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeName(index)
                                                }
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {settings.names.length} participants
                                </p>
                            </motion.div>
                        )}

                        {activeTab === "words" && (
                            <motion.div
                                key="words"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <Button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        variant="outline"
                                        className="mb-4"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) =>
                                            handleCSVUpload(e, "words")
                                        }
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a word/phrase..."
                                        value={newWord}
                                        onChange={(e) =>
                                            setNewWord(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && addWord()
                                        }
                                    />
                                    <Button onClick={addWord}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                    {settings.words.map((word, index) => (
                                        <Card
                                            key={index}
                                            className="p-3 flex items-center justify-between"
                                        >
                                            <span>{word}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeWord(index)
                                                }
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {settings.words.length} prompts
                                </p>
                            </motion.div>
                        )}

                        {activeTab === "warmup" && (
                            <motion.div
                                key="warmup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <Label htmlFor="warmup-video">
                                        YouTube Video URL
                                    </Label>
                                    <Input
                                        id="warmup-video"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={settings.warmupVideo}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "warmupVideo",
                                                e.target.value
                                            )
                                        }
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">
                                        Paste a YouTube URL for the warmup video
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <Button onClick={onClose} className="w-full">
                        Save Settings
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
