/**
 * Cinematic liquid cube hero.
 * Recreates the reference-frame mood with editable Three.js elements:
 * translucent cube, glowing energy aperture, drifting bloom orbs, and wet floor reflection.
 */

(function() {
    'use strict';

    const CONFIG = {
        enableMobile: true,
        desktopPixelRatio: 1,
        mobilePixelRatio: 0.7,
        cubeSize: 1.86,
        scrollEase: 0.06,
        rotationSpeed: 0.00115,
        floatStrength: 0.11
    };

    let scene;
    let camera;
    let renderer;
    let container;
    let animationId = null;
    let heroRig;
    let liquidCube;
    let cubeShell;
    let cubeReflection;
    let liquidReflection;
    let energyPortal;
    let energyPortalOuter;
    let cubeRippleTexture;
    let waterRippleTexture;
    let bloomOrbs = [];
    let reflectionStreaks = [];
    let pointerTarget = { x: 0, y: 0 };
    let pointerCurrent = { x: 0, y: 0 };
    let startTime = 0;
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;
    let isMobile = false;

    function init() {
        if (typeof THREE === 'undefined') {
            console.error('Liquid cube hero: THREE.js is not loaded.');
            return;
        }

        container = document.getElementById('cube-background');
        if (!container) return;

        isMobile = window.innerWidth < 768;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x02070a, 0.075);

        camera = new THREE.PerspectiveCamera(36, getAspect(), 0.1, 100);
        camera.position.set(0, isMobile ? 0.1 : 0.2, isMobile ? 9.35 : 7.35);

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
        renderer.setClearColor(0x000000, 0);
        if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
        if (THREE.ACESFilmicToneMapping) {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.45;
        }
        container.appendChild(renderer.domElement);

        addLights();
        createLiquidCube();
        createLiquidReflection();
        createBloomOrb({ color: 0xffffff, x: -2.9, y: 0.48, z: -1.35, size: isMobile ? 0.34 : 0.45, phase: 0.2, speed: 0.28 });
        createBloomOrb({ color: 0x1d9bff, x: 2.55, y: 0.24, z: -1.45, size: isMobile ? 0.3 : 0.42, phase: 1.5, speed: 0.22 });
        createBloomOrb({ color: 0xd946ef, x: 2.95, y: -0.28, z: -1.2, size: isMobile ? 0.28 : 0.38, phase: 2.4, speed: 0.26 });
        createBloomOrb({ color: 0xf59e0b, x: -2.1, y: 0.18, z: -1.15, size: isMobile ? 0.22 : 0.34, phase: 3.1, speed: 0.2 });

        startTime = performance.now();
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        onScroll();
        animate();
    }

    function getAspect() {
        return Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
    }

    function addLights() {
        scene.add(new THREE.AmbientLight(0x7aa7ff, 0.34));

        const blueKey = new THREE.PointLight(0x38bdf8, 1.35, 12);
        blueKey.position.set(-0.8, 1.3, 2.4);
        scene.add(blueKey);

        const violetFill = new THREE.PointLight(0xd946ef, 1.05, 10);
        violetFill.position.set(1.65, -0.2, 2.1);
        scene.add(violetFill);

        const warmGlance = new THREE.PointLight(0xf59e0b, 0.82, 8);
        warmGlance.position.set(-2.0, -0.18, 1.2);
        scene.add(warmGlance);
    }

    function createLiquidCube() {
        heroRig = new THREE.Group();
        heroRig.position.set(0, 0.34, -0.72);
        scene.add(heroRig);

        liquidCube = new THREE.Group();
        liquidCube.rotation.set(-0.22, 0.18, 0.03);
        heroRig.add(liquidCube);

        cubeRippleTexture = createRippleTexture({
            base: 'rgba(26, 69, 146, 0.18)',
            line: 'rgba(120, 164, 255, 0.58)',
            glow: 'rgba(60, 180, 255, 0.26)'
        });

        const geometry = new THREE.BoxGeometry(CONFIG.cubeSize, CONFIG.cubeSize, CONFIG.cubeSize, 28, 28, 28);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x244f99,
            map: cubeRippleTexture,
            transparent: true,
            opacity: isMobile ? 0.32 : 0.38,
            roughness: 0.12,
            metalness: 0.05,
            clearcoat: 1,
            clearcoatRoughness: 0.06,
            transmission: 0.18,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        cubeShell = new THREE.Mesh(geometry, material);
        liquidCube.add(cubeShell);

        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x8fb0ff,
            transparent: true,
            opacity: 0.52
        });
        liquidCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 26), edgeMaterial));

        addFaceRipple('front', 0x38bdf8, 0.34);
        addFaceRipple('left', 0xd946ef, 0.25);
        addFaceRipple('top', 0x60a5fa, 0.2);

        const portalGroup = createEnergyPortal();
        portalGroup.position.set(0, 0.02, CONFIG.cubeSize / 2 + 0.035);
        liquidCube.add(portalGroup);

        liquidCube.add(createInnerGlow(0x38bdf8, 0.42, 0.56, { x: 0.12, y: 0.1, z: 0.16 }));
        liquidCube.add(createInnerGlow(0xd946ef, 0.36, 0.48, { x: -0.26, y: -0.18, z: 0.22 }));
        liquidCube.add(createInnerGlow(0xf59e0b, 0.28, 0.36, { x: -0.05, y: 0.34, z: -0.1 }));

        cubeReflection = createCubeReflection(geometry);
    }

    function addFaceRipple(face, color, opacity) {
        const size = CONFIG.cubeSize * 0.94;
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, 1, 1),
            new THREE.MeshBasicMaterial({
                map: cubeRippleTexture,
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );

        const offset = CONFIG.cubeSize / 2 + 0.018;
        if (face === 'front') {
            plane.position.z = offset;
        } else if (face === 'left') {
            plane.position.x = -offset;
            plane.rotation.y = Math.PI / 2;
        } else if (face === 'top') {
            plane.position.y = offset;
            plane.rotation.x = -Math.PI / 2;
        }
        liquidCube.add(plane);
    }

    function createInnerGlow(color, opacity, radius, position) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 36, 36),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData = { baseOpacity: opacity, baseRadius: radius, phase: Math.random() * Math.PI * 2 };
        return mesh;
    }

    function createEnergyPortal() {
        const group = new THREE.Group();
        energyPortal = createPortalLine(0x38bdf8, 0.88, 0.43, 0);
        energyPortalOuter = createPortalLine(0xd946ef, 0.48, 0.5, 0.5);
        group.add(energyPortal, energyPortalOuter);

        const core = new THREE.Mesh(
            new THREE.PlaneGeometry(1.02, 0.76, 1, 1),
            new THREE.MeshBasicMaterial({
                color: 0x05080e,
                transparent: true,
                opacity: 0.42,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        core.position.z = -0.01;
        group.add(core);

        const wash = new THREE.Mesh(
            new THREE.PlaneGeometry(1.36, 1.08, 1, 1),
            new THREE.MeshBasicMaterial({
                map: createRadialGlowTexture(0x38bdf8),
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.34,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        wash.position.z = -0.018;
        group.add(wash);
        return group;
    }

    function createPortalLine(color, opacity, scale, phase) {
        const points = [];
        const segments = 72;
        for (let i = 0; i <= segments; i += 1) {
            const a = (i / segments) * Math.PI * 2;
            const jag = 1 + Math.sin(a * 5.2 + phase) * 0.1 + Math.sin(a * 9.5 - phase) * 0.055;
            const x = Math.cos(a) * scale * 1.12 * jag;
            const y = Math.sin(a) * scale * 0.78 * jag;
            points.push(new THREE.Vector3(x, y, 0));
        }
        const line = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        line.userData = { baseOpacity: opacity, baseScale: scale, phase };
        return line;
    }

    function createCubeReflection(geometry) {
        const group = new THREE.Group();
        group.position.set(0, -2.38, 0.05);
        group.scale.set(1, -0.32, 1);
        group.rotation.set(liquidCube.rotation.x, liquidCube.rotation.y, liquidCube.rotation.z);

        const reflectionShell = new THREE.Mesh(
            geometry.clone(),
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        group.add(reflectionShell);

        const reflectionEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 26),
            new THREE.LineBasicMaterial({
                color: 0x60a5fa,
                transparent: true,
                opacity: 0
            })
        );
        group.add(reflectionEdges);
        return group;
    }

    function createLiquidReflection() {
        waterRippleTexture = createRippleTexture({
            base: 'rgba(3, 12, 20, 0.02)',
            line: 'rgba(103, 232, 249, 0.2)',
            glow: 'rgba(168, 85, 247, 0.18)'
        });

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(isMobile ? 4.6 : 6.4, isMobile ? 2.2 : 2.8, 1, 1),
            new THREE.MeshBasicMaterial({
                map: waterRippleTexture,
                color: 0x60a5fa,
                transparent: true,
                opacity: isMobile ? 0.34 : 0.4,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, -1.54, -0.24);
        scene.add(plane);
        liquidReflection = plane;

        createReflectionStreak({ color: 0x38bdf8, x: 0.0, z: -0.55, width: isMobile ? 2.2 : 3.6, depth: 0.34, phase: 0.1 });
        createReflectionStreak({ color: 0xd946ef, x: 0.42, z: -0.1, width: isMobile ? 1.8 : 2.8, depth: 0.26, phase: 1.4 });
        createReflectionStreak({ color: 0xf59e0b, x: -0.52, z: -0.18, width: isMobile ? 1.5 : 2.2, depth: 0.22, phase: 2.2 });
        createReflectionStreak({ color: 0xffffff, x: -1.5, z: 0.55, width: isMobile ? 0.9 : 1.3, depth: 0.18, phase: 3.0 });
    }

    function createReflectionStreak({ color, x, z, width, depth, phase }) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth, 1, 1),
            new THREE.MeshBasicMaterial({
                map: createRadialGlowTexture(color),
                color,
                transparent: true,
                opacity: isMobile ? 0.24 : 0.34,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, -1.49, z);
        mesh.userData = { baseX: x, baseZ: z, width, depth, phase };
        scene.add(mesh);
        reflectionStreaks.push(mesh);
        return mesh;
    }

    function createBloomOrb({ color, x, y, z, size, phase, speed }) {
        const texture = createRadialGlowTexture(color);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texture,
            color,
            transparent: true,
            opacity: isMobile ? 0.72 : 0.82,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }));
        sprite.position.set(x, y, z);
        sprite.scale.set(size * 2.9, size * 2.9, 1);
        sprite.userData = { baseX: x, baseY: y, baseZ: z, size, phase, speed };
        scene.add(sprite);
        bloomOrbs.push(sprite);
        return sprite;
    }

    function createRippleTexture({ base, line, glow }) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < 18; i += 1) {
            const y = 18 + i * 13 + Math.sin(i * 0.75) * 8;
            ctx.beginPath();
            for (let x = -12; x <= 268; x += 8) {
                const waveY = y + Math.sin(x * 0.045 + i * 0.72) * (5 + (i % 3));
                if (x === -12) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.strokeStyle = i % 3 === 0 ? glow : line;
            ctx.lineWidth = i % 4 === 0 ? 2 : 1;
            ctx.globalAlpha = i % 4 === 0 ? 0.38 : 0.22;
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
        gradient.addColorStop(0, glow);
        gradient.addColorStop(0.48, 'rgba(59,130,246,0.08)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.1, 1.1);
        return texture;
    }

    function createRadialGlowTexture(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const hex = `#${color.toString(16).padStart(6, '0')}`;
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
        gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
        gradient.addColorStop(0.18, hex);
        gradient.addColorStop(0.48, `${hex}66`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return new THREE.CanvasTexture(canvas);
    }

    function setHeroScrollProgress(progress) {
        targetScrollProgress = Math.min(Math.max(progress, 0), 1);
    }

    function onScroll() {
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        setHeroScrollProgress(progress);
    }

    function onPointerMove(event) {
        const width = Math.max(window.innerWidth, 1);
        const height = Math.max(window.innerHeight, 1);
        pointerTarget.x = (event.clientX / width - 0.5) * 2;
        pointerTarget.y = (event.clientY / height - 0.5) * 2;
    }

    function onTouchMove(event) {
        if (!event.touches || !event.touches[0]) return;
        onPointerMove(event.touches[0]);
    }

    function updatePointerParallax() {
        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.045;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.045;
        if (heroRig) {
            heroRig.rotation.y = pointerCurrent.x * 0.055;
            heroRig.rotation.x = -pointerCurrent.y * 0.025;
            heroRig.position.x = pointerCurrent.x * (isMobile ? 0.06 : 0.12);
        }
    }

    function onWindowResize() {
        if (!camera || !renderer || !container) return;
        isMobile = window.innerWidth < 768;
        camera.aspect = getAspect();
        camera.position.z = isMobile ? 9.35 : 7.35;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        const elapsed = (performance.now() - startTime) * 0.001;
        currentScrollProgress += (targetScrollProgress - currentScrollProgress) * CONFIG.scrollEase;
        updatePointerParallax();

        if (heroRig) {
            heroRig.position.y = 0.34 - currentScrollProgress * 0.72;
            heroRig.position.z = -0.72 - currentScrollProgress * 1.6;
            heroRig.scale.setScalar(1 - currentScrollProgress * 0.14);
        }

        if (liquidCube) {
            const floatY = Math.sin(elapsed * 0.86) * CONFIG.floatStrength;
            liquidCube.position.y = floatY;
            liquidCube.rotation.x = -0.22 + Math.sin(elapsed * 0.42) * 0.09;
            liquidCube.rotation.y = 0.18 + Math.sin(elapsed * 0.28) * 0.24 + elapsed * CONFIG.rotationSpeed * 0.22;
            liquidCube.rotation.z = 0.03 + Math.sin(elapsed * 0.34) * 0.035;
        }

        if (cubeReflection && liquidCube) {
            cubeReflection.rotation.x = liquidCube.rotation.x;
            cubeReflection.rotation.y = liquidCube.rotation.y;
            cubeReflection.rotation.z = liquidCube.rotation.z;
        }

        if (cubeShell && cubeShell.material) {
            cubeShell.material.opacity = (isMobile ? 0.42 : 0.52) + Math.sin(elapsed * 1.2) * 0.045;
        }

        if (cubeRippleTexture) {
            cubeRippleTexture.offset.x = (Math.sin(elapsed * 0.18) * 0.025 + elapsed * 0.012) % 1;
            cubeRippleTexture.offset.y = (elapsed * 0.018) % 1;
        }

        if (waterRippleTexture) {
            waterRippleTexture.offset.x = (elapsed * 0.02) % 1;
            waterRippleTexture.offset.y = (Math.sin(elapsed * 0.18) * 0.04) % 1;
        }

        if (energyPortal) {
            const pulse = 1 + Math.sin(elapsed * 1.7) * 0.055;
            energyPortal.scale.set(pulse, pulse, 1);
            energyPortal.material.opacity = 0.76 + Math.sin(elapsed * 2.2) * 0.14;
        }

        if (energyPortalOuter) {
            const pulse = 1 + Math.sin(elapsed * 1.35 + 0.8) * 0.075;
            energyPortalOuter.scale.set(pulse, pulse, 1);
            energyPortalOuter.material.opacity = 0.38 + Math.sin(elapsed * 1.9) * 0.12;
        }

        if (liquidReflection && liquidReflection.material) {
            liquidReflection.material.opacity = (isMobile ? 0.32 : 0.42) + Math.sin(elapsed * 1.1) * 0.06;
            liquidReflection.scale.x = 1 + Math.sin(elapsed * 0.7) * 0.06;
        }

        reflectionStreaks.forEach((streak) => {
            const data = streak.userData;
            const t = elapsed * 0.62 + data.phase;
            streak.position.x = data.baseX + Math.sin(t) * 0.08;
            streak.position.z = data.baseZ + Math.cos(t * 0.7) * 0.08;
            streak.scale.x = 1 + Math.sin(t * 1.1) * 0.16;
            streak.scale.y = 1 + Math.cos(t * 1.25) * 0.12;
            streak.material.opacity = (isMobile ? 0.22 : 0.32) + Math.sin(t) * 0.06;
        });

        bloomOrbs.forEach((orb) => {
            const data = orb.userData;
            const t = elapsed * data.speed + data.phase;
            orb.position.x = data.baseX + Math.sin(t) * 0.35 - currentScrollProgress * 0.35;
            orb.position.y = data.baseY + Math.cos(t * 0.82) * 0.16;
            orb.position.z = data.baseZ + Math.sin(t * 0.65) * 0.24;
            const scale = data.size * (2.85 + Math.sin(t * 1.45) * 0.22);
            orb.scale.set(scale, scale, 1);
            orb.material.opacity = (isMobile ? 0.58 : 0.74) + Math.sin(t * 1.2) * 0.1;
        });

        renderer.render(scene, camera);
    }

    function disposeObject(object) {
        if (!object) return;
        object.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
                else child.material.dispose();
            }
        });
    }

    function dispose() {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('touchmove', onTouchMove);
        disposeObject(heroRig);
        disposeObject(liquidReflection);
        bloomOrbs.forEach(disposeObject);
        reflectionStreaks.forEach(disposeObject);
        bloomOrbs = [];
        reflectionStreaks = [];
        if (cubeRippleTexture) cubeRippleTexture.dispose();
        if (waterRippleTexture) waterRippleTexture.dispose();
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }
    }

    window.CubeAnimation = {
        init,
        dispose,
        setHeroScrollProgress,
        setConfig: function(newConfig) {
            Object.assign(CONFIG, newConfig);
        },
        getConfig: function() {
            return { ...CONFIG };
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
