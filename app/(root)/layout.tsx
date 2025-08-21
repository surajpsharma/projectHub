import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            <NavBar />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </main>
    )
}