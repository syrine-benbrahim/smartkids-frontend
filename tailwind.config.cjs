/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,ts}',
		'./src/index.html'
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eefcfd',
					100: '#d5f7fb',
					200: '#aeeef7',
					300: '#7be1f1',
					400: '#43cde7',
					500: '#1fbad9',
					600: '#1594b1',
					700: '#126f85',
					800: '#135a6b',
					900: '#144a59'
				}
			}
		}
	},
	plugins: []
};





