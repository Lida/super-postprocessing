import {
	HalfFloatType,
	PCFSoftShadowMap,
	sRGBEncoding,
	Vector3,
	WebGLRenderer
} from "super-three";

import { DemoManager } from "three-demo";
import { EffectComposer, OverrideMaterialManager } from "../../src";

import { AntialiasingDemo } from "./demos/AntialiasingDemo";
import { BloomDemo } from "./demos/BloomDemo";
import { BlurDemo } from "./demos/BlurDemo";
import { ColorDepthDemo } from "./demos/ColorDepthDemo";
import { ColorGradingDemo } from "./demos/ColorGradingDemo";
import { DepthOfFieldDemo } from "./demos/DepthOfFieldDemo";
import { GlitchDemo } from "./demos/GlitchDemo";
import { GodRaysDemo } from "./demos/GodRaysDemo";
import { OutlineDemo } from "./demos/OutlineDemo";
import { PatternDemo } from "./demos/PatternDemo";
import { PixelationDemo } from "./demos/PixelationDemo";
import { ShockWaveDemo } from "./demos/ShockWaveDemo";
import { SSAODemo } from "./demos/SSAODemo";
import { TextureDemo } from "./demos/TextureDemo";
import { ToneMappingDemo } from "./demos/ToneMappingDemo";
import { PerformanceDemo } from "./demos/PerformanceDemo";

import { ProgressManager } from "./utils/ProgressManager";
import { TextureUtils } from "./utils/TextureUtils";

/**
 * A demo manager.
 *
 * @type {DemoManager}
 * @private
 */

let manager;

/**
 * A camera.
 *
 * @type {Camera}
 * @private
 */

let camera;

/**
 * Renders the current demo.
 *
 * @private
 * @param {DOMHighResTimeStamp} timestamp - The current time in seconds.
 */

function render(timestamp) {

	requestAnimationFrame(render);
	manager.render(timestamp);

}

/**
 * Performs initialization tasks when the page has been fully loaded.
 *
 * @private
 * @param {Event} event - An event.
 */

window.addEventListener("load", (event) => {

	const debug = (window.location.href.indexOf("debug") !== -1);
	const viewport = document.getElementById("viewport");
	const demoCache = new WeakSet();

	// Create and configure the renderer.
	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		alpha: false,
		depth: false
	});

	renderer.outputEncoding = sRGBEncoding;
	renderer.debug.checkShaderErrors = debug;
	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000, 0.0);
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Enable the override material workaround.
	OverrideMaterialManager.workaroundEnabled = true;

	// Create the effect composer.
	const composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType
	});

	// Create the demo manager.
	manager = new DemoManager(viewport, {
		aside: document.getElementById("aside"),
		renderer
	});

	// Setup demo switch and load event handlers.
	manager.addEventListener("change", (event) => {

		composer.reset();
		composer.addPass(event.demo.renderPass);
		renderer.shadowMap.needsUpdate = true;

		ProgressManager.reset();
		document.querySelector(".loading").classList.remove("hidden");

	});

	manager.addEventListener("load", (event) => {

		const demo = event.demo;
		camera = demo.camera;
		demo.renderPass.camera = camera;

		if(!demoCache.has(demo)) {

			// Prevent stuttering when new objects come into view.
			renderer.compile(demo.scene, camera);
			TextureUtils.initializeTextures(renderer, demo.scene);
			demoCache.add(demo);

		}

		document.querySelector(".loading").classList.add("hidden");

	});

	const demos = [
		new AntialiasingDemo(composer),
		new BloomDemo(composer),
		new BlurDemo(composer),
		new ColorDepthDemo(composer),
		new ColorGradingDemo(composer),
		new DepthOfFieldDemo(composer),
		new GlitchDemo(composer),
		new GodRaysDemo(composer),
		new OutlineDemo(composer),
		new PatternDemo(composer),
		new PixelationDemo(composer),
		new ShockWaveDemo(composer),
		new SSAODemo(composer),
		new TextureDemo(composer),
		new ToneMappingDemo(composer),
		new PerformanceDemo(composer)
	];

	const id = demos.map((demo) => demo.id).indexOf(window.location.hash.slice(1));

	if(id === -1) {

		// Invalid URL hash: demo doesn't exist.
		window.location.hash = "";

	}

	for(const demo of demos) {

		manager.addDemo(demo);

	}

	requestAnimationFrame(render);

});

/**
 * Handles browser resizing.
 *
 * @param {Event} event - An event.
 */

window.addEventListener("resize", (event) => {

	const width = window.innerWidth;
	const height = window.innerHeight;
	manager.setSize(width, height);

});

/**
 * Performs initialization tasks when the document is ready.
 *
 * @private
 * @param {Event} event - An event.
 */

document.addEventListener("DOMContentLoaded", (event) => {

	const img = document.querySelector(".info img");
	const div = document.querySelector(".info div");

	if(img !== null && div !== null) {

		img.addEventListener("click", (event) => {

			div.classList.toggle("hidden");

		});

	}

	ProgressManager.initialize();

});

/**
 * Toggles the visibility of the interface on H key press.
 *
 * @private
 * @param {KeyboardEvent} event - An event.
 */

document.addEventListener("keydown", (event) => {

	const aside = document.getElementById("aside");

	if(aside !== null && event.key === "h") {

		event.preventDefault();
		aside.classList.toggle("hidden");

	} else if(camera !== undefined && event.key === "c") {

		const v = new Vector3();
		console.log("Camera position", camera.position);
		console.log("World direction", camera.getWorldDirection(v));
		console.log("Target position", v.addVectors(camera.position, camera.getWorldDirection(v)));

	}

});
