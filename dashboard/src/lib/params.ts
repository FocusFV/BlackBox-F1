type Params = Record<string, string[] | string | number | boolean | undefined | null>;

export const buildParams = (params?: Params): string => {
	if (!params) return "";

	const cleanParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			cleanParams.append(key, String(value));
		}
	});

	const queryString = cleanParams.toString();
	return queryString ? `?${queryString}` : "";
};