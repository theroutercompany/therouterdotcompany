const CONFIG = {
    labels: ['everything', 'r3x.sh', 'who is AI?'],
    colors: ['cyan', 'yellow', 'magenta'],
    spawnDistance: 20,
    cellWidth: 84,
    cellHeight: 26,
    cellPadding: 2,
    textAreaPadding: 100,
    canvasPaddingHorizontal: 30,
    canvasPaddingVertical: 30
};

let grid = {};
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;
let isMoving = false;
let moveTimeout = null;
let firstMovementDetected = false;
let gridCols = 0;
let gridRows = 0;
let gridOffsetX = 0;
let gridOffsetY = 0;

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

function initGrid() {
    const usableWidth = window.innerWidth - CONFIG.canvasPaddingHorizontal * 2;
    const usableHeight = window.innerHeight - CONFIG.canvasPaddingVertical * 2;

    const cellTotalWidth = CONFIG.cellWidth + CONFIG.cellPadding;
    const cellTotalHeight = CONFIG.cellHeight + CONFIG.cellPadding;

    gridCols = Math.floor(usableWidth / cellTotalWidth);
    gridRows = Math.floor(usableHeight / cellTotalHeight);

    gridOffsetX = CONFIG.canvasPaddingHorizontal + (usableWidth - gridCols * cellTotalWidth) / 2;
    gridOffsetY = CONFIG.canvasPaddingVertical + (usableHeight - gridRows * cellTotalHeight) / 2;

    grid = {};
}

function getCellCenter(col, row) {
    const cellTotalWidth = CONFIG.cellWidth + CONFIG.cellPadding;
    const cellTotalHeight = CONFIG.cellHeight + CONFIG.cellPadding;
    return {
        x: gridOffsetX + col * cellTotalWidth + cellTotalWidth / 2,
        y: gridOffsetY + row * cellTotalHeight + cellTotalHeight / 2
    };
}

function getCellFromPosition(x, y) {
    const cellTotalWidth = CONFIG.cellWidth + CONFIG.cellPadding;
    const cellTotalHeight = CONFIG.cellHeight + CONFIG.cellPadding;
    const col = Math.floor((x - gridOffsetX) / cellTotalWidth);
    const row = Math.floor((y - gridOffsetY) / cellTotalHeight);
    return { col, row };
}

function isCellValid(col, row) {
    return col >= 0 && col < gridCols && row >= 0 && row < gridRows;
}

function isCellOccupied(col, row) {
    return grid[`${col},${row}`] === true;
}

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

function isCellInTextArea(col, row) {
    const bounds = getTextAreaBounds();
    if (!bounds) return false;

    const center = getCellCenter(col, row);
    return center.x >= bounds.left && center.x <= bounds.right &&
           center.y >= bounds.top && center.y <= bounds.bottom;
}

function findValidCell(baseX, baseY) {
    const baseCell = getCellFromPosition(baseX, baseY);

    for (let radius = 0; radius <= 3; radius++) {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;

                const col = baseCell.col + dc;
                const row = baseCell.row + dr;

                if (isCellValid(col, row) && !isCellOccupied(col, row) && !isCellInTextArea(col, row)) {
                    return { col, row };
                }
            }
        }
    }

    return null;
}

function spawnPill(col, row) {
    const center = getCellCenter(col, row);

    const pill = document.createElement('div');
    pill.className = 'pill';

    const colorClass = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    pill.classList.add(colorClass);
    pill.textContent = CONFIG.labels[Math.floor(Math.random() * CONFIG.labels.length)];

    pill.style.left = `${center.x}px`;
    pill.style.top = `${center.y}px`;

    const container = document.querySelector('.pills-container');
    container.appendChild(pill);

    grid[`${col},${row}`] = true;
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
        initGrid();
        lastSpawnX = targetX;
        lastSpawnY = targetY;
        for (let i = 0; i < 3; i++) {
            const cell = findValidCell(targetX, targetY);
            if (cell) {
                spawnPill(cell.col, cell.row);
            }
        }
    } else {
        const dist = distance(lastSpawnX, lastSpawnY, targetX, targetY);
        if (dist >= CONFIG.spawnDistance) {
            const cell = findValidCell(targetX, targetY);
            if (cell) {
                spawnPill(cell.col, cell.row);
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
        initGrid();
        lastSpawnX = targetX;
        lastSpawnY = targetY;
        for (let i = 0; i < 3; i++) {
            const cell = findValidCell(targetX, targetY);
            if (cell) {
                spawnPill(cell.col, cell.row);
            }
        }
    } else {
        const dist = distance(lastSpawnX, lastSpawnY, targetX, targetY);
        if (dist >= CONFIG.spawnDistance) {
            const cell = findValidCell(targetX, targetY);
            if (cell) {
                spawnPill(cell.col, cell.row);
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
