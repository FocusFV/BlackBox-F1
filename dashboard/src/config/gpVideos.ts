export interface F1Video {
	id: string;
	title: string;
	thumbnail: string;
	publishedAt: string;
	embedUrl: string;
}

export const gpVideosArchive: Record<string, F1Video[]> = {
	"barcelona": [
		{
			id: "7DEPkd9lBUg",
			title: "FP1 Highlights | 2026 Barcelona Grand Prix",
			thumbnail: "https://img.youtube.com/vi/7DEPkd9lBUg/maxresdefault.jpg",
			publishedAt: "Hace unos días",
			embedUrl: "https://www.youtube.com/embed/7DEPkd9lBUg"
		},
		{
			id: "oh_VY40lO6w",
			title: "FP2 Highlights | 2026 Barcelona Grand Prix",
			thumbnail: "https://img.youtube.com/vi/oh_VY40lO6w/maxresdefault.jpg",
			publishedAt: "Hace unos días",
			embedUrl: "https://www.youtube.com/embed/oh_VY40lO6w"
		},
		{
			id: "Q2fMM4H9bWY",
			title: "Qualifying Highlights | 2026 Barcelona Grand Prix",
			thumbnail: "https://img.youtube.com/vi/Q2fMM4H9bWY/maxresdefault.jpg",
			publishedAt: "Hace unos días",
			embedUrl: "https://www.youtube.com/embed/Q2fMM4H9bWY"
		}
	]
};