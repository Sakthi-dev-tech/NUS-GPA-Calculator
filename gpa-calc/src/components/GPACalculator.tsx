"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GraduationCap, Share2, ChevronDown, Check, Loader2, ToggleLeft, ToggleRight, Image, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GradeOption = { label: string; value: number; };

// Grade options for regular graded modules (S/U is handled separately as a toggle)
const GRADE_OPTIONS: GradeOption[] = [
    { label: "A+", value: 5.0 }, { label: "A", value: 5.0 }, { label: "A-", value: 4.5 },
    { label: "B+", value: 4.0 }, { label: "B", value: 3.5 }, { label: "B-", value: 3.0 },
    { label: "C+", value: 2.5 }, { label: "C", value: 2.0 }, { label: "D+", value: 1.5 },
    { label: "D", value: 1.0 }, { label: "F", value: 0.0 },
];

// Module now includes isSU flag to track S/U status
interface Module { id: string; name: string; credits: number; gradeValue: number; isSU?: boolean; }
interface Semester { id: string; label: string; modules: Module[]; }

const STORAGE_KEY = "nus-gpa-data";
const DEFAULT_SEMESTERS: Semester[] = [
    {
        id: "sem-1", label: "Year 1 Sem 1",
        modules: [
            { id: "1", name: "CS1010", credits: 4, gradeValue: 5.0 },
            { id: "2", name: "MA1521", credits: 4, gradeValue: 4.5 },
        ],
    },
    {
        id: "sem-2", label: "Year 1 Sem 2",
        modules: [{ id: "3", name: "CS2030", credits: 4, gradeValue: 4.0 }],
    },
];

// Utility to encode data for URL
const encodeData = (data: Semester[]): string => {
    try {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json));
    } catch {
        return "";
    }
};

// Utility to decode data from URL
const decodeData = (encoded: string): Semester[] | null => {
    try {
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    } catch {
        return null;
    }
};

// Get initial state: URL param > localStorage > defaults
const getInitialState = (): Semester[] => {
    if (typeof window === "undefined") return DEFAULT_SEMESTERS;

    // Check URL params first (for sharing)
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");
    if (dataParam) {
        const decoded = decodeData(dataParam);
        if (decoded) {
            // Clear the URL param after loading
            window.history.replaceState({}, "", window.location.pathname);
            return decoded;
        }
    }

    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // Invalid data, use defaults
        }
    }

    return DEFAULT_SEMESTERS;
};

export default function GPACalculator() {
    const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_SEMESTERS);
    const [isInitialized, setIsInitialized] = useState(false);
    const [shareState, setShareState] = useState<"idle" | "loading" | "success">("idle");
    const [showImageModal, setShowImageModal] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageGenerating, setImageGenerating] = useState(false);

    // Initialize state from URL/localStorage on mount
    useEffect(() => {
        setSemesters(getInitialState());
        setIsInitialized(true);
    }, []);

    // Save to localStorage on change (after initialization)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
        }
    }, [semesters, isInitialized]);

    const addSemester = () => {
        let nextYear = 1, nextSem = 1;
        if (semesters.length > 0) {
            const match = semesters[semesters.length - 1].label.match(/Year (\d+) Sem (\d+)/);
            if (match) {
                const [y, s] = [parseInt(match[1]), parseInt(match[2])];
                s === 1 ? (nextYear = y, nextSem = 2) : (nextYear = y + 1, nextSem = 1);
            }
        }
        setSemesters([...semesters, { id: `sem-${Date.now()}`, label: `Year ${nextYear} Sem ${nextSem}`, modules: [] }]);
    };

    const updateSemesterLabel = (id: string, label: string) => setSemesters(semesters.map(s => s.id === id ? { ...s, label } : s));
    const removeSemester = (id: string) => setSemesters(semesters.filter(s => s.id !== id));

    const addModule = (semId: string) => {
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: [...s.modules, { id: Math.random().toString(36).substr(2, 9), name: "", credits: 4, gradeValue: 5.0, isSU: false }] } : s));
    };

    const removeModule = (semId: string, modId: string) => {
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: s.modules.filter(m => m.id !== modId) } : s));
    };

    const updateModule = (semId: string, modId: string, field: keyof Module, value: string | number | boolean) => {
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: s.modules.map(m => m.id === modId ? { ...m, [field]: value } : m) } : s));
    };

    // Toggle S/U status for a module
    const toggleSU = (semId: string, modId: string) => {
        setSemesters(semesters.map(s => s.id === semId ? {
            ...s,
            modules: s.modules.map(m => m.id === modId ? { ...m, isSU: !m.isSU } : m)
        } : s));
    };

    // Calculate GPA (CAP) - excludes S/U modules from calculation
    // Per NUS rules: S/U modules' grade points AND MCs are excluded from CAP calculation
    const calculateGPA = (mods: Module[]) => {
        // Filter out S/U modules - they don't count toward GPA
        const graded = mods.filter(m => !m.isSU && m.gradeValue >= 0);
        const points = graded.reduce((a, m) => a + m.gradeValue * m.credits, 0);
        const credits = graded.reduce((a, m) => a + m.credits, 0);
        return credits === 0 ? "0.00" : (points / credits).toFixed(2);
    };

    const cumulative = useMemo(() => calculateGPA(semesters.flatMap(s => s.modules)), [semesters]);

    // Total credits counts ALL modules (including S/U) - these MCs still count toward graduation requirements
    // Per NUS rules: 'S' grade modules contribute to graduation MCs (only 'U' grade doesn't, but we count all for total taken)
    const totalCredits = useMemo(() => semesters.flatMap(s => s.modules).reduce((a, m) => a + m.credits, 0), [semesters]);

    // Graded credits (for display) - excludes S/U modules
    const gradedCredits = useMemo(() => semesters.flatMap(s => s.modules).filter(m => !m.isSU).reduce((a, m) => a + m.credits, 0), [semesters]);

    // Handle share button click
    const handleShare = useCallback(async () => {
        if (shareState === "loading") return;

        setShareState("loading");
        try {
            // Encode the data
            const encoded = encodeData(semesters);
            const baseUrl = window.location.origin + window.location.pathname;
            const fullUrl = `${baseUrl}?data=${encoded}`;

            // Shorten URL using is.gd API
            const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(fullUrl)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            let urlToCopy = fullUrl;
            if (data.shorturl) {
                urlToCopy = data.shorturl;
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(urlToCopy);
            setShareState("success");

            // Reset after 2 seconds
            setTimeout(() => setShareState("idle"), 2000);
        } catch (error) {
            console.error("Failed to share:", error);
            // Fallback: copy the long URL
            const encoded = encodeData(semesters);
            const baseUrl = window.location.origin + window.location.pathname;
            const fullUrl = `${baseUrl}?data=${encoded}`;
            await navigator.clipboard.writeText(fullUrl);
            setShareState("success");
            setTimeout(() => setShareState("idle"), 2000);
        }
    }, [semesters, shareState]);

    // Generate shareable image with GPA stats
    const generateImage = useCallback(async () => {
        setImageGenerating(true);

        // First, generate the shortened URL
        let shortUrl = "tinyurl.com/NUSGPACalculator";
        try {
            const encoded = encodeData(semesters);
            const baseUrl = window.location.origin + window.location.pathname;
            const fullUrl = `${baseUrl}?data=${encoded}`;

            // Shorten URL using is.gd API
            const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(fullUrl)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.shorturl) {
                // Extract just the domain and path (remove https://)
                shortUrl = data.shorturl.replace("https://", "").replace("http://", "");
            }
        } catch (error) {
            console.error("Failed to generate short URL:", error);
            // Use default URL if shortening fails
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            setImageGenerating(false);
            return;
        }

        // Canvas dimensions (optimized for social media - 1200x630 for Twitter/Facebook)
        const width = 1200;
        const height = 630;
        canvas.width = width;
        canvas.height = height;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#0f172a"); // slate-900
        gradient.addColorStop(0.5, "#1e293b"); // slate-800
        gradient.addColorStop(1, "#0f172a"); // slate-900
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add subtle pattern overlay
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < width; i += 40) {
            for (let j = 0; j < height; j += 40) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(i, j, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        // Decorative elements - orange accent circle
        ctx.fillStyle = "#ef7d00";
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(width - 100, 100, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Blue accent circle
        ctx.fillStyle = "#003d7c";
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(100, height - 80, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Title - measure each part to position correctly
        ctx.font = "bold 36px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";

        const nusText = "NUS ";
        const gpaText = "GPA ";
        const calcText = "Calculator";

        let xPos = 60;

        // Draw "NUS "
        ctx.fillStyle = "#94a3b8"; // slate-400
        ctx.fillText(nusText, xPos, 70);
        xPos += ctx.measureText(nusText).width;

        // Draw "GPA "
        ctx.fillStyle = "#ef7d00"; // NUS orange
        ctx.fillText(gpaText, xPos, 70);
        xPos += ctx.measureText(gpaText).width;

        // Draw "Calculator"
        ctx.fillStyle = "#f8fafc"; // slate-50
        ctx.fillText(calcText, xPos, 70);

        // Main GPA display - large centered
        const gpaValue = cumulative;

        // GPA Label
        ctx.font = "600 18px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#64748b"; // slate-500
        ctx.textAlign = "center";
        ctx.fillText("CUMULATIVE GPA", width / 2, 180);

        // GPA Value - big and bold
        ctx.font = "900 140px Inter, system-ui, sans-serif";
        const gpaGradient = ctx.createLinearGradient(width / 2 - 150, 200, width / 2 + 150, 340);
        gpaGradient.addColorStop(0, "#ef7d00"); // NUS orange
        gpaGradient.addColorStop(1, "#003d7c"); // NUS blue
        ctx.fillStyle = gpaGradient;
        ctx.fillText(gpaValue, width / 2, 320);

        // Stats row
        const statsY = 400;
        const statsWidth = 200;

        // Graded MCs
        ctx.font = "600 14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("GRADED MCS", width / 2 - statsWidth, statsY);
        ctx.font = "bold 48px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(gradedCredits.toString(), width / 2 - statsWidth, statsY + 55);

        // Total MCs
        ctx.font = "600 14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("TOTAL MCS", width / 2 + statsWidth, statsY);
        ctx.font = "bold 48px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(totalCredits.toString(), width / 2 + statsWidth, statsY + 55);

        // Semesters count
        ctx.font = "600 14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("SEMESTERS", width / 2, statsY);
        ctx.font = "bold 48px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(semesters.length.toString(), width / 2, statsY + 55);

        // Semester breakdown (compact)
        if (semesters.length > 0) {
            const semY = 510;
            const maxSems = Math.min(semesters.length, 6);
            const semWidth = (width - 120) / maxSems;

            semesters.slice(0, maxSems).forEach((sem, i) => {
                const x = 60 + semWidth * i + semWidth / 2;
                const semGPA = calculateGPA(sem.modules);

                // Semester label
                ctx.font = "500 11px Inter, system-ui, sans-serif";
                ctx.fillStyle = "#64748b";
                ctx.textAlign = "center";
                // Shorten label
                const shortLabel = sem.label.replace("Year ", "Y").replace("Sem ", "S");
                ctx.fillText(shortLabel, x, semY);

                // Semester GPA
                ctx.font = "bold 22px Inter, system-ui, sans-serif";
                ctx.fillStyle = "#ef7d00";
                ctx.fillText(semGPA, x, semY + 28);
            });

            if (semesters.length > 6) {
                ctx.font = "500 12px Inter, system-ui, sans-serif";
                ctx.fillStyle = "#64748b";
                ctx.fillText(`+${semesters.length - 6} more`, width - 60, semY + 14);
            }
        }

        // Footer with URL and branding
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#ef7d00"; // NUS orange for URL
        ctx.textAlign = "center";
        ctx.fillText(shortUrl, width / 2, height - 45);

        ctx.font = "500 13px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.textAlign = "center";
        ctx.fillText("Built for NUS Students 🧡💙", width / 2, height - 20);

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/png");
        setGeneratedImage(dataUrl);
        setShowImageModal(true);
        setImageGenerating(false);
    }, [cumulative, gradedCredits, totalCredits, semesters, calculateGPA]);

    // Download the generated image
    const downloadImage = useCallback(() => {
        if (!generatedImage) return;
        const link = document.createElement("a");
        link.download = `nus-gpa-${cumulative}.png`;
        link.href = generatedImage;
        link.click();
    }, [generatedImage, cumulative]);

    return (
        <div className="w-full max-w-5xl mx-auto px-3 md:px-8 py-4 md:py-8 font-sans pb-24 md:pb-32">
            <header className="mb-6 md:mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sticky top-0 md:top-2 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-4 -mx-4 px-4 md:rounded-b-3xl border-b border-slate-200/50">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-nus-blue-deep flex items-center gap-2">
                    GPA <span className="text-nus-orange">Calculator</span>
                </h1>

                {/* Stats Container - responsive layout */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* GPA and MCs stats */}
                    <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-900 p-3 sm:p-2 sm:pr-4 rounded-2xl sm:rounded-full shadow-sm border border-slate-200 overflow-x-auto">
                        <div className="flex flex-col items-center sm:items-end pl-2 sm:pl-4 min-w-[80px]">
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cumulative</p>
                            <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-nus-orange to-nus-blue leading-none">{cumulative}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center sm:items-start min-w-[70px]">
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Graded MCs</p>
                            <div className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 leading-none">{gradedCredits}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center sm:items-start min-w-[70px]">
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Total MCs</p>
                            <div className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 leading-none">{totalCredits}</div>
                        </div>
                    </div>

                    {/* Share and Generate Image buttons */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleShare}
                            disabled={shareState === "loading"}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center gap-2 px-4 py-3 sm:py-2 rounded-2xl sm:rounded-full font-bold shadow-md transition-all text-sm justify-center",
                                shareState === "success"
                                    ? "bg-green-500 text-white"
                                    : "bg-nus-orange text-white hover:bg-orange-600 active:scale-95",
                                shareState === "loading" && "opacity-80 cursor-wait"
                            )}
                        >
                            {shareState === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                            {shareState === "success" && <Check className="w-4 h-4" />}
                            {shareState === "idle" && <Share2 className="w-4 h-4" />}
                            {shareState === "success" ? "Copied!" : "Share"}
                        </button>

                        <button
                            onClick={generateImage}
                            disabled={imageGenerating}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center gap-2 px-4 py-3 sm:py-2 rounded-2xl sm:rounded-full font-bold shadow-md transition-all text-sm justify-center",
                                "bg-nus-blue text-white hover:bg-blue-700 active:scale-95",
                                imageGenerating && "opacity-80 cursor-wait"
                            )}
                            title="Generate shareable image"
                        >
                            {imageGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                            <span className="hidden sm:inline">Image</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="space-y-6 md:space-y-8">
                {semesters.map((sem, i) => (
                    <motion.div key={sem.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                        {i !== semesters.length - 1 && <div className="absolute left-8 top-full h-6 md:h-8 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="bg-slate-50/80 dark:bg-slate-800/50 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-nus-blue text-white text-xs font-bold shadow-lg shadow-nus-blue/20">{i + 1}</span>
                                    <input value={sem.label} onChange={(e) => updateSemesterLabel(sem.id, e.target.value)} className="text-base md:text-lg font-bold text-nus-blue-deep dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-nus-orange focus:outline-none w-full sm:w-auto transition-colors py-1" />
                                </div>
                                <div className="flex items-center gap-3 md:gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-slate-500 font-medium bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-xs md:text-sm">SAP: <span className="text-nus-orange font-bold">{calculateGPA(sem.modules)}</span></span>
                                    <button onClick={() => removeSemester(sem.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full touch-manipulation"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-2 bg-slate-50 dark:bg-slate-900 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <div className="col-span-5 md:col-span-5">Module</div>
                                <div className="col-span-2 text-center">MCs</div>
                                <div className="col-span-3 md:col-span-2 text-center">Grade</div>
                                <div className="col-span-2 text-center">S/U</div>
                                <div className="col-span-0 md:col-span-1"></div>
                            </div>

                            <div className="p-2 md:p-2">
                                <AnimatePresence initial={false}>
                                    {sem.modules.map((m) => (
                                        <motion.div key={m.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className={cn("grid grid-cols-12 gap-2 items-center p-2 md:p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group", m.isSU && "bg-purple-50/50 dark:bg-purple-900/10")}>
                                            {/* Module Name */}
                                            <div className="col-span-5 md:col-span-5"><input type="text" value={m.name} onChange={(e) => updateModule(sem.id, m.id, "name", e.target.value)} className="w-full bg-transparent text-slate-700 dark:text-slate-200 font-semibold text-sm md:text-sm focus:outline-none focus:ring-1 focus:ring-nus-blue/20 rounded px-2 py-2 md:py-1.5 placeholder-slate-300 touch-manipulation" placeholder="Module Code" /></div>

                                            {/* Credits */}
                                            <div className="col-span-2 flex justify-center"><input type="number" min="0" max="20" value={m.credits} onChange={(e) => updateModule(sem.id, m.id, "credits", Number(e.target.value))} className="w-12 md:w-12 text-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-md py-2 md:py-1 focus:outline-none focus:ring-1 focus:ring-nus-blue/20 touch-manipulation" /></div>

                                            {/* Grade */}
                                            <div className="col-span-3 md:col-span-2 flex justify-center">
                                                <div className={cn("relative w-full", m.isSU && "opacity-40 pointer-events-none")}>
                                                    <select value={m.gradeValue} onChange={(e) => updateModule(sem.id, m.id, "gradeValue", Number(e.target.value))} disabled={m.isSU} className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-md py-2 md:py-1 px-2 text-center text-sm focus:outline-none focus:border-nus-orange transition-colors touch-manipulation">{GRADE_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}</select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400"><ChevronDown className="h-3 w-3" /></div>
                                                </div>
                                            </div>

                                            {/* S/U Toggle */}
                                            <div className="col-span-2 flex justify-center">
                                                <button
                                                    onClick={() => toggleSU(sem.id, m.id)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-1 px-2 md:px-2 py-2 md:py-1 rounded-full text-xs font-bold transition-all touch-manipulation",
                                                        m.isSU
                                                            ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                    )}
                                                    title={m.isSU ? "Module is S/U'd - Click to remove" : "Click to S/U this module"}
                                                >
                                                    {m.isSU ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">{m.isSU ? "S/U" : "Off"}</span>
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="col-span-0 md:col-span-1 flex justify-center"><button onClick={() => removeModule(sem.id, m.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation" tabIndex={-1}><Trash2 className="w-3.5 h-3.5" /></button></div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <button onClick={() => addModule(sem.id)} className="w-full mt-2 py-3 md:py-2 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium uppercase tracking-wide rounded-lg hover:border-nus-blue hover:text-nus-blue hover:bg-nus-blue/5 transition-all flex items-center justify-center gap-2 touch-manipulation"><Plus className="w-3 h-3" /> Add Module</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={addSemester} className="w-full py-5 md:py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-nus-blue font-bold flex items-center justify-center gap-3 hover:shadow-md hover:border-nus-blue/30 transition-all group touch-manipulation"><div className="w-8 h-8 rounded-full bg-nus-blue/10 flex items-center justify-center group-hover:bg-nus-blue group-hover:text-white transition-colors"><Plus className="w-5 h-5" /></div><span>Add Next Semester</span></motion.button>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-4 md:py-3 text-center text-slate-400 text-xs z-40"><p>Built for NUS Students 🧡💙</p></footer>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {showImageModal && generatedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 rounded-2xl p-4 max-w-3xl w-full shadow-2xl border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-lg">Share Your GPA</h3>
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Image Preview */}
                            <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-800">
                                <img
                                    src={generatedImage}
                                    alt="GPA Stats"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={downloadImage}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-nus-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Image
                                </button>
                                <button
                                    onClick={async () => {
                                        if (generatedImage) {
                                            try {
                                                // Convert data URL to blob
                                                const response = await fetch(generatedImage);
                                                const blob = await response.blob();
                                                // Copy image blob to clipboard
                                                await navigator.clipboard.write([
                                                    new ClipboardItem({ [blob.type]: blob })
                                                ]);
                                            } catch (err) {
                                                console.error("Failed to copy image:", err);
                                            }
                                        }
                                    }}
                                    className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all active:scale-95"
                                    title="Copy image to clipboard"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                </button>
                            </div>

                            {/* Tip */}
                            <p className="text-slate-500 text-xs text-center mt-4">
                                💡 Save this image and share it on Instagram, Twitter, or LinkedIn!
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
