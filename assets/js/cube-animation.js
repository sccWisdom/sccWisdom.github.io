/**
 * 3D 魔方背景动画模块
 * 基于 Three.js 实现科技感魔方背景，支持滚动拆解聚合效果
 */

(function() {
    'use strict';

    // ===================================
    // 可配置参数
    // ===================================
    const CONFIG = {
        // 魔方基础参数
        cubeSize: 0.8,                    // 单个小立方体大小
        gridSize: 3,                      // 魔方网格大小（3x3x3）
        cubeGap: 0.05,                    // 立方体之间的间隙
        
        // 动画参数
        disperseDistance: 3,              // 分散最大距离
        rotationSpeed: 0.002,             // 自转速度
        disperseSpeed: 0.05,              // 分散/聚合速度
        
        // 视觉参数
        cubeColor: 0x6366f1,              // 立方体主色调（蓝紫色）
        edgeColor: 0xa855f7,              // 边框颜色（紫色）
        opacity: 0.6,                     // 透明度
        transparent: true,                // 是否透明
        
        // 性能参数
        enableMobile: false,              // 移动端是否启用（默认关闭以保证性能）
        mobilePixelRatio: 0.5,            // 移动端像素比
        desktopPixelRatio: 1,             // 桌面端像素比
    };

    // ===================================
    // 全局变量
    // ===================================
    let scene, camera, renderer, cubes = [];
    let animationId = null;
    let targetDisperse = 0;               // 目标分散程度（0-1）
    let currentDisperse = 0;              // 当前分散程度
    let isMobile = false;
    let container;

    // ===================================
    // 初始化函数
    // ===================================
    function init() {
        // 检查 Three.js 是否加载
        if (typeof THREE === 'undefined') {
            console.error('Cube animation: THREE.js is not loaded!');
            return;
        }
        
        console.log('Cube animation: THREE.js version', THREE.REVISION);

        // 检测设备类型
        isMobile = window.innerWidth < 768;
        
        // 移动端默认不启用，除非明确配置
        if (isMobile && !CONFIG.enableMobile) {
            console.log('Cube animation: disabled on mobile for performance');
            return;
        }

        // 获取容器
        container = document.getElementById('cube-background');
        if (!container) {
            console.warn('Cube animation: container not found');
            return;
        }

        console.log('Cube animation: container found', container.clientWidth, 'x', container.clientHeight);

        // 创建场景
        scene = new THREE.Scene();

        // 创建相机
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(
            45,
            aspect,
            0.1,
            1000
        );
        camera.position.z = 8;

        // 创建渲染器
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'high-performance'
        });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
        container.appendChild(renderer.domElement);

        console.log('Cube animation: renderer created');

        // 创建魔方
        createRubiksCube();

        // 添加光源
        addLights();

        // 绑定事件
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('scroll', onScroll);

        // 开始动画循环
        animate();

        console.log('Cube animation: initialized successfully, cubes count:', cubes.length);
    }

    // ===================================
    // 创建魔方
    // ===================================
    function createRubiksCube() {
        const { cubeSize, gridSize, cubeGap, cubeColor, edgeColor, opacity, transparent } = CONFIG;
        
        // 计算总尺寸
        const totalSize = gridSize * (cubeSize + cubeGap);
        const offset = totalSize / 2 - (cubeSize + cubeGap) / 2;

        // 创建小立方体
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    // 跳过内部立方体（只保留外壳）
                    const isInternal = (
                        (x > 0 && x < gridSize - 1) &&
                        (y > 0 && y < gridSize - 1) &&
                        (z > 0 && z < gridSize - 1)
                    );
                    
                    if (isInternal) continue;

                    // 创建几何体
                    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

                    // 创建材质（使用物理材质增强真实感）
                    const material = new THREE.MeshPhysicalMaterial({
                        color: cubeColor,
                        transparent: transparent,
                        opacity: opacity,
                        metalness: 0.3,
                        roughness: 0.2,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.1,
                        side: THREE.DoubleSide
                    });

                    // 创建网格
                    const cube = new THREE.Mesh(geometry, material);

                    // 设置初始位置
                    const posX = (x - gridSize / 2 + 0.5) * (cubeSize + cubeGap);
                    const posY = -(y - gridSize / 2 + 0.5) * (cubeSize + cubeGap);
                    const posZ = (z - gridSize / 2 + 0.5) * (cubeSize + cubeGap);

                    cube.position.set(posX, posY, posZ);

                    // 存储初始位置
                    cube.userData.initialPosition = cube.position.clone();
                    cube.userData.targetPosition = cube.position.clone();

                    // 计算分散方向（从中心向外）
                    const direction = new THREE.Vector3(posX, posY, posZ).normalize();
                    cube.userData.disperseDirection = direction;

                    // 添加边框
                    const edges = new THREE.EdgesGeometry(geometry);
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: edgeColor,
                        transparent: true,
                        opacity: opacity * 1.5
                    });
                    const wireframe = new THREE.LineSegments(edges, lineMaterial);
                    cube.add(wireframe);

                    // 添加到场景
                    scene.add(cube);
                    cubes.push(cube);
                }
            }
        }

        // 整体旋转一定角度，让魔方看起来更立体
        // 注意：我们需要旋转每个立方体而不是使用 Group，以保持位置坐标正确
        const rotationX = Math.PI / 6;
        const rotationY = Math.PI / 4;
        
        cubes.forEach(cube => {
            // 旋转位置
            const pos = cube.position.clone();
            
            // 绕 Y 轴旋转
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);
            const x1 = pos.x * cosY - pos.z * sinY;
            const z1 = pos.x * sinY + pos.z * cosY;
            
            // 绕 X 轴旋转
            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const y2 = pos.y * cosX - z1 * sinX;
            const z2 = pos.y * sinX + z1 * cosX;
            
            cube.position.set(x1, y2, z2);
            
            // 更新初始位置（旋转后的位置）
            cube.userData.initialPosition = cube.position.clone();
            
            // 重新计算分散方向（从中心向外）
            cube.userData.disperseDirection = cube.position.clone().normalize();
        });
    }

    // ===================================
    // 添加光源
    // ===================================
    function addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // 补光（蓝紫色）
        const fillLight = new THREE.PointLight(0x6366f1, 0.5);
        fillLight.position.set(-5, -5, -5);
        scene.add(fillLight);

        // 顶光（紫色）
        const topLight = new THREE.PointLight(0xa855f7, 0.3);
        topLight.position.set(0, 10, 0);
        scene.add(topLight);
    }

    // ===================================
    // 窗口大小调整
    // ===================================
    function onWindowResize() {
        if (!camera || !renderer) return;

        isMobile = window.innerWidth < 768;
        
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(isMobile ? CONFIG.mobilePixelRatio : CONFIG.desktopPixelRatio);
    }

    // ===================================
    // 滚动事件处理
    // ===================================
    function onScroll() {
        if (!container) return;

        // 计算滚动进度（0-1）
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // 在 Hero 区域滚动时（0-100vh）逐渐分散
        const progress = Math.min(scrollTop / windowHeight, 1);
        targetDisperse = progress;
        
        // 调试信息
        console.log('Scroll:', scrollTop, 'Progress:', progress.toFixed(2), 'Target:', targetDisperse.toFixed(2));
    }

    // ===================================
    // 动画循环
    // ===================================
    function animate() {
        animationId = requestAnimationFrame(animate);

        // 平滑过渡分散程度
        currentDisperse += (targetDisperse - currentDisperse) * CONFIG.disperseSpeed;

        // 更新每个立方体的位置
        cubes.forEach((cube, index) => {
            // 自转
            cube.rotation.x += CONFIG.rotationSpeed;
            cube.rotation.y += CONFIG.rotationSpeed * 0.5;

            // 分散/聚合
            const initialPos = cube.userData.initialPosition;
            const direction = cube.userData.disperseDirection;
            
            // 计算目标位置（不修改原始向量）
            const offset = direction.clone().multiplyScalar(currentDisperse * CONFIG.disperseDistance);
            const targetPos = initialPos.clone().add(offset);

            // 平滑移动
            cube.position.lerp(targetPos, 0.1);
        });

        renderer.render(scene, camera);
    }

    // ===================================
    // 清理函数
    // ===================================
    function dispose() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('scroll', onScroll);

        // 清理立方体
        cubes.forEach(cube => {
            if (cube.geometry) cube.geometry.dispose();
            if (cube.material) {
                if (Array.isArray(cube.material)) {
                    cube.material.forEach(mat => mat.dispose());
                } else {
                    cube.material.dispose();
                }
            }
            scene.remove(cube);
        });
        cubes = [];

        // 清理渲染器
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }

        console.log('Cube animation: disposed');
    }

    // ===================================
    // 导出公共 API
    // ===================================
    window.CubeAnimation = {
        init,
        dispose,
        setConfig: function(newConfig) {
            Object.assign(CONFIG, newConfig);
        },
        getConfig: function() {
            return { ...CONFIG };
        }
    };

    // ===================================
    // 自动初始化
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
