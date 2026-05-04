import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} PiezaLink — Marketplace de Repuestos Automotrices
        </div>
      </footer>
    </>
  );
}
