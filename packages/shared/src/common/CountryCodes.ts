export const CountryCodes = ["ESP", "GBR"] as const;

export type CountryCode = (typeof CountryCodes)[number];
