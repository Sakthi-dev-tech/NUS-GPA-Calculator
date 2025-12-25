"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GraduationCap, Share2, ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GradeOption = { label: string; value: number; };

const GRADE_OPTIONS: GradeOption[] = [
    { label: "A+", value: 5.0 }, { label: "A", value: 5.0 }, { label: "A-", value: 4.5 },
    { label: "B+", value: 4.0 }, { label: "B", value: 3.5 }, { label: "B-", value: 3.0 },
    { label: "C+", value: 2.5 }, { label: "C", value: 2.0 }, { label: "D+", value: 1.5 },
    { label: "D", value: 1.0 }, { label: "F", value: 0.0 },
    { label: "S", value: -1 }, { label: "U", value: -1 },
];

interface Module { id: string; name: string; credits: number; gradeValue: number; }
interface Semester { id: string; label: string; modules: Module[]; }

export default function GPACalculator() {
    const [semesters, setSemesters] = useState<Semester[]>([
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
    ]);

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
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: [...s.modules, { id: Math.random().toString(36).substr(2, 9), name: "", credits: 4, gradeValue: 5.0 }] } : s));
    };

    const removeModule = (semId: string, modId: string) => {
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: s.modules.filter(m => m.id !== modId) } : s));
    };

    const updateModule = (semId: string, modId: string, field: keyof Module, value: string | number) => {
        setSemesters(semesters.map(s => s.id === semId ? { ...s, modules: s.modules.map(m => m.id === modId ? { ...m, [field]: value } : m) } : s));
    };

    const calculateGPA = (mods: Module[]) => {
        const graded = mods.filter(m => m.gradeValue >= 0);
        const points = graded.reduce((a, m) => a + m.gradeValue * m.credits, 0);
        const credits = graded.reduce((a, m) => a + m.credits, 0);
        return credits === 0 ? "0.00" : (points / credits).toFixed(2);
    };

    const cumulative = useMemo(() => calculateGPA(semesters.flatMap(s => s.modules)), [semesters]);
    const totalCredits = useMemo(() => semesters.flatMap(s => s.modules).reduce((a, m) => a + m.credits, 0), [semesters]);

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans pb-32">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6 sticky top-2 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 rounded-b-3xl border-b border-slate-200/50">
                <h1 className="text-3xl md:text-4xl font-extrabold text-nus-blue-deep flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-nus-orange" /> NUS GPA <span className="text-nus-orange">Calc</span>
                </h1>
                <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-2 pr-6 rounded-full shadow-sm border border-slate-200">
                    <div className="flex flex-col items-end pl-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cumulative</p>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-nus-orange to-nus-blue leading-none">{cumulative}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits</p>
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-none">{totalCredits}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <button
                        onClick={() => alert("Link copied to clipboard!")}
                        className="flex items-center gap-2 bg-nus-orange text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-orange-600 transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </header>

            <main className="space-y-8">
                {semesters.map((sem, i) => (
                    <motion.div key={sem.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                        {i !== semesters.length - 1 && <div className="absolute left-8 top-full h-8 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="bg-slate-50/80 dark:bg-slate-800/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-nus-blue text-white text-xs font-bold shadow-lg shadow-nus-blue/20">{i + 1}</span>
                                    <input value={sem.label} onChange={(e) => updateSemesterLabel(sem.id, e.target.value)} className="text-lg font-bold text-nus-blue-deep dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-nus-orange focus:outline-none w-full sm:w-auto transition-colors" />
                                </div>
                                <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-slate-500 font-medium bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">SAP: <span className="text-nus-orange font-bold">{calculateGPA(sem.modules)}</span></span>
                                    <button onClick={() => removeSemester(sem.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <div className="col-span-5 md:col-span-6">Module</div>
                                <div className="col-span-3 md:col-span-2 text-center">MCs</div>
                                <div className="col-span-3 text-center">Grade</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="p-2">
                                <AnimatePresence initial={false}>
                                    {sem.modules.map((m) => (
                                        <motion.div key={m.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <div className="col-span-5 md:col-span-6"><input type="text" value={m.name} onChange={(e) => updateModule(sem.id, m.id, "name", e.target.value)} className="w-full bg-transparent text-slate-700 dark:text-slate-200 font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-nus-blue/20 rounded px-2 py-1.5 placeholder-slate-300" placeholder="Module Code" /></div>
                                            <div className="col-span-3 md:col-span-2 flex justify-center"><input type="number" min="0" max="20" value={m.credits} onChange={(e) => updateModule(sem.id, m.id, "credits", Number(e.target.value))} className="w-12 text-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-nus-blue/20" /></div>
                                            <div className="col-span-3 flex justify-center"><div className="relative w-full md:w-24"><select value={m.gradeValue} onChange={(e) => updateModule(sem.id, m.id, "gradeValue", Number(e.target.value))} className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-md py-1 px-2 text-center text-sm focus:outline-none focus:border-nus-orange transition-colors">{GRADE_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}</select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400"><ChevronDown className="h-3 w-3" /></div></div></div>
                                            <div className="col-span-1 flex justify-center"><button onClick={() => removeModule(sem.id, m.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100" tabIndex={-1}><Trash2 className="w-3.5 h-3.5" /></button></div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <button onClick={() => addModule(sem.id)} className="w-full mt-2 py-2 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium uppercase tracking-wide rounded-lg hover:border-nus-blue hover:text-nus-blue hover:bg-nus-blue/5 transition-all flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> Add Module</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={addSemester} className="w-full py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-nus-blue font-bold flex items-center justify-center gap-3 hover:shadow-md hover:border-nus-blue/30 transition-all group"><div className="w-8 h-8 rounded-full bg-nus-blue/10 flex items-center justify-center group-hover:bg-nus-blue group-hover:text-white transition-colors"><Plus className="w-5 h-5" /></div><span>Add Next Semester</span></motion.button>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-3 text-center text-slate-400 text-xs z-40"><p>Built for NUS Students 🧡💙</p></footer>
        </div>
    );
}
