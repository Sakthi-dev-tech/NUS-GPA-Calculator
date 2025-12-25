import GPACalculator from "@/components/GPACalculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-10 md:py-20 select-none">
      <div className="w-full max-w-6xl px-4 z-10">
        <GPACalculator />
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-400/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
