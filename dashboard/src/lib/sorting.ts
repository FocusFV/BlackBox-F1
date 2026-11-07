import { utc } from "moment";

type PosObject = { Position?: string };
export const sortPos = (a: PosObject, b: PosObject) => {
	const posA = a?.Position ? parseInt(a.Position, 10) : NaN;
	const posB = b?.Position ? parseInt(b.Position, 10) : NaN;

	if (isNaN(posA) && isNaN(posB)) return 0;
	if (isNaN(posA)) return 1;
	if (isNaN(posB)) return -1;

	return posA - posB;
};

type PosObjectQuali = {
	Sectors: {
		Segments: { Status: number }[];
	}[];
};
export const sortQuali = (a: PosObjectQuali, b: PosObjectQuali) => {
	const aPassed = a.Sectors.flatMap((sector) => sector.Segments).filter((s) => s.Status > 0);
	const bPassed = b.Sectors.flatMap((sector) => sector.Segments).filter((s) => s.Status > 0);

	return bPassed.length - aPassed.length;
};

type UtcObject = { Utc: string };
export const sortUtc = (a: UtcObject, b: UtcObject) => {
	return utc(b.Utc).diff(utc(a.Utc));
};
