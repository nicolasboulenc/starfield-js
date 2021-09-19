"use strict";

window.onload = init;
window.onresize = resize;


const perf = { prev_time: 0, timer: 0, frame_count: 0, frame_per_seconds: 0 };
let star_field = null;


const App = {
	info: null,
};


function init() {

	App.info = document.getElementById('info');

	let elems = document.querySelectorAll('input.star, input.trail');
	for(let elem of elems) {
		elem.oninput = set_attribute;
	}

	elems = document.querySelectorAll('input.space');
	for(let elem of elems) {
		elem.onchange = set_attribute;
	}

	document.getElementById('reset').onclick = reset;

	const canvas = document.getElementById('display');
	star_field = new Star_Field(canvas, window.innerWidth, window.innerHeight);

	const inputs = document.getElementsByTagName('input');
	for(let input of inputs) {
		input.value = star_field.get_attribute(input.id);
		document.getElementById(`${input.id}_label`).innerHTML = `${input.id}: ${input.value}`;
	}

	requestAnimationFrame(loop);
}


function resize() {
	star_field.resize(window.innerWidth, window.innerHeight);
}


function set_attribute(evt) {

	const target = evt.currentTarget;
	document.getElementById(`${target.id}_label`).innerHTML = `${target.id}: ${target.value}`;
	star_field.set_attribute( target.id, parseInt(target.value) );
}


function reset() {

	star_field.reset();
}


function loop(timestamp) {

	const elapsed = timestamp - perf.prev_time;
	perf.prev_time = timestamp;

	const stats = star_field.step(elapsed);

	if( (perf.frame_count % 10) === 0 ) {
		const time = performance.now();
		perf.frame_per_seconds = Math.round( 1000 / (time - perf.timer) * perf.frame_count );
		perf.timer = time;
		perf.frame_count = 0;
	}
	perf.frame_count++;
	stats.fps = perf.frame_per_seconds;

	postMessage({ message: 'stats', stats: stats });

	requestAnimationFrame(loop);
}
