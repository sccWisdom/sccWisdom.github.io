/**
 * Cinematic hero animation
 * Three.js implementation inspired by the provided video: a translucent cube,
 * drifting glow orbs, internal light, and a soft floor reflection.
 */

(function() {
    'use strict';

    const CONFIG = {
        enableMobile: true,
        desktopPixelRatio: 1,
        mobilePixelRatio: 0.65,
        cubeSize: 1.82,
        scrollEase: 0.06,
        rotationSpeed: 0.0017,
        floatStrength: 0.14
    };

    let scene;
    let camera;
    let renderer;
    let container;
    let animationId = null;
    let cinematicCube;
    let cubeShell;
    let heroLightGroup;
    let reflectionPlane;
    let glowOrbs = [];
    let startTime = 0;
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;
    let isMobile = false;

    function init() {
        if (typeof THREE === 'undefined') {
            console.error('Cinematic hero: THREE.js is not loaded.');
            return;
        }

        container = document.getElementById('cube-background');
        if (!container) return;

        isMobile = window.innerWidth < 768;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(42, getAspect(), 0.1, 100);
        camera.position.set(0, 0.25, isMobile ? 8.6 : 7.4);

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
        renderer.setClearColor(0x000000, 0);
        if (THREE.sRGBEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        container.appendChild(renderer.domElement);

        addLights();
        createCinematicCube();
        createReflectionPlane();
        createGlowOrb({ color: 0xffffff, x: -2.15, y: 0.78, z: -1.1, size: 0.11, phase: 0.3, speed: 0.55 });
        createGlowOrb({ color: 0x38bdf8, x: 2.15, y: 0.38, z: -1.25, size: 0.13, phase: 1.5, speed: 0.42 });
        createGlowOrb({ color: 0xd946ef, x: 1.85, y: -0.42, z: -0.9, size: 0.12, phase: 2.4, speed: 0.48 });
        createGlowOrb({ color: 0xf59e0b, x: -1.75, y: -0.58, z: -0.75, size: 0.1, phase: 3.2, speed: 0.38 });

        startTime = performance.now();
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        animate();
    }

    function getAspect() {
        return Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
    }

    function addLights() {
        const ambient = new THREE.AmbientLight(0x9fb8ff, 0.44);
        scene.add(ambient);

        const topLight = new THREE.PointLight(0x67e8f9, 1.15, 12);
        topLight.position.set(0, 2.8, 2.8);
        scene.add(topLight);

        const violetLight = new THREE.PointLight(0xa855f7, 1.1, 9);
        violetLight.position.set(2.4, -0.25, 2.4);
        scene.add(violetLight);

        const warmLight = new THREE.PointLight(0xf59e0b, 0.8, 8);
        warmLight.position.set(-2.1, -0.4, 1.5);
        scene.add(warmLight);
    }

    function createCinematicCube() {
        heroLightGroup = new THREE.Group();
        scene.add(heroLightGroup);

        cinematicCube = new THREE.Group();
        cinematicCube.position.set(0, 0.3, -0.75);
        cinematicCube.rotation.set(-0.34, 0.7, 0.08);
        heroLightGroup.add(cinematicCube);

        const geometry = new THREE.BoxGeometry(CONFIG.cubeSize, CONFIG.cubeSize, CONFIG.cubeSize, 18, 18, 18);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x1e3a8a,
            transparent: true,
            opacity: 0.18,
            roughness: 0.18,
            metalness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        cubeShell = new THREE.Mesh(geometry, material);
        cinematicCube.add(cubeShell);

        const edgeGeometry = new THREE.EdgesGeometry(geometry, 20);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x818cf8,
            transparent: true,
            opacity: 0.86
        });
        cinematicCube.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

        const innerBlue = createInnerLight(0x38bdf8, 0.5);
        innerBlue.position.set(0.18, 0.05, 0.2);
        cinematicCube.add(innerBlue);

        const innerViolet = createInnerLight(0xd946ef, 0.42);
        innerViolet.position.set(-0.32, -0.22, 0.28);
        cinematicCube.add(innerViolet);

        const innerWarm = createInnerLight(0xfbbf24, 0.32);
        innerWarm.position.set(0.05, -0.42, -0.2);
        cinematicCube.add(innerWarm);
    }

    function createInnerLight(color, opacity) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.58, 32, 32),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        mesh.userData.baseOpacity = opacity;
        return mesh;
    }

    function createGlowOrb({ color, x, y, z, size, phase, speed }) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.userData = { baseX: x, baseY: y, baseZ: z, phase, speed };

        const core = new THREE.Mesh(
            new THREE.SphereGeometry(size, 28, 28),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: isMobile ? 0.3 : 0.45,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(size * 2.15, 28, 28),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: isMobile ? 0.08 : 0.12,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        const light = new THREE.PointLight(color, isMobile ? 0.22 : 0.46, 5);
        group.add(halo, core, light);
        scene.add(group);
        glowOrbs.push(group);
        return group;
    }

    function createReflectionPlane() {
        const geometry = new THREE.PlaneGeometry(4.2, 1.75, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: isMobile ? 0.08 : 0.14,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        reflectionPlane = new THREE.Mesh(geometry, material);
        reflectionPlane.rotation.x = -Math.PI / 2;
        reflectionPlane.position.set(0, -1.38, -0.5);
        reflectionPlane.scale.set(1.25, 1, 1);
        scene.add(reflectionPlane);
    }

    function setHeroScrollProgress(progress) {
        targetScrollProgress = Math.min(Math.max(progress, 0), 1);
    }

    function onScroll() {
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        setHeroScrollProgress(progress);
    }

    function onWindowResize() {
        if (!camera || !renderer || !container) return;
        isMobile = window.innerWidth < 768;
        camera.aspect = getAspect();
        camera.position.z = isMobile ? 8.6 : 7.4;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        const elapsed = (performance.now() - startTime) * 0.001;
        currentScrollProgress += (targetScrollProgress - currentScrollProgress) * CONFIG.scrollEase;

        if (heroLightGroup) {
            heroLightGroup.position.y = -currentScrollProgress * 0.8;
            heroLightGroup.position.z = -0.35 - currentScrollProgress * 1.8;
            heroLightGroup.scale.setScalar(1 - currentScrollProgress * 0.16);
        }

        if (cinematicCube) {
            const floatY = Math.sin(elapsed * 0.92) * CONFIG.floatStrength;
            cinematicCube.position.y = 0.3 + floatY;
            cinematicCube.rotation.x += CONFIG.rotationSpeed * 0.75;
            cinematicCube.rotation.y += CONFIG.rotationSpeed;
            cinematicCube.rotation.z = 0.08 + Math.sin(elapsed * 0.38) * 0.035;
        }

        if (cubeShell && cubeShell.material) {
            cubeShell.material.opacity = (isMobile ? 0.12 : 0.18) + Math.sin(elapsed * 1.2) * 0.02;
        }

        glowOrbs.forEach((orb) => {
            const data = orb.userData;
            const t = elapsed * data.speed + data.phase;
            orb.position.x = data.baseX + Math.sin(t) * 0.38 - currentScrollProgress * 0.45;
            orb.position.y = data.baseY + Math.cos(t * 0.88) * 0.2;
            orb.position.z = data.baseZ + Math.sin(t * 0.72) * 0.35;
            orb.scale.setScalar(1 + Math.sin(t * 1.35) * 0.12);
        });

        if (reflectionPlane && reflectionPlane.material) {
            reflectionPlane.material.opacity = (isMobile ? 0.07 : 0.13) + Math.sin(elapsed * 1.15) * 0.032;
            reflectionPlane.scale.x = 1.2 + Math.sin(elapsed * 0.9) * 0.08;
        }

        renderer.render(scene, camera);
    }

    function disposeObject(object) {
        if (!object) return;
        object.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    function dispose() {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('scroll', onScroll);
        disposeObject(heroLightGroup);
        disposeObject(reflectionPlane);
        glowOrbs.forEach(disposeObject);
        glowOrbs = [];
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
