"use strict";

window.onload = init;
window.onresize = resize;


const App = {
	canvas: null,
	canvas_ctx: null,
	gradient: null,
	space_depth: 5000,
	speed: 100,			// speed per 100ms
	prev_time: 0,		// for time elapsed calc
	star_population: 300,	// stars per 1,000,000 px square
	star_count: 0,		// this varies based on canvas size and star_population
	star_size: 4,
	star_trail: 300,
	star_saturation: 30,
	stars: [],
	timer: 0,
	frame_count: 0,
	frame_per_seconds: 0,
	info: null,
	d: 0,				// distance eye canvas, calculated based on fov and canvas size
	fov: 100
};


function init() {

	App.canvas = document.getElementById('display');
	App.canvas_ctx = App.canvas.getContext('2d', {alpha: false});

	const inputs = document.getElementsByTagName('input');
	for(let input of inputs) {
		input.value = App[input.id];
		document.getElementById(`${input.id}_label`).innerHTML = `${input.id}: ${input.value}`;
		input.oninput = param_change;
	}
	document.getElementById('reset').onclick = param_reset;

	// resize
	App.canvas.width = window.innerWidth;
	App.canvas.height = window.innerHeight;
	App.star_count = Math.floor( App.canvas.width * App.canvas.height / 1000000 * App.star_population );
	App.d = Math.tan(App.fov / 2 * Math.PI / 180) * App.canvas.width / 2;

	while(App.stars.length < App.star_count) {
		App.stars.push({
			x: Math.random() * App.space_depth - App.space_depth / 2,
			y: Math.random() * App.space_depth - App.space_depth / 2,
			z: Math.random() * App.space_depth,
			d: 0,
			s: Math.floor(2 + Math.random() * App.star_size),
			h: Math.floor(Math.random() * 9) * 40
		});
	}

	App.info = document.getElementById('info');

	requestAnimationFrame(loop);
}


function resize() {

	App.canvas.width = window.innerWidth;
	App.canvas.height = window.innerHeight;
	App.star_count = Math.floor( App.canvas.width * App.canvas.height / 1000000 * App.star_population );
	App.d = Math.tan(App.fov / 2 * Math.PI / 180) * App.canvas.width / 2;
}


function param_change(evt) {

	const target = evt.currentTarget;
	if(target.id === 'space_depth') {
		const ratio = App.space_depth / target.value;
		App.space_depth = target.value;
		for(let star of App.stars) {
			star.z /= ratio;
		}
	}
	else if(target.id === 'speed') {
		App.speed = target.value;
	}
	if(target.id === 'star_size') {
		const ratio = App.star_size / target.value;
		App.star_size = target.value;
		for(let star of App.stars) {
			star.s /= ratio;
		}
	}
	else if(target.id === 'star_population') {
		App.star_population = target.value;
		App.star_count = Math.floor( App.canvas.width * App.canvas.height / 1000000 * App.star_population );
	}
	else if(target.id === 'star_trail') {
		App.star_trail = target.value;
	}
	else if(target.id === 'star_saturation') {
		App.star_saturation = target.value;
	}
	else if(target.id === 'fov') {
		App.fov = target.value;
		App.d = Math.tan(App.fov / 2 * Math.PI / 180) * App.canvas.width / 2;
	}
	document.getElementById(`${target.id}_label`).innerHTML = `${target.id}: ${target.value}`;
}

function param_reset() {

	let ratio = App.space_depth / 5000;
	for(let star of App.stars) {
		star.z /= ratio;
	}

	ratio = App.star_size / 4;
	for(let star of App.stars) {
		star.s /= ratio;
	}

	App.space_depth = 5000;
	App.speed = 100;			// speed per 100ms
	App.star_population = 300;	// stars per 1,000,000 px square
	App.star_size = 4;
	App.star_trail = 200;
	App.star_saturation = 30;
	App.fov = 100;
	App.d = Math.tan(App.fov / 2 * Math.PI / 180) * App.canvas.width / 2;

	const inputs = document.getElementsByTagName('input');
	for(let input of inputs) {
		input.value = App[input.id];
		document.getElementById(`${input.id}_label`).innerHTML = `${input.id}: ${input.value}`;
	}
}

function loop(timestamp) {

	const elapsed = timestamp - App.prev_time;
	App.prev_time = timestamp;

	update(elapsed);
	const stats = render0(elapsed);

	if( (App.frame_count % 10) === 0 ) {

		const time = performance.now();
		App.frame_per_seconds = Math.round( 1000 / (time - App.timer) * App.frame_count );
		App.timer = time;
		App.frame_count = 0;
	}
	App.info.innerHTML = `
FPS:             ${App.frame_per_seconds}
Star count:      ${App.star_count}
Stars displayed: ${stats.stars}
Fill Style:      ${stats.fill_style}
Fill:            ${stats.fill}
Stroke Style:    ${stats.stroke_style}
Stroke:          ${stats.stroke}
Time:            ${stats.time}`;

	App.frame_count++;

	requestAnimationFrame(loop);
}


function update(elapsed) {

	const half_depth = App.space_depth / 2.0;

	// add stars if needed
	while(App.stars.length < App.star_count) {
		App.stars.push({
			x: Math.random() * App.space_depth - half_depth,
			y: Math.random() * App.space_depth - half_depth,
			z: Math.random() * App.space_depth,
			d: 0,
			s: Math.floor(2 + Math.random() * App.star_size),
			h: Math.floor(Math.random() * 9) * 40
		});
	}

	// remove stars if necesary
	if(App.stars.length > App.star_count) {
		App.stars = App.stars.slice(0, App.star_count);
	}

	// update all stars
	for(let star of App.stars) {
		star.z -= App.speed * elapsed / 100;
		if(star.z < 0.1) {
			star.x = Math.random() * App.space_depth - half_depth;
			star.y = Math.random() * App.space_depth - half_depth;
			star.z = App.space_depth;
			star.s = Math.floor(2 + Math.random() * App.star_size);
			star.h = Math.floor(Math.random() * 9) * 40;
		}
		star.d = Math.sqrt( star.x * star.x + star.y * star.y + star.z * star.z );
	}
}


function render0() {

	const stats = { stars: 0,
					fill_style: 0,
					fill: 0,
					stroke_style: 0,
					stroke: 0,
					time: performance.now() };

	const half_width = App.canvas.width / 2.0;
	const half_height = App.canvas.height / 2.0;

	App.canvas_ctx.fillStyle = "black";
	App.canvas_ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);

	// only draw the first App.star_count stars
	for(let i=0; i<App.star_count; i++) {

		const star = App.stars[i];

		const vx0 = Math.round(half_width + star.x / star.z * App.d);
		const vy0 = Math.round(half_height + star.y / star.z * App.d);
		const vx1 = Math.round(half_width + star.x / (star.z + App.star_trail) * App.d);
		const vy1 = Math.round(half_height + star.y / (star.z + App.star_trail) * App.d);

		if (vx1 < App.canvas.width && vy1 < App.canvas.height && star.d < App.space_depth) {

			const distance_norm = star.d / App.space_depth;
			const brightness = Math.round( (1 - distance_norm * distance_norm) * 100 );
			const size = Math.round( (1 - distance_norm) * star.s );
			const color = `hsl(${star.h}, ${App.star_saturation}%, ${brightness}%)`;

			// draw star
			App.canvas_ctx.fillStyle = color;
			stats.fill_style++;
			App.canvas_ctx.beginPath();
			App.canvas_ctx.ellipse(vx0, vy0, size, size, 0, 0, 2 * Math.PI);
			App.canvas_ctx.fill();
			stats.fill++;

			// draw tail
			App.canvas_ctx.lineWidth = size * 2;
			const gradient = App.canvas_ctx.createLinearGradient(vx0, vy0, vx1, vy1);
			gradient.addColorStop(0.0, color);
			gradient.addColorStop(1.0, 'black');
			App.canvas_ctx.strokeStyle = gradient;
			stats.stroke_style++;
			// App.canvas_ctx.strokeStyle = color;

			App.canvas_ctx.beginPath();
			App.canvas_ctx.moveTo(vx0, vy0);
			App.canvas_ctx.lineTo(vx1, vy1);
			App.canvas_ctx.stroke();
			stats.stroke++;

			stats.stars++;
		}
	}
	stats.time = Math.round(performance.now() - stats.time);
	return stats;
}


function render1() {

	const stats = { stars: 0,
		fill_style: 0,
		fill: 0,
		stroke_style: 0,
		stroke: 0,
		time: performance.now() };

	const half_width = App.canvas.width / 2.0;
	const half_height = App.canvas.height / 2.0;

	// create render tree, by distance, by color
	const tree = [];
	const source = App.stars.slice(0, App.star_count);

	for(let depth_index = 0; depth_index < 5; depth_index++) {
		const depth_group = source.filter(star => ( (star.d / App.space_depth >= depth_index / 4) && (star.d / App.space_depth < (depth_index+1) / 4) ));
		const color_groups = [];
		for(let color_index = 0; color_index < 9; color_index++) {
			color_groups.push(depth_group.filter(star => star.h === color_index * 40));
		}
		tree.push(color_groups);
	}

	// clear screen
	App.canvas_ctx.fillStyle = "black";
	App.canvas_ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);

	// render trails far away first
	for(let depth_index=tree.length-1; depth_index>=0; depth_index--) {

		const brightness = Math.floor( (1 - depth_index/4 * depth_index/4) * 100 );

		for(let color_index=0; color_index<tree[depth_index].length; color_index++) {

			const color = `hsl(${color_index * 40}, ${App.star_saturation}%, 25%)`;

			const gradient = App.canvas_ctx.createRadialGradient(0, 0, 0, 0, 0, App.star_trail / 2);
			gradient.addColorStop(0.0, 'black');
			gradient.addColorStop(1.0, color);
			App.canvas_ctx.strokeStyle = gradient;
			stats.stroke_style++;

			for(let star of tree[depth_index][color_index]) {

				const vx0 = Math.round(half_width + star.x / star.z * App.d);
				const vy0 = Math.round(half_height + star.y / star.z * App.d);
				const vx1 = Math.round(half_width + star.x / (star.z + App.star_trail) * App.d);
				const vy1 = Math.round(half_height + star.y / (star.z + App.star_trail) * App.d);

				if (vx1 < App.canvas.width && vy1 < App.canvas.height && star.d < App.space_depth) {

					const distance_norm = star.d / App.space_depth;
					const size = Math.round( (1 - distance_norm) * star.s );

					// draw tail
					App.canvas_ctx.lineWidth = size * 2;
					App.canvas_ctx.translate(vx1, vy1);
					App.canvas_ctx.beginPath();
					App.canvas_ctx.moveTo(0, 0);
					App.canvas_ctx.lineTo(vx0 - vx1, vy0 - vy1);
					App.canvas_ctx.stroke();
					App.canvas_ctx.translate(-vx1, -vy1);
					stats.stroke++;
				}
			}
		}
	}


	// render stars far away first
	for(let depth_index=tree.length-1; depth_index>=0; depth_index--) {

		const brightness = Math.round( (1 - depth_index/4 * depth_index/4) * 100 );

		for(let color_index=0; color_index<tree[depth_index].length; color_index++) {

			const color = `hsl(${color_index * 40}, ${App.star_saturation}%, ${brightness}%)`;
			App.canvas_ctx.fillStyle = color;
			stats.fill_style++;

			App.canvas_ctx.beginPath();

			for(let star of tree[depth_index][color_index]) {

				const vx0 = Math.round(half_width + star.x / star.z * App.d);
				const vy0 = Math.round(half_height + star.y / star.z * App.d);
				const vx1 = Math.round(half_width + star.x / (star.z + App.star_trail) * App.d);
				const vy1 = Math.round(half_height + star.y / (star.z + App.star_trail) * App.d);

				if (vx1 < App.canvas.width && vy1 < App.canvas.height) {

					const distance_norm = Math.min( star.d / App.space_depth, 1.0 );
					const size = Math.floor( (1 - distance_norm) * star.s );

					// draw star
					App.canvas_ctx.moveTo(vx0, vy0);
					App.canvas_ctx.ellipse(vx0, vy0, size, size, 0, 0, 2 * Math.PI);

					stats.stars++;
				}
			}
			App.canvas_ctx.fill();
			stats.fill++;
		}
	}


	stats.time = Math.round(performance.now() - stats.time);
	return stats;
}