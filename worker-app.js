"use strict";

window.onload = init;
window.onresize = resize;


const App = {
	worker: null,
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
	const offscreen = canvas.transferControlToOffscreen();
	App.worker = new Worker('worker.js');
	App.worker.onmessage = worker_onmessage;
	App.worker.postMessage({ message: 'init', canvas: offscreen, width: window.innerWidth, height: window.innerHeight }, [offscreen]);

	const inputs = document.getElementsByTagName('input');
	for(let input of inputs) {
		App.worker.postMessage({ message: 'get', attribute: input.id });
	}

}


function resize() {
	App.worker.postMessage({ message: 'resize', width: window.innerWidth, height: window.innerHeight });
}


function set_attribute(evt) {
	const target = evt.currentTarget;
	document.getElementById(`${target.id}_label`).innerHTML = `${target.id}: ${target.value}`;
	App.worker.postMessage({ message: 'set', attribute: target.id, value: parseInt(target.value) });
}


function reset(evt) {
	App.worker.postMessage({ message: 'reset' });
}


function worker_onmessage(evt) {

	if(evt.data.message === 'stats') {
		const stats = evt.data.stats;
		App.info.innerHTML = `FPS: ${stats.fps}<br>`;
	}
	else if(evt.data.message === 'attribute') {
		document.getElementById(`${evt.data.attribute}_label`).innerHTML = `${evt.data.attribute}: ${evt.data.value}`;
	}
}
