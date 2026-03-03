import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}