// wait for DOM content to fully load
document.addEventListener('DOMContentLoaded', () => {

    /* THEME TOGGLE */
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
    
    // Apply persisted theme immediately
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    /*SMOOTH SCROLLING (Lenis)*/
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);


    /*MOUSE SPOTLIGHT GLOW*/
    const spotlight = document.getElementById('cursor-spotlight');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // LERP (Linear Interpolation) loop for smooth spring lag on spotlight cursor
    const animateSpotlight = () => {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;
        
        currentX += dx * 0.08;
        currentY += dy * 0.08;
        
        if (spotlight) {
            spotlight.style.left = `${currentX}px`;
            spotlight.style.top = `${currentY}px`;
        }
        
        requestAnimationFrame(animateSpotlight);
    };
    animateSpotlight();


    /* BENTO CARD & TIMELINE HOVER GLOWS */
    const updateCardGlow = (e, card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    };

    const registerCardGlowHover = () => {
        const glowCards = document.querySelectorAll('.glow-card');
        glowCards.forEach(card => {
            card.addEventListener('mousemove', (e) => updateCardGlow(e, card));
        });
    };
    registerCardGlowHover();


    /* MAGNETIC ELEMENTS PHYSICS */
    const initMagneticElements = () => {
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                // Find distance from center
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Move parent element slightly towards mouse
                gsap.to(el, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                // Move text/icon container within button slightly less for parallax depth
                const textContainer = el.querySelector('span, i');
                if (textContainer) {
                    gsap.to(textContainer, {
                        x: x * 0.15,
                        y: y * 0.15,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
            
            el.addEventListener('mouseleave', () => {
                // Reset positions with spring elastic exit bounce
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1.1, 0.4)'
                });
                
                const textContainer = el.querySelector('span, i');
                if (textContainer) {
                    gsap.to(textContainer, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: 'elastic.out(1.1, 0.4)'
                    });
                }
            });
        });
    };
    initMagneticElements();


    /* 3D PROFILE TILT INTERACTION */
    const initProfileTilt = () => {
        const tiltContainer = document.querySelector('.tilt-effect');
        if (!tiltContainer) return;
        
        const card = tiltContainer.querySelector('.profile-card');
        const glow = tiltContainer.querySelector('.profile-glow');
        
        tiltContainer.addEventListener('mousemove', (e) => {
            const rect = tiltContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt angle rotation (max 12 deg)
            const rotateX = ((centerY - y) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.3
            });
            
            // Translate backing glow in opposite direction for parallax
            gsap.to(glow, {
                x: -rotateY * 3,
                y: rotateX * 3,
                ease: 'power2.out',
                duration: 0.3
            });
        });
        
        tiltContainer.addEventListener('mouseleave', () => {
            // Reset to flat
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                ease: 'power3.out',
                duration: 0.5
            });
            gsap.to(glow, {
                x: 0,
                y: 0,
                ease: 'power3.out',
                duration: 0.5
            });
        });
    };
    initProfileTilt();


    /* LOADING SCREEN & HERO REVEALS */
    const loader = document.getElementById('loader');
    const progressLine = document.querySelector('.loader-progress-line');
    const loaderStatus = document.querySelector('.loader-status');
    
    // Status text iterations during loading progress
    const loadingStatuses = [
        'Initializing Core Modules...',
        'Booting Canvas Physics Engine...',
        'Compiling Layout Matrices...',
        'Syncing WebSockets Handshake...',
        'Rendering Fluid Aesthetics...'
    ];
    
    let progressVal = 0;
    
    const runLoader = () => {
        const interval = setInterval(() => {
            progressVal += Math.floor(Math.random() * 12) + 4;
            
            if (progressVal >= 100) {
                progressVal = 100;
                clearInterval(interval);
                progressLine.style.width = '100%';
                loaderStatus.innerText = 'System Operational.';
                
                setTimeout(() => {
                    triggerLandingTransition();
                }, 400);
            } else {
                progressLine.style.width = `${progressVal}%`;
                // Cycle through status messages
                const statusIndex = Math.min(Math.floor(progressVal / 20), loadingStatuses.length - 1);
                loaderStatus.innerText = loadingStatuses[statusIndex];
            }
        }, 80);
    };
    runLoader();
    
    const triggerLandingTransition = () => {
        const tl = gsap.timeline();
        
        tl.to(loader, {
            opacity: 0,
            filter: 'blur(20px)',
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => {
                loader.classList.add('loaded');
                // Initialize ScrollTrigger-dependent elements
                initScrollAnimations();
            }
        });
        
        // Staggered reveal of hero items
        tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4');
        tl.from('.hero-title', { opacity: 0, y: 35, duration: 0.8, ease: 'power3.out' }, '-=0.5');
        tl.from('.hero-subtext', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.6');
        tl.from('.hero-desc', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.5');
        tl.from('.hero-btns-wrapper', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.5');
        tl.from('.hero-stats', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.5');
        tl.from('.hero-graphics', { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power3.out' }, '-=0.7');
    };


    /* HERO STATS ANIMATED COUNTERS */
    const runStatsCounter = () => {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const countObj = { val: 0 };
            
            gsap.to(countObj, {
                val: target,
                duration: 2.2,
                ease: 'power3.out',
                onUpdate: () => {
                    stat.innerText = Math.floor(countObj.val);
                }
            });
        });
    };


    /* STICKY NAVBAR & NAVIGATION INDICATOR */
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('.nav-item');
    const indicator = document.querySelector('.nav-indicator');

    const updateIndicatorPosition = (activeLink) => {
        if (!activeLink || !indicator) return;
        const rect = activeLink.getBoundingClientRect();
        const navRect = activeLink.parentElement.getBoundingClientRect();
        
        indicator.style.left = `${rect.left - navRect.left}px`;
        indicator.style.width = `${rect.width}px`;
        indicator.style.opacity = 1;
    };

    // Sticky Scroll event
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Set initial position of slide indicator
    const currentActiveLink = document.querySelector('.nav-item.active');
    if (currentActiveLink) {
        setTimeout(() => {
            updateIndicatorPosition(currentActiveLink);
        }, 1500); // Trigger after page animations start settling
    }

    // Bind link hover sliding animations
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            updateIndicatorPosition(link);
        });
        
        link.addEventListener('mouseleave', () => {
            const active = document.querySelector('.nav-item.active');
            if (active) {
                updateIndicatorPosition(active);
            } else {
                indicator.style.opacity = 0;
            }
        });
    });

    // Window resize event to recalculate indicator positions
    window.addEventListener('resize', () => {
        const active = document.querySelector('.nav-item.active');
        if (active) updateIndicatorPosition(active);
    });


    /* MOBILE NAVBAR & OVERLAY ANIMATION */
    const menuBtn = document.getElementById('menu-icon');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

    const toggleMobileMenu = () => {
        const isActive = mobileMenu.classList.toggle('active');
        menuBtn.classList.toggle('active');
        
        // Handle menu icon line animations
        const lineTop = menuBtn.querySelector('.line-top');
        const lineMiddle = menuBtn.querySelector('.line-middle');
        const lineBottom = menuBtn.querySelector('.line-bottom');
        
        if (isActive) {
            gsap.to(lineTop, { rotation: 45, y: 7, duration: 0.3, ease: 'power2.out' });
            gsap.to(lineMiddle, { opacity: 0, duration: 0.2 });
            gsap.to(lineBottom, { rotation: -45, y: -7, duration: 0.3, ease: 'power2.out' });
            
            // Prevent scroll on body when menu open
            lenis.stop();
        } else {
            gsap.to(lineTop, { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
            gsap.to(lineMiddle, { opacity: 1, duration: 0.2 });
            gsap.to(lineBottom, { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
            
            lenis.start();
        }
    };

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });


    /* INTERACTIVE TERMINAL */
    const terminalBody = document.getElementById('terminal-logs');
    const terminalInput = document.getElementById('terminal-input');
    const terminalClearBtn = document.getElementById('terminal-clear-btn');
    
    // Command history
    const cmdHistory = [];
    let historyIndex = -1;

    const terminalCommands = {
        help: () => [
            { text: 'Available commands:', color: 'text-green' },
            { text: '  help          — show this menu' },
            { text: '  about         — quick intro' },
            { text: '  skills        — my tech stack' },
            { text: '  projects      — what I\'ve built' },
            { text: '  stranger-kun  — current project info' },
            { text: '  contact       — how to reach me' },
            { text: '  socials       — social links' },
            { text: '  whoami        — who am I?' },
            { text: '  date          — current date & time' },
            { text: '  uptime        — how long I\'ve been coding' },
            { text: '  clear         — clear the terminal' },
        ],
        about: () => [
            { text: '┌─ About tnishx ─────────────────────┐', color: 'text-cyan' },
            { text: '│ Tanish, 21, Bangalore' },
            { text: '│ Full-stack developer & builder' },
            { text: '│ Calisthenics athlete & footballer' },
            { text: '│ I build things that feel right.' },
            { text: '└────────────────────────────────────┘', color: 'text-cyan' },
        ],
        skills: () => [
            { text: 'Tech Stack:', color: 'text-green' },
            { text: '  Frontend  → React, Next.js, TypeScript, CSS5' },
            { text: '  Backend   → Node.js, Express, PostgreSQL, MongoDB' },
            { text: '  Languages → JavaScript, C++, Rust' },
            { text: '  Tools     → Git, Docker, Linux, Bash' },
        ],
        projects: () => [
            { text: 'Projects:', color: 'text-green' },
            { text: '  [01] Stranger-kun — Anonymous real-time chat (WebRTC + Sockets)' },
            { text: '  More coming soon...', color: 'text-cyan' },
        ],
        'stranger-kun': () => [
            { text: '╔══ Stranger-kun ═══════════════════╗', color: 'text-green' },
            { text: '║ Status: BUILD_IN_PROGRESS' },
            { text: '║ Progress: 23%' },
            { text: '║ Stack: React · Node.js · WebRTC · Socket.io' },
            { text: '║ Goal: Sub-100ms anonymous matching' },
            { text: '╚══════════════════════════════════╝', color: 'text-green' },
        ],
        contact: () => [
            { text: 'Get in touch:', color: 'text-green' },
            { text: '  Email  → tanishsingh797@gmail.com' },
            { text: '  Location → Bangalore, India' },
        ],
        socials: () => [
            { text: 'Find me online:', color: 'text-cyan' },
            { text: '  GitHub    → github.com/tnishx' },
            { text: '  LinkedIn  → linkedin.com/tnishx' },
            { text: '  X/Twitter → x.com/tnishx' },
            { text: '  Instagram → instagram.com/tanishisfun' },
        ],
        whoami: () => [
            { text: 'tnishx', color: 'text-green' },
        ],
        date: () => [
            { text: new Date().toString(), color: 'text-cyan' },
        ],
        uptime: () => {
            const start = new Date(2024, 7, 1);
            const now = new Date();
            const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            return [
                { text: `Coding for ${days} days and counting...`, color: 'text-green' },
            ];
        },
    };

    const addTerminalLine = (text, colorClass = '') => {
        if (!terminalBody) return;
        const line = document.createElement('div');
        line.className = `log-line ${colorClass}`;
        line.textContent = text;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    const processCommand = (input) => {
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;

        // Echo the command
        addTerminalLine(`❯ ${input}`, 'text-cyan');

        if (cmd === 'clear') {
            terminalBody.innerHTML = '';
            addTerminalLine('Terminal cleared.', 'text-green');
            return;
        }

        const handler = terminalCommands[cmd];
        if (handler) {
            const lines = handler();
            lines.forEach(l => addTerminalLine(l.text, l.color || ''));
        } else {
            addTerminalLine(`command not found: ${cmd}. Type 'help' for available commands.`, 'text-red');
        }
    };

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value;
                if (val.trim()) {
                    cmdHistory.push(val);
                    historyIndex = cmdHistory.length;
                }
                processCommand(val);
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = cmdHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < cmdHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = cmdHistory[historyIndex];
                } else {
                    historyIndex = cmdHistory.length;
                    terminalInput.value = '';
                }
            }
        });
    }

    if (terminalClearBtn) {
        terminalClearBtn.addEventListener('click', () => {
            if (terminalBody) {
                terminalBody.innerHTML = '';
                addTerminalLine('Terminal cleared.', 'text-green');
            }
        });
    }


    /* SKILLS VIEWPORT REVEAL ANIMATIONS */
    const triggerSkillsBars = () => {
        const progressBars = document.querySelectorAll('.skill-bar-fill');
        progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    };


    /* PROJECT CASE STUDY SLIDE-OUT PANEL */
    const caseStudyData = {
        'stranger-kun': {
            title: 'Stranger-kun',
            number: '01',
            problem: 'Establishing reliable peer-to-peer connections required implementing WebRTC signaling, handling ICE candidate exchange, and dealing with NAT traversal using STUN/TURN servers while maintaining a seamless user experience.',
            solution: 'Built a React frontend with a Node.js backend using Socket.IO for user matchmaking and signaling. Once paired, WebRTC established direct peer-to-peer media streams while Socket.IO handled connection lifecycle events such as matching, skipping, and reconnection.',
            techStack: ['React','Socket.IO (Signaling)','Node.js + Express','Matchmaking WebRTC Signaling','Peer-to-Peer Connection'],
            features: 'Instant anonymous user matching, Real-time text messaging with WebSockets, Peer-to-peer video communication using WebRTC, Skip/Next matching without page reloads',
            challenges: 'Managing WebRTC signaling and establishing reliable P2P connections between diverse network configurations (NATs/Firewalls).',
            outcome: 'Delivered a fully functional anonymous chat platform supporting instant user matching, real-time messaging, and peer-to-peer video communication with a responsive user experience across desktop and mobile devices.',
            architecture: ['React.js Frontend UI', 'Node.js Matching Engine', 'WebRTC Peer signaling', 'WebSocket Cluster Nodes']
        },
        'aetherengine': {
            title: 'AetherEngine',
            number: '02',
            objective: 'Create a hyper-performant 2D particle simulation engine executing natively on browser environments using WebAssembly to maintain 60 FPS under high loads.',
            challenges: 'Standard HTML5 Canvas operations bound to JavaScript event loops drop frames once particle counts exceed 5,000, due to garbage collection cycles and memory allocation lags.',
            solutions: 'Wrote the core rendering pipeline and physics math in object-oriented C++. Utilized WebAssembly bindings (Emscripten) and a shared memory array buffer to transfer physics offsets directly to WebGL canvases.',
            architecture: ['WebGL Render Pipeline', 'Wasm Shared Memory Buffer', 'C++ Physics Core', 'Emscripten Bindings']
        },
        'zenithui': {
            title: 'Zenith UI',
            number: '03',
            objective: 'Design and bundle a zero-dependency component library tailored to offer spring-damping mechanics, pixel-perfect layouts, and full screen reader accessibility.',
            challenges: 'Modern component libraries rely on heavy runtime JS hooks or large animation libraries (Framer Motion, etc.), inflating bundle weights and degrading SEO performance.',
            solutions: 'Engineered clean custom CSS keyframes utilizing cubic-bezier curves matching spring math. Wrote vanilla JS interaction scripts bound to requestAnimationFrame loops, compressing to a tiny 1.2 KB package.',
            architecture: ['Spring Transition Matrices', 'Semantic HTML Structures', 'A11y ARIA bindings', 'Vanilla JS Engine']
        }
    };

    const caseStudyPanel = document.getElementById('case-study-panel');
    const caseStudyContent = document.getElementById('case-study-details');
    const caseStudyCloseBtn = document.querySelector('.panel-close-btn');
    const triggerButtons = document.querySelectorAll('.case-study-btn');

    const openCaseStudy = (projectId) => {
        const data = caseStudyData[projectId];
        if (!data || !caseStudyContent) return;
        
        let archNodesHtml = '';
        const nodesList = data.techStack || data.architecture;
        nodesList.forEach((node, index) => {
            archNodesHtml += `<div class="arch-node ${index % 2 === 0 ? 'accent' : ''}">${node}</div>`;
            if (index < nodesList.length - 1) {
                archNodesHtml += `<div class="arch-arrow"><i class="fa-solid fa-arrow-down"></i></div>`;
            }
        });
        
        caseStudyContent.innerHTML = `
            <div class="cs-header">
                <span class="project-number font-mono">${data.number}</span>
                <h2>${data.title}</h2>
            </div>
            
            ${data.problem ? `
            <div class="cs-block">
                <h4>Problem</h4>
                <p>${data.problem}</p>
            </div>
            ` : `
            <div class="cs-block">
                <h4>Objective</h4>
                <p>${data.objective}</p>
            </div>
            `}

            ${data.features ? `
            <div class="cs-block">
                <h4>Key Features</h4>
                <p>${data.features}</p>
            </div>
            ` : ''}
            
            <div class="cs-block">
                <h4>Technical Challenges</h4>
                <p>${data.challenges}</p>
            </div>
            
            <div class="cs-block">
                <h4>${data.solution ? 'Solution' : 'Solutions'}</h4>
                <p>${data.solution || data.solutions}</p>
            </div>

            ${data.outcome ? `
            <div class="cs-block">
                <h4>Outcome</h4>
                <p>${data.outcome}</p>
            </div>
            ` : ''}
            
            <div class="cs-block">
                <h4>${data.techStack ? 'Tech Stack' : 'Architecture Design'}</h4>
                <div class="cs-architecture-graphic">
                    <div class="arch-node-list">
                        ${archNodesHtml}
                    </div>
                </div>
            </div>
        `;
        
        caseStudyPanel.classList.add('active');
        lenis.stop(); // Stop scroll while reading case study
    };

    const closeCaseStudy = () => {
        caseStudyPanel.classList.remove('active');
        lenis.start();
    };

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const csId = btn.getAttribute('data-case-study');
            openCaseStudy(csId);
        });
    });

    if (caseStudyCloseBtn) {
        caseStudyCloseBtn.addEventListener('click', closeCaseStudy);
    }
    
    if (caseStudyPanel) {
        // Close if click outside panel container
        caseStudyPanel.addEventListener('click', (e) => {
            if (e.target === caseStudyPanel) {
                closeCaseStudy();
            }
        });
    }


    /* GSAP SCROLL TRIGGERS & VIEWPORT BINDINGS */
    const initScrollAnimations = () => {
        // Stats count trigger on Hero Section entry
        ScrollTrigger.create({
            trigger: '.hero-stats',
            start: 'top 85%',
            once: true,
            onEnter: () => {
                runStatsCounter();
            }
        });

        // Skills progression fill triggers
        ScrollTrigger.create({
            trigger: '.skills-deck',
            start: 'top 85%',
            once: true,
            onEnter: () => {
                triggerSkillsBars();
            }
        });

        // Staggered reveal for Bento Grid items
        gsap.from('.bento-card', {
            scrollTrigger: {
                trigger: '.bento-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Staggered reveal for Skills Deck cards
        gsap.from('.skill-deck-card', {
            scrollTrigger: {
                trigger: '.skills-deck',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        });

        // Project Cards reveal
        const projectCards = document.querySelectorAll('.project-showcase-card');
        projectCards.forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Experience items reveal
        gsap.from('.exp-item', {
            scrollTrigger: {
                trigger: '.experience-timeline',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 35,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Scrollspy Navigation Highlight matching section indices
        const sections = document.querySelectorAll('section');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                const hrefVal = link.getAttribute('href');
                if (hrefVal === `#${current}` || (hrefVal === '#' && current === 'home')) {
                    link.classList.add('active');
                    updateIndicatorPosition(link);
                }
            });
        });
    };


    /* CONTACT FORM & WEB3FORMS SUBMISSIONS */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !subject || !message) {
                showToast('Please fill in all fields!', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showToast('Please enter a valid email address!', 'error');
                return;
            }

            // Sending state indicator
            const submitBtn = document.getElementById('form-submit');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Sending...</span>';

            // Web3Forms API Key matching original client configuration
            const accessKey = 'b43060c3-311a-43c7-be9f-df55bb148971'; 

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            })
            .then(async (response) => {
                const json = await response.json();
                if (response.status === 200) {
                    showToast('Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                    // Trigger label resets
                    document.querySelectorAll('.input-group label').forEach(lbl => {
                        lbl.style.transform = '';
                    });
                } else {
                    showToast(json.message || 'Something went wrong!', 'error');
                }
            })
            .catch((error) => {
                console.error(error);
                showToast('API Connection Error! Please try again later.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Dynamic Toast alerts system
    function showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('i');
        if (type === 'success') {
            icon.className = 'fas fa-circle-check';
        } else {
            icon.className = 'fas fa-circle-exclamation';
        }
        
        const text = document.createElement('span');
        text.innerText = message;

        toast.appendChild(icon);
        toast.appendChild(text);
        toastContainer.appendChild(toast);

        // Slide entry
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        // Auto remove triggers
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 4000);
    }

    /*  HERO SUBTLE BACKGROUND PARTICLES */
    const initHeroParticles = () => {
        const canvas = document.getElementById('hero-particles-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 40;
        
        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.size = Math.random() * 2 + 1;
                this.speedY = Math.random() * 0.4 + 0.15;
                this.speedX = Math.random() * 0.3 - 0.15;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                
                if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(93, 209, 40, ${this.opacity})`;
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };
        animate();
    };
    initHeroParticles();
});