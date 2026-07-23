import { utc } from "moment";
import type { Session } from "@/types/schedule.type";

type SessionDayGroup = { date: string; sessions: Session[] };

export const groupSessionByDay = (sessions: Session[]): SessionDayGroup[] => {
	return sessions.reduce((groups: SessionDayGroup[], next) => {
		// 🎯 Usamos el formato de fecha ISO estándar "YYYY-MM-DD"
		const nextDate = utc(next.start).format("YYYY-MM-DD");
		const groupIndex = groups.findIndex((group) => utc(group.date).format("YYYY-MM-DD") === nextDate);

		if (groupIndex < 0) {
			groups = [...groups, { date: next.start, sessions: [next] }];
		} else {
			groups[groupIndex] = { ...groups[groupIndex], sessions: [...groups[groupIndex].sessions, next] };
		}

		return groups;
	}, []);
};