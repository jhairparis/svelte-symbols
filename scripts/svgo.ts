import svgo from 'svgo';

const SVG_Optimized = (Str: string, fill: boolean): string => {
	const colorAttr = !fill ? 'fill' : 'stroke';
	const removeAttr = !fill ? 'svg:fill' : 'svg:stroke';

	const { data } = svgo.optimize(Str, {
		multipass: true,
		plugins: [
			{
				name: 'preset-default',
				params: {
					overrides: {
						removeViewBox: false
					}
				}
			},
			{
				name: 'removeAttrs',
				params: {
					attrs: ['class', 'width', 'height', removeAttr]
				}
			},
			{
				name: 'addAttributesToSVGElement',
				params: {
					attributes: [
						{ width: '{size}', height: '{size}', [colorAttr]: '{color}', class: '{className}' }
					]
				}
			}
		]
	});

	// Add props customizing by user
	const svg = data.replace(/\s/, ' {...$$$restProps} ');

	return svg;
};

export default SVG_Optimized;
