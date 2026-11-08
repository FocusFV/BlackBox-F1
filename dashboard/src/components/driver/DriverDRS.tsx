import clsx from "clsx";

type Props = {
	on: boolean;
	possible: boolean;
	inPit: boolean;
	pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
	const pit = inPit || pitOut;

	return (
		<span
			title={
				pit
					? "Monoplaza en Boxes"
					: on
					? "BOOST ACTIVO - Despliegue de potencia / DRS habilitado"
					: possible
					? "BOOST DISPONIBLE - A menos de 1s para sobrepaso"
					: "BOOST APAGADO - Fuera de rango (>1s)"
			}
			className={clsx(
				"text-[10px] inline-flex h-7 w-full items-center justify-center rounded-md border font-mono font-black uppercase tracking-wider select-none transition-all duration-300",
				{
					// APAGADO: Fuera de rango o en boxes
					"border-zinc-800/80 text-zinc-600 bg-zinc-950/40": (!pit && !on && !possible) || pit,
					// DISPONIBLE / LISTO: A menos de 1s del auto de adelante (Dorado Amber brillante)
					"border-amber-500/60 text-amber-300 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.25)]": !pit && !on && possible,
					// ACTIVO: Desplegando en recta o con DRS abierto (Verde Neón con pulso)
					"border-emerald-400 text-emerald-300 bg-emerald-950/60 shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse": !pit && on,
				},
			)}
		>
			BOOST
		</span>
	);
}
