import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
// 
export const getMapString = (map: string) => {
	//remove de_ from the start, capitalise first character after de_ and if there is a number put a space before it
	return map.replace("de_", "").charAt(0).toUpperCase() + map.replace("de_", "").slice(1).replace(/[0-9]/g, " $&");
};
