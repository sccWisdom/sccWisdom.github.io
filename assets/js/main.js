// ===================================
// 打字机效果
// ===================================
const typewriterTexts = [
    'Java 后端开发',
    '政务信息化项目建设',
    '数据治理与智能问答',
    'AI 智能体应用探索'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeWriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    const currentText = typewriterTexts[textIndex];
    
    if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        typingSpeed = 500;
    }
    
    setTimeout(typeWriter, typingSpeed);
}

// ===================================
// 移动端菜单切换
// ===================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileMenuBtn || !navMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ===================================
// 导航栏滚动高亮
// ===================================
function initNavScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;

        if (navbar) {
            navbar.classList.toggle('home-hidden', scrollY < window.innerHeight * 0.58);
        }
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink();
}

// ===================================
// 滚动动画
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.card, .section-title, .timeline-item, .capability-panel, .project-timeline-card, .project-node, .experience-main-card, .experience-growth-card, .education-strip').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ===================================
// 平滑滚动
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// 导航栏滚动效果
// ===================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(10, 14, 26, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 14, 26, 0.8)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// 技能标签动效
// ===================================
function initSkillTags() {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===================================
// 统计数字动画
// ===================================
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const number = parseInt(text);
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 20;
                    const suffix = text.replace(/[0-9]/g, '');
                    
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            target.textContent = text;
                            clearInterval(timer);
                        } else {
                            target.textContent = Math.floor(current) + suffix;
                        }
                    }, 50);
                }
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// ===================================
// 项目卡片动效增强
// ===================================
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.project-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.project-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0)';
            }
        });
    });
}

// ===================================
// Loading 页面控制器
// ===================================
function initLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.querySelector('.loading-progress-glow');
    const percentText = document.querySelector('.loading-percent');
    const statusText = document.querySelector('.loading-status-text');
    const skipBtn = document.querySelector('.loading-skip-btn');
    const particlesContainer = document.querySelector('.loading-particles');

    if (!loadingOverlay || !progressBar) return;

    const statusMessages = [
        'Initializing systems...',
        'Loading assets...',
        'Building 3D scene...',
        'Rendering interface...',
        'Almost ready...'
    ];

    let currentProgress = 0;
    let statusIndex = 0;
    let isCompleted = false;

    function createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'loading-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particle.style.animationDuration = `${2 + Math.random() * 2}s`;
            const colors = ['rgba(99, 102, 241, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(59, 130, 246, 0.8)'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 ${6 + Math.random() * 6}px ${particle.style.background}`;
            particlesContainer.appendChild(particle);
        }
    }

    function updateProgress(progress) {
        currentProgress = Math.min(progress, 100);
        progressBar.style.width = `${currentProgress}%`;
        percentText.textContent = Math.floor(currentProgress);

        const newStatusIndex = Math.floor(currentProgress / 25);
        if (newStatusIndex !== statusIndex && newStatusIndex < statusMessages.length) {
            statusIndex = newStatusIndex;
            statusText.textContent = statusMessages[statusIndex];
        }
    }

    function completeLoading() {
        if (isCompleted) return;
        isCompleted = true;

        updateProgress(100);
        statusText.textContent = 'Ready!';

        setTimeout(() => {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }, 800);
        }, 600);
    }

    function skipLoading() {
        if (isCompleted) return;
        isCompleted = true;
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 800);
    }

    createParticles();

    let loadStartTime = Date.now();
    const loadDuration = 2500;

    function animateProgress() {
        if (isCompleted) return;

        const elapsed = Date.now() - loadStartTime;
        const progress = Math.min((elapsed / loadDuration) * 100, 100);

        const easeOut = 1 - Math.pow(1 - progress / 100, 3);
        updateProgress(easeOut * 100);

        if (progress < 100) {
            requestAnimationFrame(animateProgress);
        } else {
            completeLoading();
        }
    }

    requestAnimationFrame(animateProgress);

    skipBtn.addEventListener('click', skipLoading);

    document.body.style.overflow = 'hidden';
}

// ===================================
// 初始化所有功能
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    typeWriter();
    initMobileMenu();
    initNavScroll();
    initScrollAnimations();
    initSmoothScroll();
    initNavbarScroll();
    initSkillTags();
    animateStats();
    initProjectCards();
});
