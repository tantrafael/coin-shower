// ----- Start of the assigment ----- //

// Timing
const EFFECT_START_TIME = 0;
const EFFECT_DURATION = 5000;
const EFFECT_SUBSIDENCE = 2000;

// Textures
const TEXTURE_BASE_NAME = "CoinsGold";
const TEXTURE_BASE_NUMBER = "000";
const NR_TEXTURES = 9;

// Spawning
const SPAWN_PARTICLES_AMOUNT_PER_FRAME = 2;
const SPAWN_POSITION_HORIZONTAL_SPAN = 2.0;
const SPAWN_POSITION_HEIGHT = 4.5;
const SPAWN_VELOCITY_HORIZONTAL_SPAN = 6.0;
const SPAWN_VELOCITY_VERTICAL_MIN = 6.0;
const SPAWN_VELOCITY_VERTICAL_SPAN = 6.0;
const SPAWN_ANGULAR_VELOCITY_SPAN = 18.0;
const SPAWN_SPIN_VELOCITY_MAGNITUDE_MIN = 15.0;
const SPAWN_SPIN_VELOCITY_MAGNITUDE_SPAN = 10.0;

// Physics
const GRAVITY = 16.0;
//const DRAG = 0.01;

// Visual effects
const ALPHA_INCREMENT = 0.2;

// Projection and rendering
const CAMERA_POSITION_Y = -16.0;
const PROJECTION_PLANE_DISTANCE = 8.0;
const RENDER_POSITION_SCALE = 100.0;
const RENDER_SIZE_SCALE = 0.4;

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();

		// Set start and duration for this effect in milliseconds
		this.start = EFFECT_START_TIME;
		this.duration = EFFECT_DURATION;

		this.particles = new Array();
		this.lastUpdateTime = 0;
		//this.container = game.sprite();
	}

	animTick(nt, lt, gt) {
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in percentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,

		// Spawn particles
		if (lt < (EFFECT_DURATION - EFFECT_SUBSIDENCE)) {
			for (let i = 0; i < SPAWN_PARTICLES_AMOUNT_PER_FRAME; ++i) {
				this.spawnParticle();
			}
		}

		// Update particles
		let deltaTime = 0.001 * (lt - this.lastUpdateTime);
		this.lastUpdateTime = lt;

		this.particles.forEach((particle, index) => {
			particle.update(deltaTime);
			particle.render(game.renderer);

			if (particle.positionZ < 0) {
				this.removeChild(particle.sprite);
				this.particles.splice(index, 1);
			}
		});
	}

	spawnParticle() {
		const positionX = SPAWN_POSITION_HORIZONTAL_SPAN * (1 - 2 * Math.random());
		const positionY = SPAWN_POSITION_HORIZONTAL_SPAN * (1 - 2 * Math.random());
		const positionZ = SPAWN_POSITION_HEIGHT;
		const velocityX = SPAWN_VELOCITY_HORIZONTAL_SPAN * (1 - 2 * Math.random());
		const velocityY = SPAWN_VELOCITY_HORIZONTAL_SPAN * (1 - 2 * Math.random());
		const velocityZ = SPAWN_VELOCITY_VERTICAL_MIN + SPAWN_VELOCITY_VERTICAL_SPAN * Math.random();
		const rotation = 2 * Math.PI * Math.random();
		const angularVelocity = SPAWN_ANGULAR_VELOCITY_SPAN * (1 - 2 * Math.random());
		const spin = 0;
		const spinVelocityMagnitude = SPAWN_SPIN_VELOCITY_MAGNITUDE_MIN + SPAWN_SPIN_VELOCITY_MAGNITUDE_SPAN * Math.random();
		const spinVelocity = Math.random() > 0.5 ? spinVelocityMagnitude : -spinVelocityMagnitude;

		let sprite = game.sprite(TEXTURE_BASE_NAME + TEXTURE_BASE_NUMBER);
		sprite.pivot.x = 0.5 * sprite.width;
		sprite.pivot.y = 0.5 * sprite.height;
		sprite.alpha = 0;
		this.addChild(sprite);

		let particle = new Particle(
			positionX, positionY, positionZ,
			velocityX, velocityY, velocityZ,
			rotation, angularVelocity,
			spin, spinVelocity,
			sprite
		);

		particle.render(game.renderer);
		this.particles.push(particle);
	}
}

class Particle {
	constructor(
		positionX, positionY, positionZ,
		velocityX, velocityY, velocityZ,
		rotation, angularVelocity,
		spin, spinVelocity,
		sprite
	) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.positionZ = positionZ;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.velocityZ = velocityZ;
		this.rotation = rotation;
		this.angularVelocity = angularVelocity;
		this.spin = spin;
		this.spinVelocity = spinVelocity;
		this.sprite = sprite;
	}

	update(deltaTime) {
		this.velocityZ -= GRAVITY * deltaTime;
		this.positionX += this.velocityX * deltaTime;
		this.positionY += this.velocityY * deltaTime;
		this.positionZ += this.velocityZ * deltaTime;
		this.rotation += this.angularVelocity * deltaTime;
		this.spin += this.spinVelocity * deltaTime;
	}

	render(renderer) {
		let sprite = this.sprite;

		// Projection of position and scale
		const projectionScaleFactor = PROJECTION_PLANE_DISTANCE / (this.positionY - CAMERA_POSITION_Y);
		const projectionPointX = projectionScaleFactor * this.positionX;
		const projectionPointZ = projectionScaleFactor * this.positionZ;
		const screenCenterX = Math.floor(0.5 * renderer.width);
		const screenCenterY = renderer.height;
		sprite.x = screenCenterX + RENDER_POSITION_SCALE * projectionPointX;
		sprite.y = screenCenterY - RENDER_POSITION_SCALE * projectionPointZ;
		sprite.scale.x = sprite.scale.y = RENDER_SIZE_SCALE * projectionScaleFactor;

		// Rotation
		sprite.rotation = this.rotation;

		// Alpha
		if (sprite.alpha < 1) {
			sprite.alpha += ALPHA_INCREMENT;

			if (sprite.alpha >= 1) {
				sprite.alpha = 1;
			}
		}

		// Texture
		const textureIndex = (Math.floor(this.spin) % NR_TEXTURES + NR_TEXTURES) % NR_TEXTURES;
		const textureNumber = (TEXTURE_BASE_NUMBER + textureIndex).substr(-3);
		game.setTexture(sprite, TEXTURE_BASE_NAME + textureNumber);
	}
}

// ----- End of the assigment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
