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
    
    let activeSectionIndex = -1;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const rawProgress = scrollY / maxScroll();
        const scrollProgress = Math.min(Math.max(rawProgress, 0), 1);

        // --- Watch Bezel Rotation ---
        // EXACTLY 360 degrees mapped across the entire scroll flow
        currentRotation = scrollProgress * 360;
        
        watchBezel.style.transform = `rotate(${currentRotation}deg)`;
        trail.style.transform = `rotate(${currentRotation - 5}deg)`;
        
        // Scrub visual state
        if (!isScrubbing) {
            isScrubbing = true;
            watchContainer.classList.add('active-scrub');
            cursor.classList.add('scrubbing');
            trail.style.opacity = '0.4';
        }
        
        clearTimeout(scrubTimeout);
        scrubTimeout = setTimeout(() => {
            isScrubbing = false;
            watchContainer.classList.remove('active-scrub');
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

        // Apply visual updates if section crossed over
        if (currentIndex !== activeSectionIndex) {
            activeSectionIndex = currentIndex;
            const data = sectionsData[currentIndex];
            
            dynSectionName.innerText = data.title;
            dynLabel1.innerText = data.label1;
            dynValue1.innerText = data.value1;
            dynLabel2.innerText = data.label2;
            dynValue2.innerText = data.value2;
            dynLabel3.innerText = data.label3;
            dynValue3.innerText = data.value3;
            
            const colors = ['var(--accent-amber)', '#a1a1a1', '#ff5500', '#00ffcc', '#ffd700'];
            document.querySelector('.pulse-dot').style.backgroundColor = colors[currentIndex % colors.length];
            document.querySelector('.pulse-dot').style.boxShadow = `0 0 10px ${colors[currentIndex % colors.length]}`;
            cursor.style.borderColor = colors[currentIndex % colors.length];
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
    });

    // Force initialization of layout
    window.dispatchEvent(new Event('scroll'));

    // --- Live Clock Logic ---
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    const dateWindow = document.getElementById('date-window');

    function updateClock() {
        const now = new Date();
        const seconds = now.getSeconds() + (now.getMilliseconds() / 1000);
        const mins = now.getMinutes() + (seconds / 60);
        const hours = (now.getHours() % 12) + (mins / 60);

        const day = now.getDate();
        if (dateWindow.innerText !== day.toString().padStart(2, '0')) {
            dateWindow.innerText = day.toString().padStart(2, '0');
        }

        const secondDeg = seconds * 6;
        const minuteDeg = mins * 6;
        const hourDeg = hours * 30;

        secondHand.style.transform = `rotate(${secondDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        hourHand.style.transform = `rotate(${hourDeg}deg)`;

        requestAnimationFrame(updateClock);
    }

    updateClock();
});
