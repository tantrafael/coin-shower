// ----- Start of the assigment ----- //

const effectStartTime = 0;
const effectDuration = 5000;
const effectSubsidence = 2000;

const textureBaseName = "CoinsGold";
const textureBaseNumber = "000";
const nrTextures = 9;

const spawnParticlesAmountPerFrame = 2;
const spawnPositionHorizontalSpan = 2.0;
const spawnPositionHeight = 4.5;
const spawnVelocityHorizontalSpan = 6.0;
const spawnVelocityVerticalMin = 6.0;
const spawnVelocityVerticalSpan = 6.0;
const spawnAngularVelocitySpan = 18.0;
const spawnSpinVelocityMagnitudeMin = 15.0;
const spawnSpinVelocityMagnitudeSpan = 10.0;

const gravity = 16.0;
//const drag = 0.01;

const alphaIncrement = 0.2;

const cameraPositionY = -16.0;
const projectionPlaneDistance = 8.0;
const renderPositionScale = 100.0;
const renderSizeScale = 0.4;

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();

		// Set start and duration for this effect in milliseconds
		this.start = effectStartTime;
		this.duration = effectDuration;

		this.particles = new Array();
		this.lastUpdateTime = 0;
	}

	animTick(nt, lt, gt) {
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in percentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,

		// Spawn particles
		if (lt < (effectDuration - effectSubsidence)) {
			for (let i = 0; i < spawnParticlesAmountPerFrame; ++i) {
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
		let positionX = spawnPositionHorizontalSpan * (1 - 2 * Math.random());
		let positionY = spawnPositionHorizontalSpan * (1 - 2 * Math.random());
		let positionZ = spawnPositionHeight;
		let velocityX = spawnVelocityHorizontalSpan * (1 - 2 * Math.random());
		let velocityY = spawnVelocityHorizontalSpan * (1 - 2 * Math.random());
		let velocityZ = spawnVelocityVerticalMin + spawnVelocityVerticalSpan * Math.random();
		let rotation = 2 * Math.PI * Math.random();
		let angularVelocity = spawnAngularVelocitySpan * (1 - 2 * Math.random());
		let spin = 0;
		let spinVelocityMagnitude = spawnSpinVelocityMagnitudeMin + spawnSpinVelocityMagnitudeSpan * Math.random();
		let spinVelocity = Math.random() > 0.5 ? spinVelocityMagnitude : -spinVelocityMagnitude;

		let sprite = game.sprite(textureBaseName + textureBaseNumber);
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
		this.velocityZ -= gravity * deltaTime;
		this.positionX += this.velocityX * deltaTime;
		this.positionY += this.velocityY * deltaTime;
		this.positionZ += this.velocityZ * deltaTime;
		this.rotation += this.angularVelocity * deltaTime;
		this.spin += this.spinVelocity * deltaTime;
	}

	render(renderer) {
		let sprite = this.sprite;

		// Projection of position and scale
		let projectionScaleFactor = projectionPlaneDistance / (this.positionY - cameraPositionY);
		let projectionPointX = projectionScaleFactor * this.positionX;
		let projectionPointZ = projectionScaleFactor * this.positionZ;
		let screenCenterX = Math.floor(0.5 * renderer.width);
		let screenCenterY = renderer.height;
		sprite.x = screenCenterX + renderPositionScale * projectionPointX;
		sprite.y = screenCenterY - renderPositionScale * projectionPointZ;
		sprite.scale.x = sprite.scale.y = renderSizeScale * projectionScaleFactor;

		// Rotation
		sprite.rotation = this.rotation;

		// Alpha
		if (sprite.alpha < 1) {
			sprite.alpha += alphaIncrement;

			if (sprite.alpha >= 1) {
				sprite.alpha = 1;
			}
		}

		// Texture
		let textureIndex = (Math.floor(this.spin) % nrTextures + nrTextures) % nrTextures;
		let textureNumber = (textureBaseNumber + textureIndex).substr(-3);
		game.setTexture(sprite, textureBaseName + textureNumber);
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
