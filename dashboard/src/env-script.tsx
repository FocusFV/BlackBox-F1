import Script from "next/script";

import { PUBLIC_ENV_KEY } from "@/env";

// only list env vars that can be exposed to the client

export const getPublicEnv = () => ({
	NEXT_PUBLIC_LIVE_URL: process.env.NEXT_PUBLIC_LIVE_URL,
	NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
	NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
	NEXT_PUBLIC_AD_SLOT_LEADERBOARD: process.env.NEXT_PUBLIC_AD_SLOT_LEADERBOARD,
	NEXT_PUBLIC_AD_SLOT_SIDEBAR: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR,
	NEXT_PUBLIC_AD_SLOT_MOBILE_STICKY: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_STICKY,
});

export default function EnvScript() {
	const env = getPublicEnv();

	const innerHTML = {
		__html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(env)}`,
	};

	return <Script id="public-env" strategy={"beforeInteractive"} dangerouslySetInnerHTML={innerHTML} />;
}
