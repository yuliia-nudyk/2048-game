"use strict";
// #region constants
const fieldSize = 4;
const winValue = 2048;
const animationDuration = 150;
// sign and axis used to calculate the CSS transform for each move direction
const directionParams = {
    down: {
        sign: "-",
        axis: "Y"
    },
    up: {
        sign: "+",
        axis: "Y"
    },
    right: {
        sign: "-",
        axis: "X"
    },
    left: {
        sign: "+",
        axis: "X"
    }
};
// #endregion
// #region DOM Elements
const scores = document.querySelector(".game-score");
const bestScores = document.querySelector(".best-score");
const button = document.querySelector(".button");
const cells = document.querySelectorAll(".field-cell");
const startMessage = document.querySelector(".message-start");
const winMessage = document.querySelector(".message-win");
const loseMessage = document.querySelector(".message-lose");
// #endregion
bestScores.textContent = localStorage.getItem("best") || 0;
// #region start/restart Game
button.addEventListener("click", ()=>{
    const shouldStartGame = button.classList.contains("start");
    if (shouldStartGame) startGame();
    else restartGame();
    addCard();
    addCard();
});
function startGame() {
    button.classList.remove("start");
    button.classList.add("restart");
    button.textContent = "Restart";
    startMessage.classList.add("hidden");
}
function restartGame() {
    [
        ...cells
    ].forEach((cell)=>{
        if (isCellFilled(cell)) cell.children[0].remove();
    });
    winMessage.classList.add("hidden");
    loseMessage.classList.add("hidden");
    scores.textContent = 0;
}
// #endregion
// #region keyboard controls
document.addEventListener("keydown", (e)=>{
    let hasMoved = false;
    switch(e.key){
        case "ArrowDown":
            hasMoved = goDown();
            break;
        case "ArrowUp":
            hasMoved = goUp();
            break;
        case "ArrowRight":
            hasMoved = goRight();
            break;
        case "ArrowLeft":
            hasMoved = goLeft();
            break;
    }
    if (hasMoved) setTimeout(()=>{
        addCard();
    }, animationDuration);
});
// #endregion
// #region move directions
function goDown() {
    const merged = downMerge();
    const shifted = downShift();
    return merged || shifted;
}
function goUp() {
    const merged = upMerge();
    const shifted = upShift();
    return merged || shifted;
}
function goRight() {
    const merged = rightMerge();
    const shifted = rightShift();
    return merged || shifted;
}
function goLeft() {
    const merged = leftMerge();
    const shifted = leftShift();
    return merged || shifted;
}
// #endregion
// #region merging cards by direction
function downMerge() {
    let hasMove = false;
    for(let i = cells.length - 1; i >= fieldSize; i--)if (isCellFilled(cells[i])) {
        const sumCard = cells[i].children[0];
        const current = sumCard.textContent;
        for(let j = i - fieldSize; j >= 0; j -= fieldSize)if (isCellFilled(cells[j])) {
            const addedCard = cells[j].children[0];
            if (addedCard.textContent === current) {
                const steps = (i - j) / fieldSize;
                merge(sumCard, addedCard, current, steps, "down");
                hasMove = true;
            }
            break;
        }
    }
    return hasMove;
}
function upMerge() {
    let hasMove = false;
    for(let i = 0; i < cells.length - fieldSize; i++)if (isCellFilled(cells[i])) {
        const sumCard = cells[i].children[0];
        const current = sumCard.textContent;
        for(let j = i + fieldSize; j < cells.length; j += fieldSize)if (isCellFilled(cells[j])) {
            const addedCard = cells[j].children[0];
            if (addedCard.textContent === current) {
                const steps = (j - i) / fieldSize;
                merge(sumCard, addedCard, current, steps, "up");
                hasMove = true;
            }
            break;
        }
    }
    return hasMove;
}
function rightMerge() {
    let hasMove = false;
    for(let i = cells.length - 1; i >= 0; i--)if (isCellFilled(cells[i])) {
        const rowStart = Math.floor(i / fieldSize) * fieldSize;
        const sumCard = cells[i].children[0];
        const current = sumCard.textContent;
        for(let j = i - 1; j >= rowStart; j--)if (isCellFilled(cells[j])) {
            const addedCard = cells[j].children[0];
            if (addedCard.textContent === current) {
                const steps = i - j;
                merge(sumCard, addedCard, current, steps, "right");
                hasMove = true;
            }
            break;
        }
    }
    return hasMove;
}
function leftMerge() {
    let hasMove = false;
    for(let i = 0; i < cells.length; i++)if (isCellFilled(cells[i])) {
        const rowStart = Math.floor(i / fieldSize) * fieldSize;
        const rowEnd = rowStart + fieldSize;
        const sumCard = cells[i].children[0];
        const current = sumCard.textContent;
        for(let j = i + 1; j < rowEnd; j++)if (isCellFilled(cells[j])) {
            const addedCard = cells[j].children[0];
            if (addedCard.textContent === current) {
                const steps = j - i;
                merge(sumCard, addedCard, current, steps, "left");
                hasMove = true;
            }
            break;
        }
    }
    return hasMove;
}
// #endregion
// #region shifting cards by direction
function downShift() {
    let hasMove = false;
    for(let i = cells.length - fieldSize - 1; i >= 0; i--)if (isCellFilled(cells[i])) {
        let newIndex;
        for(let j = i + fieldSize; j < cells.length; j += fieldSize){
            if (!isCellFilled(cells[j])) newIndex = j;
            else break;
        }
        if (newIndex >= 0) {
            const steps = (newIndex - i) / fieldSize;
            const currentCard = cells[i].children[0];
            shift(currentCard, newIndex, steps, "down");
            hasMove = true;
        }
    }
    return hasMove;
}
function upShift() {
    let hasMove = false;
    for(let i = fieldSize; i < cells.length; i++)if (isCellFilled(cells[i])) {
        let newIndex;
        for(let j = i - fieldSize; j >= 0; j -= fieldSize){
            if (!isCellFilled(cells[j])) newIndex = j;
            else break;
        }
        if (newIndex >= 0) {
            const steps = (i - newIndex) / fieldSize;
            const currentCard = cells[i].children[0];
            shift(currentCard, newIndex, steps, "up");
            hasMove = true;
        }
    }
    return hasMove;
}
function rightShift() {
    let hasMove = false;
    for(let i = cells.length - 1; i >= 0; i--)if (isCellFilled(cells[i])) {
        const rowStart = Math.floor(i / fieldSize) * fieldSize;
        const rowEnd = rowStart + fieldSize;
        let newIndex;
        for(let j = i + 1; j < rowEnd; j++){
            if (!isCellFilled(cells[j])) newIndex = j;
            else break;
        }
        if (newIndex >= 0) {
            const steps = newIndex - i;
            const currentCard = cells[i].children[0];
            shift(currentCard, newIndex, steps, "right");
            hasMove = true;
        }
    }
    return hasMove;
}
function leftShift() {
    let hasMove = false;
    for(let i = 0; i < cells.length; i++)if (isCellFilled(cells[i])) {
        const rowStart = Math.floor(i / fieldSize) * fieldSize;
        let newIndex;
        for(let j = i - 1; j >= rowStart; j--){
            if (!isCellFilled(cells[j])) newIndex = j;
            else break;
        }
        if (newIndex >= 0) {
            const steps = i - newIndex;
            const currentCard = cells[i].children[0];
            shift(currentCard, newIndex, steps, "left");
            hasMove = true;
        }
    }
    return hasMove;
}
// #endregion
// #region shifting, merging cards and updating scores
function shift(currentCard, newIndex, steps, direction) {
    const { sign, axis } = directionParams[direction];
    currentCard.remove();
    cells[newIndex].append(currentCard);
    currentCard.style.transform = `
    translate${axis}(calc(${sign}${steps} * (100% + 10px)))
  `;
    setTimeout(()=>{
        currentCard.style.transform = `translate${axis}(0)`;
    }, 0);
}
function merge(sumCard, addedCard, current, steps, direction) {
    const newValue = current * 2;
    addedCard.remove();
    animateMerging(sumCard, current, steps, direction);
    setTimeout(()=>{
        updateSumCard(sumCard, current, newValue);
    }, animationDuration);
    updateScores(newValue);
}
function updateSumCard(sumCard, currentValue, newValue) {
    sumCard.classList.remove(`field-cell__card--${currentValue}`);
    sumCard.classList.add(`field-cell__card--${newValue}`);
    sumCard.textContent = newValue;
}
function animateMerging(sumCard, currentValue, steps, direction) {
    const { sign, axis } = directionParams[direction];
    const movedCard = document.createElement("div");
    movedCard.classList.add("field-cell__moved-card");
    movedCard.classList.add(`field-cell__moved-card--${currentValue}`);
    movedCard.textContent = currentValue;
    sumCard.append(movedCard);
    movedCard.style.transform = `
    translate${axis}(calc(${sign}${steps} * (100% + 10px)))
  `;
    setTimeout(()=>{
        movedCard.style.transform = `translate${axis}(0)`;
    }, 0);
    setTimeout(()=>{
        movedCard.remove();
        sumCard.style.transform = "scale(1.1)";
        setTimeout(()=>{
            sumCard.style.transform = "scale(1.0)";
        }, animationDuration);
    }, animationDuration);
}
function updateScores(addedValue) {
    scores.textContent = +scores.textContent + addedValue;
    if (+scores.textContent > +bestScores.textContent) {
        localStorage.setItem("best", scores.textContent);
        bestScores.textContent = localStorage.getItem("best");
    }
    if (addedValue === winValue) winMessage.classList.remove("hidden");
}
// #endregion
// #region adding a new card and checking for lose
function addCard() {
    const cell = getRandomEmptyCell();
    const card = createCard();
    cell.append(card);
    card.style.transform = "scale(0.5)";
    setTimeout(()=>{
        card.style.transform = "scale(1.0)";
    }, 75);
    checkForLose();
}
function getRandomEmptyCell() {
    const emptyCells = [
        ...cells
    ].filter((cell)=>!isCellFilled(cell));
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
}
function createCard() {
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    const value = randomNumber === 4 ? 4 : 2;
    const newCard = document.createElement("div");
    newCard.classList.add("field-cell__card", `field-cell__card--${value}`);
    newCard.textContent = value;
    return newCard;
}
function checkForLose() {
    if ([
        ...cells
    ].some((cell)=>!isCellFilled(cell))) return;
    let hasAvailableMove = false;
    // check every cell for a same-value neighbor to the right or below —
    // if one exists, a merge is still possible and the game isn't lost
    for(let i = 0; i < cells.length; i++){
        const rowStart = Math.floor(i / fieldSize) * fieldSize;
        const rowEnd = rowStart + fieldSize;
        const current = cells[i].children[0].textContent;
        if (i + 1 < rowEnd) {
            if (cells[i + 1].children[0].textContent === current) {
                hasAvailableMove = true;
                break;
            }
        }
        if (i + fieldSize < cells.length) {
            if (cells[i + fieldSize].children[0].textContent === current) {
                hasAvailableMove = true;
                break;
            }
        }
    }
    if (!hasAvailableMove) {
        winMessage.classList.add("hidden");
        loseMessage.classList.remove("hidden");
    }
}
// #endregion
function isCellFilled(cell) {
    return cell.children.length === 1;
}

//# sourceMappingURL=index.f75de5e1.js.map
