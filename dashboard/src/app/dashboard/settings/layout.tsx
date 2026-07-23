import type { ReactNode } from "react";

type Props = Readonly<{
	children: ReactNode;
}>;

export default function Layout({ children }: Props) {
	return (
		<div className="w-full min-h-screen flex justify-center items-start p-4 md:p-8">
			<div className="w-full max-w-4xl">{children}</div>
		</div>
	);
}