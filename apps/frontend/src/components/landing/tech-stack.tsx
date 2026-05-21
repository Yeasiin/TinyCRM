"use client";

const techItems = [
  { name: "Next.js", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Google Sheets API", category: "Data" },
  { name: "Better Auth", category: "Auth" },
  { name: "Bun", category: "Runtime" },
  { name: "React Query", category: "State" },
  { name: "Recharts", category: "Charts" },
];

export function TechStackSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#020617] sm:text-4xl">
            Built with modern tools
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Lightweight, type-safe, and fast. The stack you'd choose yourself.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {techItems.map((tech) => (
            <div
              key={tech.name}
              className="flex flex-col items-center justify-center rounded-lg border bg-slate-50/50 p-4 text-center transition-colors hover:bg-slate-100"
            >
              <span className="text-sm font-semibold text-[#020617]">
                {tech.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
