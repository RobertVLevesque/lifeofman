// --- Mechanical Split-Flap (Airport Board) Engine ---
class SplitFlap {
    static chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/-,&'()";
    
    static animate(element, targetText) {
        if (!element) return;
        const target = targetText.toUpperCase();
        let current = element.innerText.toUpperCase().padEnd(target.length, " ");
        
        // Ensure strings are same length for mechanical symmetry
        if (current.length > target.length) current = current.substring(0, target.length);
        
        const charsArray = target.split("");
        const displayArray = current.split("");
        
        let completed = 0;
        const total = charsArray.length;
        
        const interval = setInterval(() => {
            let frameOutput = "";
            let finishedCount = 0;
            
            for (let i = 0; i < total; i++) {
                const targetChar = charsArray[i];
                const currentChar = displayArray[i];
                
                if (currentChar === targetChar) {
                    frameOutput += targetChar;
                    finishedCount++;
                } else {
                    // Find next char in sequence
                    let idx = this.chars.indexOf(currentChar);
                    if (idx === -1) idx = 0;
                    const nextIdx = (idx + 1) % this.chars.length;
                    const nextChar = this.chars[nextIdx];
                    displayArray[i] = nextChar;
                    frameOutput += nextChar;
                }
            }
            
            element.innerText = frameOutput;
            
            if (finishedCount === total) {
                clearInterval(interval);
            }
        }, 30); // 30ms "clatter" speed
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const cursor = document.getElementById('cursor');
    const watchBezel = document.getElementById('watch-bezel');
    const watchContainer = document.querySelector('.watch-container');
    const trail = document.querySelector('.multi-exposure-trail');
    const bgBlack = document.getElementById('bg-black');
    
    const maxScroll = () => Math.max(1, document.body.scrollHeight - window.innerHeight);
    
    // --- Dynamic Section Config ---
    const sectionsData = [
        {
            id: 'bg-fashion',
            title: 'FASHION',
            label1: 'Fabrication:', value1: 'Wool Blend',
            label2: 'Fit:', value2: 'Tailored',
            label3: 'Atmosphere:', value3: 'Moody / Nocturnal'
        },
        {
            id: 'bg-cars',
            title: 'CARS',
            label1: 'Material:', value1: 'Polished Chrome',
            label2: 'Aesthetic:', value2: 'Aggressive',
            label3: 'Terrain:', value3: 'Midnight Asphalt'
        },
        {
            id: 'bg-gear',
            title: 'GEAR',
            label1: 'Mechanics:', value1: 'Exposed Calibers',
            label2: 'Material:', value2: 'Carbon Fiber',
            label3: 'Precision:', value3: 'Sub-Millimeter'
        },
        {
            id: 'bg-health',
            title: 'HEALTH',
            label1: 'Focus:', value1: 'Biometrics',
            label2: 'Environment:', value2: 'Dark Iron',
            label3: 'Intensity:', value3: 'Maximum'
        },
        {
            id: 'bg-woman',
            title: 'WOMAN',
            label1: 'Lighting:', value1: 'Soft Silhouette',
            label2: 'Texture:', value2: 'Rich Velvet',
            label3: 'Tone:', value3: 'Charcoal & Gold'
        }
    ];

    // Grab background DOM elements
    const backgrounds = sectionsData.map(sec => document.getElementById(sec.id));

    // Right Panel DOM Elements
    const dynSectionName = document.getElementById('dyn-section-name');
    const dynLabel1 = document.getElementById('dyn-label-1');
    const dynValue1 = document.getElementById('dyn-value-1');
    const dynLabel2 = document.getElementById('dyn-label-2');
    const dynValue2 = document.getElementById('dyn-value-2');
    const dynLabel3 = document.getElementById('dyn-label-3');
    const dynValue3 = document.getElementById('dyn-value-3');

    // --- Custom Cursor Logic ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Disable custom cursor tracking natively on touch devices to save battery
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const infoPanel = document.querySelector('.info-panel');
    
    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        infoPanel.addEventListener('mouseenter', () => cursor.classList.add('enter-mode'));
        infoPanel.addEventListener('mouseleave', () => cursor.classList.remove('enter-mode'));
    }
    infoPanel.addEventListener('click', () => {
        if (activeSectionIndex >= 0) {
            const pageName = sectionsData[activeSectionIndex].id.replace('bg-', '') + '.html';
            window.location.href = pageName;
        }
    });

    // --- Scrubbing Engine ---
    let currentRotation = 0;
    let isScrubbing = false;
    let scrubTimeout;
    
    let activeSectionIndex = -4; // Initialize deeply negative to force update
    let isHudAwake = false; // Tracks if they have scrolled past intro
    let isBootSequenceComplete = false; // Blocks SCROLL and scrolling actions until typing is done

    const subDepth = document.getElementById('subdial-depth');

    // --- Typist Boot Sequence ---
    const storyTextNode = document.getElementById('dyn-story-text');
    const introString = "Life begins with you man";
    let typeIndex = 0;
    
    function typeWriter() {
        if (typeIndex < introString.length) {
            storyTextNode.innerHTML += introString.charAt(typeIndex);
            typeIndex++;
            setTimeout(typeWriter, 40); // 40ms per character
        } else {
            // Typing finished. Hold for 2 seconds.
            setTimeout(() => {
                // 1. Reveal Info Box Glass Background
                const infoPanel = document.getElementById('info-panel');
                if (infoPanel) infoPanel.classList.remove('boot-hidden');
                
                // 2. Wait 800ms, Reveal Section Header ("SECTION IN FOCUS:")
                setTimeout(() => {
                    const techHeader = document.getElementById('technical-header');
                    if (techHeader) techHeader.classList.remove('boot-hidden');
                    
                    // 3. Wait 800ms, Fade out the welcome text "Life begins with you man"
                    setTimeout(() => {
                        storyTextNode.style.transition = "opacity 0.6s ease";
                        storyTextNode.style.opacity = 0;
                        
                        // 4. Wait for fade to finish, collapse text node, allow SCROLL to emerge
                        setTimeout(() => {
                            isBootSequenceComplete = true; // Unlock the sequence
                            storyTextNode.style.display = 'none'; // Structural collapse
                            window.dispatchEvent(new Event('scroll')); // Triggers "SCROLL"
                        }, 600);
                    }, 800);
                }, 800);
            }, 2000);
        }
    }
    
    // Start typing slightly after page boots
    setTimeout(typeWriter, 500);
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const rawProgress = scrollY / maxScroll();
        const scrollProgress = Math.min(Math.max(rawProgress, 0), 1);

        // --- Watch Bezel Rotation ---
        // EXACTLY 360 degrees mapped across the entire scroll flow
        currentRotation = scrollProgress * 360;
        
        if (watchBezel) watchBezel.style.transform = `rotate(${currentRotation}deg)`;
        if (trail) trail.style.transform = `rotate(${currentRotation - 5}deg)`;

        // --- Depth Gauge Mechanics ---
        // Sweeps like a speedometer from -135deg to +135deg based on scroll depth
        if (subDepth) {
            const depthDeg = -135 + (scrollProgress * 270);
            subDepth.style.transform = `rotate(${depthDeg}deg)`;
        }
        
        // Scrub visual state
        if (!isScrubbing) {
            isScrubbing = true;
            infoPanel.classList.add('active-scrub');
            cursor.classList.add('scrubbing');
            trail.style.opacity = '0.4';
        }
        
        clearTimeout(scrubTimeout);
        scrubTimeout = setTimeout(() => {
            isScrubbing = false;
            infoPanel.classList.remove('active-scrub');
            cursor.classList.remove('scrubbing');
            trail.style.opacity = '0';
            trail.style.transform = `rotate(${currentRotation}deg)`; 
        }, 150);

        // --- Intro Black Screen ---
        const blackOpacity = 1 - (scrollProgress * 15); // Fast fade out 0 to ~0.06
        bgBlack.style.opacity = Math.max(0, blackOpacity);

        // --- Background Parallax Logic ---
        const totalSections = sectionsData.length;
        const chunk = 1.0 / totalSections;
        
        const currentIndex = Math.min(Math.floor(scrollProgress / chunk), totalSections - 1);
        const localProgress = (scrollProgress - (currentIndex * chunk)) / chunk;

        // --- HUD State Machine ---
        let shouldHudBeAwake = scrollProgress > 0.05; // Wake HUD up when at 5% scroll

        // Apply visual updates if section crossed over OR HUD sleep state changed
        if (currentIndex !== activeSectionIndex || shouldHudBeAwake !== isHudAwake) {
            activeSectionIndex = currentIndex;
            isHudAwake = shouldHudBeAwake;

            // Persistent Scale & Position: Watch face remains at 0.7 from start
            if (watchContainer) {
                if (!isHudAwake) {
                    // Initial Landing state (also 0.7 but slightly more centered)
                    watchContainer.style.transform = `translateX(-15%) translateY(-10%) scale(0.7)`;
                } else {
                    // Locked active state
                    watchContainer.style.transform = `translateX(-15%) translateY(-10%) scale(0.7)`;
                }
            }

            // Crossfade effect for the Section Title blending
            dynSectionName.style.opacity = 0;
            
            setTimeout(() => {
                const dataPointsBox = document.getElementById('data-points-container');

                if (!isHudAwake) {
                    // Sleep Mode: Clear all HUD data
                    if (!isBootSequenceComplete) {
                        dynSectionName.innerText = "";
                    } else {
                        dynSectionName.innerText = "SCROLL";
                    }
                    dataPointsBox.style.display = 'none';
                    
                    document.querySelector('.pulse-dot').style.backgroundColor = "transparent";
                    document.querySelector('.pulse-dot').style.boxShadow = "none";
                    cursor.style.borderColor = "var(--text-main)";
                } else {
                    // Awake Mode: Inject dynamic section data
                    dataPointsBox.style.display = 'flex';
                    dataPointsBox.style.opacity = 1;

                    const data = sectionsData[currentIndex];
                    
                    // Split-Flap mechanical animation for HUD values
                    SplitFlap.animate(dynSectionName, data.title);
                    SplitFlap.animate(dynValue1, data.value1);
                    SplitFlap.animate(dynValue2, data.value2);
                    SplitFlap.animate(dynValue3, data.value3);

                    // These labels are usually static but we can flap them too for extra hardware feel
                    SplitFlap.animate(dynLabel1, data.label1);
                    SplitFlap.animate(dynLabel2, data.label2);
                    SplitFlap.animate(dynLabel3, data.label3);

                    // Mechanical Cascade: Individually snap each sub-element staggered by 60 milliseconds
                    const rows = dataPointsBox.querySelectorAll('.data-row');
                    rows.forEach((row, index) => {
                        row.classList.remove('roll-in');
                        void row.offsetWidth; // Force geometric reflow
                        setTimeout(() => {
                            row.classList.add('roll-in');
                        }, index * 60); // 60ms stagger per row!
                    });
                    
                    const colors = ['var(--accent-amber)', '#a1a1a1', '#ff5500', '#00ffcc', '#ffd700'];
                    document.querySelector('.pulse-dot').style.backgroundColor = colors[currentIndex % colors.length];
                    document.querySelector('.pulse-dot').style.boxShadow = `0 0 10px ${colors[currentIndex % colors.length]}`;
                    cursor.style.borderColor = colors[currentIndex % colors.length];
                }
                dynSectionName.style.opacity = 1;
            }, 300);
        }

        // Visual calculation for layers (Auto-calc for N sections)
        backgrounds.forEach((bg, i) => {
            if (i === currentIndex) {
                // Outgoing layer (Fading out, sliding left)
                const outgoingBlur = Math.pow(localProgress, 3) * 15;
                const outgoingTranslateX = localProgress * -30;
                const outgoingOpacity = 1 - Math.pow(localProgress, 4);

                bg.style.filter = `blur(${outgoingBlur}px) brightness(${0.6 - (localProgress * 0.2)})`;
                bg.style.transform = `translate(${outgoingTranslateX}%, 0) scale(1.05)`;
                bg.style.opacity = Math.max(0, outgoingOpacity);
                bg.style.zIndex = 2; // Always underneath the incoming layer
            }
            else if (i === currentIndex + 1) {
                // Incoming layer (Fading in, sliding right to center)
                const incomingTranslateX = -50 + (Math.pow(localProgress, 0.8) * 50); 
                const incomingBlur = 15 - (Math.pow(localProgress, 2) * 15);
                const incomingOpacity = Math.pow(localProgress, 1.5); 
                
                bg.style.filter = `blur(${incomingBlur}px) brightness(${0.3 + (localProgress * 0.3)})`;
                bg.style.transform = `translate(${incomingTranslateX}%, 0) scale(1)`;
                bg.style.opacity = incomingOpacity;
                bg.style.zIndex = 3; // Above the outgoing layer
            }
            else {
                // Off-screen layers
                bg.style.opacity = 0;
                bg.style.zIndex = 1;
                if (i < currentIndex) {
                    bg.style.transform = `translate(-30%, 0) scale(1.05)`;
                } else {
                    bg.style.transform = `translate(-50%, 0) scale(1)`;
                }
            }
        });

        // --- Optical Glow Transition ---
        const transGlow = document.getElementById('transition-glow');
        if (transGlow) {
            // Only trigger glow if we are past the initial black screen
            if (activeSectionIndex >= 0) {
                const exactBoundary = Math.round(scrollProgress / chunk) * chunk;
                const distance = Math.abs(scrollProgress - exactBoundary);
                
                // Creates a tiny active window of 4% of the entire page scroll (0.04) 
                // where the glow flares up dramatically as sections cross over
                const transitionWidth = 0.04;
                if (distance < transitionWidth) {
                    const spike = 1 - (distance / transitionWidth);
                    transGlow.style.opacity = Math.pow(spike, 2); // Squared to make the flash punchier
                } else {
                    transGlow.style.opacity = 0;
                }
            } else {
                transGlow.style.opacity = 0;
            }
        }
    });

    // Force initialization of layout
    window.dispatchEvent(new Event('scroll'));

    // --- Live Clock Logic ---
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    const dateWindow = document.getElementById('date-window');
    
    // SVG Subdials
    const subMsec = document.getElementById('subdial-msec');
    const sub24hr = document.getElementById('subdial-24hr');

    function updateClock() {
        const now = new Date();
        const msec = now.getMilliseconds();
        const seconds = now.getSeconds() + (msec / 1000);
        const mins = now.getMinutes() + (seconds / 60);
        const hours = (now.getHours() % 12) + (mins / 60);

        const day = now.getDate();
        if (dateWindow.innerText !== day.toString().padStart(2, '0')) {
            dateWindow.innerText = day.toString().padStart(2, '0');
        }

        const secondDeg = seconds * 6;
        const minuteDeg = mins * 6;
        const hourDeg = hours * 30;

        // Subdial Math
        // Sweeping Millisecond Hand (1 full rotation every second = insanely fast mechanical look)
        const msecDeg = (msec / 1000) * 360;
        
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        
        if(subMsec) subMsec.style.transform = `rotate(${msecDeg}deg)`;

        requestAnimationFrame(updateClock);
    }

    updateClock();

    // --- Kinetic Engine 3D Story Feed ---
    class KineticSlider {
        constructor() {
            this.viewport = document.querySelector('.kinetic-viewport');
            this.ribbon = document.querySelector('.kinetic-ribbon');
            this.cards = document.querySelectorAll('.kinetic-card');
            
            if (!this.viewport || !this.ribbon) return;

            this.scrollPos = 0;
            this.targetScroll = 0;
            this.momentum = 0.08; // Silky smooth LERP constant
            
            this.init();
        }

        init() {
            window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
            this.animate();
        }

        handleWheel(e) {
            e.preventDefault();
            // Map vertical scroll Delta to horizontal Target
            this.targetScroll += e.deltaY * 1.5;
            
            // Boundary constraints
            const maxScroll = this.ribbon.offsetWidth - (window.innerWidth / 2);
            this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
        }

        animate() {
            // Smooth Interpolation (LERP)
            this.scrollPos += (this.targetScroll - this.scrollPos) * this.momentum;
            
            // Apply Ribbon Movement
            this.ribbon.style.transform = `translateX(${-this.scrollPos}px)`;

            // --- Background Parallax Depth ---
            // The fixed car4.png watermark shifts slightly opposite to the ribbon
            const bg = document.querySelector('body::before'); 
            // Since we can't easily target pseudo-elements in JS, we'll use a CSS variable
            document.documentElement.style.setProperty('--kinetic-bg-x', `${this.scrollPos * 0.05}px`);
            
            // Calculate 3D Bloom & Perspective logic for each card
            this.cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const center = window.innerWidth / 2;
                const distance = rect.left + (rect.width / 2) - center;
                const normalizedDistance = distance / center; // -1 to 1
                
                // Focus Logic
                if (Math.abs(normalizedDistance) < 0.25) {
                    card.classList.add('in-focus');
                } else {
                    card.classList.remove('in-focus');
                }

                // 3D Perspective Distortion
                const rotateY = normalizedDistance * -20; // Swing away at edges
                const translateZ = Math.max(-300, Math.abs(normalizedDistance) * -250);
                const scale = Math.max(0.7, 1 - Math.abs(normalizedDistance) * 0.3);
                
                card.style.transform = `scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            });

            // Magnetic Snapping Settlement
            if (Math.abs(this.targetScroll - this.scrollPos) < 1 && this.targetScroll % 650 !== 0) {
                 // Future logic for auto-snapping to card centers could go here
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // Auto-boot if on a story subpage
    new KineticSlider();
});
