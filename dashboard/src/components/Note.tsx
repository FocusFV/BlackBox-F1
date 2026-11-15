"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useTranslation } from "@/hooks/useTranslation";

import infoIcon from "public/icons/info.svg";

type Props = {
	className?: string;
	children: ReactNode;
};

export default function Note({ children, className }: Props) {
	const { t } = useTranslation();

	return (
		<div className={clsx("flex flex-col gap-1 border-l-4 border-blue-500 py-2 pl-4", className)}>
			<div className="flex items-center gap-1">
				<Image src={infoIcon} className="size-5" alt={"info icon"} />
				<p className="text-blue-500 font-bold uppercase tracking-wider text-xs">{t("common.note", "Nota")}</p>
			</div>
			<p>{children}</p>
		</div>
	);
}
