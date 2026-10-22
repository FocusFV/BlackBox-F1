import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import next from "eslint-config-next";
import nextTypescript from "eslint-config-next/typescript";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

const eslintConfig = [
	...nextCoreWebVitals,
	...next,
	...nextTypescript,
	...compat.config({
		extends: ["prettier"],
	}),
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": "warn",
			"react/jsx-no-comment-textnodes": "off",
			"react-hooks/set-state-in-effect": "warn",
			"@next/next/no-img-element": "warn",
		},
	},
	{
		ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
	},
];

export default eslintConfig;