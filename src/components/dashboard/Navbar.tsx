import { Sparkles, Bell } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              <span className="gradient-text">EduMentra</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent sm:flex">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white/60 py-1 pl-1 pr-3 shadow-soft">
            <div className="gradient-brand flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
              AS
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium leading-tight">Alex Stone</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
