const CONFIG = {
    labels: ['everything', 'r3x.sh', 'who is AI?'],
    colors: ['cyan', 'yellow', 'magenta'],
    spawnDistance: 20,
    pillHeight: 40,
    minSpacing: 3,
    textAreaPadding: 100
};

let pills = [];
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;
let isMoving = false;
let moveTimeout = null;
let firstMovementDetected = false;

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

function getTextAreaBounds() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return null;

    const rect = titleElement.getBoundingClientRect();
    return {
        left: rect.left - CONFIG.textAreaPadding,
        right: rect.right + CONFIG.textAreaPadding,
        top: rect.top - CONFIG.textAreaPadding,
        bottom: rect.bottom + CONFIG.textAreaPadding
    };
}

function isInTextArea(x, y) {
    const bounds = getTextAreaBounds();
    if (!bounds) return false;

    return x >= bounds.left && x <= bounds.right &&
           y >= bounds.top && y <= bounds.bottom;
}

function wouldOverlap(x, y, width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const spacing = CONFIG.minSpacing;

    for (const pill of pills) {
        const dx = Math.abs(x - pill.x);
        const dy = Math.abs(y - pill.y);
        const pillHalfWidth = pill.width / 2;
        const pillHalfHeight = pill.height / 2;

        if (dx < halfWidth + pillHalfWidth + spacing && dy < halfHeight + pillHalfHeight + spacing) {
            return true;
        }
    }
    return false;
}

function findValidSpawnPosition(baseX, baseY, width, height, maxAttempts = 30) {
    const radius = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = baseX + Math.cos(angle) * distance;
        const y = baseY + Math.sin(angle) * distance;

        if (!isInTextArea(x, y) && !wouldOverlap(x, y, width, height)) {
            return { x, y };
        }
    }
    return null;
}

function spawnPill(x, y) {
    const pill = document.createElement('div');
    pill.className = 'pill';

    const colorClass = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    pill.classList.add(colorClass);
    const labelText = CONFIG.labels[Math.floor(Math.random() * CONFIG.labels.length)];
    pill.textContent = labelText;

    pill.style.left = `${x}px`;
    pill.style.top = `${y}px`;

    const container = document.querySelector('.pills-container');
    container.appendChild(pill);

    const width = Math.max(60, pill.offsetWidth);
    const height = CONFIG.pillHeight;

    pills.push({
        element: pill,
        x: x,
        y: y,
        width: width,
        height: height
    });
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

let lastSpawnX = null;
let lastSpawnY = null;

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    isMoving = true;

    if (!firstMovementDetected) {
        firstMovementDetected = true;
        lastSpawnX = targetX;
        lastSpawnY = targetY;
        for (let i = 0; i < 10; i++) {
            const validPos = findValidSpawnPosition(targetX, targetY, 80, CONFIG.pillHeight);
            if (validPos) {
                spawnPill(validPos.x, validPos.y);
            }
        }
    } else {
        const dist = distance(lastSpawnX, lastSpawnY, targetX, targetY);
        if (dist >= CONFIG.spawnDistance) {
            const validPos = findValidSpawnPosition(targetX, targetY, 80, CONFIG.pillHeight);
            if (validPos) {
                spawnPill(validPos.x, validPos.y);
                lastSpawnX = targetX;
                lastSpawnY = targetY;
            }
        }
    }

    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
        isMoving = false;
    }, 100);
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    targetX = touch.clientX;
    targetY = touch.clientY;
    isMoving = true;

    if (!firstMovementDetected) {
        firstMovementDetected = true;
        lastSpawnX = targetX;
        lastSpawnY = targetY;
        for (let i = 0; i < 10; i++) {
            const validPos = findValidSpawnPosition(targetX, targetY, 80, CONFIG.pillHeight);
            if (validPos) {
                spawnPill(validPos.x, validPos.y);
            }
        }
    } else {
        const dist = distance(lastSpawnX, lastSpawnY, targetX, targetY);
        if (dist >= CONFIG.spawnDistance) {
            const validPos = findValidSpawnPosition(targetX, targetY, 80, CONFIG.pillHeight);
            if (validPos) {
                spawnPill(validPos.x, validPos.y);
                lastSpawnX = targetX;
                lastSpawnY = targetY;
            }
        }
    }

    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
        isMoving = false;
    }, 100);
});

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function animate() {
    cursorX = lerp(cursorX, targetX, 0.12);
    cursorY = lerp(cursorY, targetY, 0.12);

    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    if (!isMoving) {
        targetX = window.innerWidth / 2;
        targetY = window.innerHeight / 2;
    }
});
