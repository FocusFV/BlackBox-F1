import Link from "next/link";
import Image from "next/image";

// Usamos el nombre exacto de tu archivo definitivo
import logoFocus from "public/FocusFVLogo.png"; 

export default function Footer() {
	return (
		// bg-transparent asegura que la fibra de carbono y el mosaico de la home pasen de largo sin hachazos negros
		<footer className="mt-12 mb-8 border-t border-zinc-900/40 pt-8 text-sm text-zinc-500 tracking-wide font-medium relative z-10 w-full flex flex-col items-center bg-transparent">
			
			{/* CONTENEDOR DE TEXTOS CON OPACIDAD GENERAL PARA QUE SE INTEGREN AL FONDO */}
			<div className="opacity-60 hover:opacity-90 transition-opacity duration-300 flex flex-col items-center w-full">
				
				{/* FILA DE ENLACES TOTALMENTE CENTRADA */}
				<div className="mb-4 flex flex-col items-center gap-3 border-b border-zinc-900/30 pb-4 w-full">
					<div className="flex flex-wrap justify-center items-center text-center gap-x-6 gap-y-2">
						<p className="text-zinc-400">
							Evolución Open Source basada en el proyecto original de <TextLink website="https://slowly.dev">Slowly</TextLink>.
						</p>
						
						<p>
							Código y refactorización en <TextLink website="https://github.com/FocusFV/BlackBox-F1">GitHub</TextLink>.
						</p>

						<p>
							¿Te copa el proyecto? <TextLink website="https://buymeacoffee.com/focusfv">Invitame un café</TextLink>.
						</p>

						<p>
							¿Necesitás una mano? {" "}
							<Link className="text-amber-500/80 hover:text-amber-400 transition font-semibold" href="/help">
								Soporte y Ayuda
							</Link>.
						</p>
					</div>

					{/* VERSIÓN DEL SOFTWARE */}
					<div className="text-xs text-zinc-500 font-mono bg-zinc-900/20 px-2 py-0.5 rounded border border-zinc-900/40 mt-1">
						v4.0.3
					</div>
				</div>

				{/* DESCLÁIMER OFICIAL DE F1 (Centrado y sutil) */}
				<div className="text-xs text-zinc-600 leading-relaxed max-w-4xl text-center px-4 mb-2">
					<p>
						Este sitio web es de carácter independiente, no oficial y no se encuentra vinculado, asociado ni patrocinado de ninguna forma por las empresas del grupo Formula 1. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX y sus logotipos relacionados son marcas comerciales registradas propiedad de Formula One Licensing B.V.
					</p>
				</div>
			</div>

			{/* FIRMA DEL DESARROLLADOR: FULL COLOR, DESTACADA Y CON RESPLANDOR */}
			<div className="mt-6 pt-6 border-t border-zinc-900/40 flex flex-col items-center justify-center gap-3 w-full">
				<span className="text-[11px] tracking-[0.3em] uppercase text-zinc-600 font-black">
					Desarrollado y Optimizado por
				</span>
				
				<Link 
					href="https://github.com/FocusFV" 
					target="_blank" 
					className="hover:scale-105 transition duration-300 mt-1 block"
				>
					{/* Tu logo FocusFVLogo.png gigante (h-24), a color real y con resplandor dorado interactivo */}
					<Image 
						src={logoFocus} 
						alt="FocusFV Desarrollador" 
						width={380} 
						height={110} 
						className="h-24 w-auto object-contain brightness-110 drop-shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:brightness-125 hover:drop-shadow-[0_0_40px_rgba(245,158,11,0.4)] transition duration-300 select-none"
					/>
				</Link>
			</div>

		</footer>
	);
}

type TextLinkProps = {
	website: string;
	children: string;
};

const TextLink = ({ website, children }: TextLinkProps) => {
	return (
		<a className="text-amber-500/80 hover:text-amber-400 transition-colors duration-150 font-semibold" target="_blank" href={website}>
			{children}
		</a>
	);
};