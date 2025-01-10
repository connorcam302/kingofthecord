export const load = async ({ url }) => {
	console.log('layoutcalled')
	return { url: url.pathname };
};
