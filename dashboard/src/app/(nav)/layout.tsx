import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import githubIcon from "public/icons/github.svg";
import coffeeIcon from "public/icons/bmc-logo.svg";

import Footer from "@/components/Footer";

type Props = {
    children: ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <>
            {/* Barra de navegación superior fija en toda la pantalla */}
            <nav className="sticky top-0 left-0 z-10 flex h-12 w-full items-center justify-between gap-4 border-b border-zinc-700 p-2 px-4 backdrop-blur-lg bg-zinc-950/70">
                <div className="flex gap-4 font-medium text-zinc-200">
                    <Link className="transition duration-100 hover:text-red-500 active:scale-95" href="/">
                        Página Principal
                    </Link>
                    <Link className="transition duration-100 hover:text-red-500 active:scale-95" href="/dashboard">
                        Panel
                    </Link>
                    <Link className="transition duration-100 hover:text-red-500 active:scale-95" href="/schedule">
                        Calendario
                    </Link>
                    <Link className="transition duration-100 hover:text-red-500 active:scale-95" href="/help">
                        Ayuda
                    </Link>
                </div>

                <div className="hidden items-center gap-4 pr-2 sm:flex text-zinc-200">
                    <Link
                        className="flex items-center gap-2 transition duration-100 hover:text-red-500 active:scale-95"
                        href="https://buymeacoffee.com/focusfv"
                        target="_blank"
                    >
                        <Image src={coffeeIcon} alt="Buy Me A Coffee" width={20} height={20} />
                        <span>Un Cafe?</span>
                    </Link>

                    <Link
                        className="flex items-center gap-2 transition duration-100 hover:text-red-500 active:scale-95"
                        href="https://github.com/FocusFV/BlackBox-F1"
                        target="_blank"
                    >
                        <Image src={githubIcon} alt="GitHub" width={20} height={20} />
                        <span>GitHub</span>
                    </Link>
                </div>
            </nav>

            {/* Contenedor principal sin límites para que el fondo de la home ocupe el 100% de la pantalla */}
            <main className="w-full">
                {children}

                {/* El footer se mantiene contenido y centrado de forma elegante */}
                <div className="container mx-auto max-w-(--breakpoint-lg) px-4">
                    <Footer />
                </div>
            </main>
        </>
    );
}