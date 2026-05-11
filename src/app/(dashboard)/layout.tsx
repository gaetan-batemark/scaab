export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 flex-col bg-[#001F4D]">
        {/* Sidebar - TODO */}
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
