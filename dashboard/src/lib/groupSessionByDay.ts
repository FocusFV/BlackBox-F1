import { utc } from "moment";
import type { Session } from "@/types/schedule.type";

type SessionDayGroup = { date: string; sessions: Session[] };

export const groupSessionByDay = (sessions: Session[]): SessionDayGroup[] => {
	return sessions.reduce((groups: SessionDayGroup[], next) => {
		// 🎯 Agrupar por la fecha en horario local para total coherencia con el día mostrado
		const nextDate = typeof window !== "undefined"
			? utc(next.start).local().format("YYYY-MM-DD")
			: utc(next.start).format("YYYY-MM-DD");

		const groupIndex = groups.findIndex((group) => {
			const groupDate = typeof window !== "undefined"
				? utc(group.date).local().format("YYYY-MM-DD")
				: utc(group.date).format("YYYY-MM-DD");
			return groupDate === nextDate;
		});

		if (groupIndex < 0) {
			groups = [...groups, { date: next.start, sessions: [next] }];
		} else {
			groups[groupIndex] = { ...groups[groupIndex], sessions: [...groups[groupIndex].sessions, next] };
		}

		return groups;
	}, []);
};
