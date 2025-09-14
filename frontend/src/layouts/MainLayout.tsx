import { useEffect } from 'react';

import { Outlet } from 'react-router-dom'
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const MainLayout = () => {

    useEffect(() => {
        document.body.classList.add('no-scrollbar');
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 ">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-slate-800 shadow-sm">
                    <Navbar />
                </header>
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
