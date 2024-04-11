let map = document.getElementById("map");
let text = document.getElementById("text");
let counter = document.getElementById("counter");
let pictureElement = document.querySelector(".picture");

let stepCounter = document.getElementById("step-counter");
let catCounter = document.getElementById("cat-counter");
let zombieCounter = document.getElementById("zombie-counter");


let playerX = getRandomNumber(0, 5);
let playerY = getRandomNumber(0, 5);
let playerPosition = { x: playerX, y: playerY };

let catAmount = getRandomNumber(1, 4);
let catPositions = [];
let catEncounterCount = 0;

let zombieAmount = 2;
let zombiePositions = [];
let zombieEncounterCount = 0;

let win = 0;
let lose = 0;

function generteUniqeCatPositions(count) {
    let positions = [];
    for (let i = 0; i < count; i++){
        let catX, catY;
        do{
            catX = getRandomNumber(0, 5);
            catY = getRandomNumber(0, 5);
        } while ((catX === playerX && catY == playerY || positions.some(pos => pos.x === catX && pos.y === catY)));
        positions.push({ x: catX, y: catY});
    }
    return positions;
}

function generateUniqueZombiePositions(count) {
    let positions = [];
    for (let i = 0; i < count; i++) {
        let zombieX, zombieY;
        do {
            zombieX = getRandomNumber(0, 5);
            zombieY = getRandomNumber(0, 5);
        } while ((zombieX === playerX && zombieY === playerY) || positions.some(pos => pos.x === zombieX && pos.y === zombieY));
        positions.push({ x: zombieX, y: zombieY });
    }
    return positions;
}

catPositions = generteUniqeCatPositions(catAmount);
zombiePositions = generateUniqueZombiePositions(zombieAmount); 

let steps = 0;

drawMap(playerPosition.x, playerPosition.y, catPositions ,zombiePositions);
updateCounter();

function drawMap(playerX, playerY, catPositions, zombiePositions) {
    map.innerHTML = "";

    let table = document.createElement("table");
    table.setAttribute("border", "1");
    table.style.width = "95%";
    table.style.height = "95%";

    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 6; j++) {
            let cell = document.createElement("td");
            if (playerX === i && playerY === j) {
                cell.textContent = "X"; 
            } else {
                cell.textContent = "0";
            }
            cell.style.color = "white";
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    map.appendChild(table);
    updatePicture(playerX, playerY, catPositions, zombiePositions);
}





function resetGame(movementArrows) {
    playerPosition.x = getRandomNumber(0, 5);
    playerPosition.y = getRandomNumber(0, 5);

    catAmount = getRandomNumber(1, 4);
    catPositions = generteUniqeCatPositions(catAmount);
    zombiePositions = generateUniqueZombiePositions(zombieAmount);

    steps = 0;

    for (let i = 0; i < movementArrows.length; i++) {
        movementArrows[i].style.backgroundColor = "";
    }

    drawMap(playerPosition.x, playerPosition.y, catPositions, zombiePositions);

    updateArrows(playerPosition, catPositions, zombiePositions, movementArrows);

    updateCounter();
}


function updateCounter() {
    stepCounter.textContent = "Step: " + steps;
    catCounter.textContent = "Cat Remaining: " + catAmount;
    zombieCounter.textContent = "W/L: " + win + "/" + lose;
}

async function movePlayer(direction) {
    switch (direction) {
        case 'up':
            if (playerPosition.x > 0) playerPosition.x--, steps++;
            break;
        case 'down':
            if (playerPosition.x < 5) playerPosition.x++, steps++;
            break;
        case 'left':
            if (playerPosition.y > 0) playerPosition.y--, steps++;
            break;
        case 'right':
            if (playerPosition.y < 5) playerPosition.y++, steps++;
            break;
    }
    
    let movementArrows = document.getElementsByClassName("movementarrow");

    updateArrows(playerPosition, catPositions, zombiePositions, movementArrows);
    updateZombiePositions();

    let chuckNorris;

    drawMap(playerPosition.x, playerPosition.y, catPositions, zombiePositions); 

    if (catPositions.some(cat => cat.x === playerPosition.x && cat.y === playerPosition.y) && catAmount > 0) {
        catPositions = catPositions.filter(cat => !(cat.x === playerPosition.x && cat.y === playerPosition.y));
        catAmount--;
        if(catAmount === 0){
            chuckNorris = await norrisApi('cat');
        catEncounterCount++;
        setTimeout(() => {
            alert("Congratulations! You won by finding all the cats! Your reward is a Chuck-Norris-Cat-Joke!!!: " + chuckNorris);
            win++;
            resetGame(movementArrows);
        }, 250);
        }
    } else if (zombiePositions.some(zombie => zombie.x === playerPosition.x && zombie.y === playerPosition.y)) {
        chuckNorris = await norrisApi('zombie');
        zombieEncounterCount++;
        setTimeout(() => {
            alert("Game over! You encountered a zombie! " + chuckNorris);
            lose++;
            resetGame(movementArrows);
        }, 250); 
    } 
    updateCounter();
}


function updateArrows(playerPosition, catPositions, zombiePositions, movementArrows) {
    let upArrow = document.getElementById("up");
    let downArrow = document.getElementById("down");
    let leftArrow = document.getElementById("left");
    let rightArrow = document.getElementById("right");

    let nearestCatDistance = Number.MAX_SAFE_INTEGER;
    let nearestCat = null;

    for (let cat of catPositions) {
        let dxCat = Math.abs(playerPosition.x - cat.x);
        let dyCat = Math.abs(playerPosition.y - cat.y);
        let distanceCat = dxCat + dyCat;
        if (distanceCat < nearestCatDistance) {
            nearestCatDistance = distanceCat;
            nearestCat = cat;
        }
    }

    for (let i = 0; i < movementArrows.length; i++) {
        movementArrows[i].style.backgroundColor = "";
    }

    let shadeCat = Math.min(255, 255 - nearestCatDistance * 30);
    if (nearestCatDistance <= 2) {
        if (playerPosition.y < nearestCat.y) {
            rightArrow.style.backgroundColor = `rgb(0, 0, ${shadeCat})`;
        } else if (playerPosition.y > nearestCat.y) {
            leftArrow.style.backgroundColor = `rgb(0, 0, ${shadeCat})`;
        }
        if (playerPosition.x < nearestCat.x) {
            downArrow.style.backgroundColor = `rgb(0, 0, ${shadeCat})`;
        } else if (playerPosition.x > nearestCat.x) {
            upArrow.style.backgroundColor = `rgb(0, 0, ${shadeCat})`;
        }
    }

    for (let zombie of zombiePositions) {
        let dxZombie = Math.abs(playerPosition.x - zombie.x);
        let dyZombie = Math.abs(playerPosition.y - zombie.y);
        let distanceZombie = dxZombie + dyZombie;
        let shadeZombie = Math.min(255, 255 - distanceZombie * 30);
        if (distanceZombie <= 2) {
            if (playerPosition.y < zombie.y) {
                rightArrow.style.backgroundColor = `rgb(${shadeZombie}, 0, 0)`;
            } else if (playerPosition.y > zombie.y) {
                leftArrow.style.backgroundColor = `rgb(${shadeZombie}, 0, 0)`;
            }
            if (playerPosition.x < zombie.x) {
                downArrow.style.backgroundColor = `rgb(${shadeZombie}, 0, 0)`;
            } else if (playerPosition.x > zombie.x) {
                upArrow.style.backgroundColor = `rgb(${shadeZombie}, 0, 0)`;
            }
        }
    }

    if (nearestCatDistance > 2 && !zombiePositions.some(zombie => Math.abs(playerPosition.x - zombie.x) + Math.abs(playerPosition.y - zombie.y) <= 2)) {
        for (let i = 0; i < movementArrows.length; i++) {
            movementArrows[i].style.backgroundColor = `rgb(102, 34, 0)`;
        }
    }
}




function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveZombies() {
    for (let i = 0; i < zombiePositions.length; i++) {
        let zombie = zombiePositions[i];
        let dx = playerPosition.x - zombie.x;
        let dy = playerPosition.y - zombie.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            zombie.x += dx > 0 ? 1 : -1;
        } else {
            zombie.y += dy > 0 ? 1 : -1;
        }
    }
}

function updateZombiePositions() {
    if (steps % 2 === 0) {
        moveZombies();
    }
}

function updatePicture(playerX, playerY, catPositions, zombiePositions) {
    let pictures = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = 0; j <= 6; j++) {
            let woodIdentifier = i * 6 + j + 1; // Unique identifier for each place
            if (catPositions.some(cat => cat.x === i && cat.y === j)) {
                pictures.push("cat");
            } 
            else if (zombiePositions.some(zombie => zombie.x === i && zombie.y === j)) {
                pictures.push("zombie");
            }
            else {
                pictures.push(`wood${woodIdentifier}`);
            }
        }
    }

    let currentPlayerPicture = { x: playerX, y: playerY };
    let pictureIndex = currentPlayerPicture.x * 7 + currentPlayerPicture.y;
    pictureIndex = Math.min(Math.max(pictureIndex, 0), pictures.length - 1);
    let picture = pictures[pictureIndex];
    let pictureElement = document.querySelector(".picture");

    // Get the base URL of the current script
    const scriptUrl = document.currentScript.src;
    const scriptPath = scriptUrl.substring(0, scriptUrl.lastIndexOf("/") + 1);
    const imagePath = scriptPath + `../images/${picture}.jpg`;

    // Set the src attribute of the pictureElement
    pictureElement.src = imagePath;
}
function norrisApi(query) {
    const apiUrl = `https://api.chucknorris.io/jokes/search?query=${query}`;

    return fetch(apiUrl)
        .then((response) => response.json())
        .then(function(data){
            const jokes = data.result;
            if (jokes.length > 0) {
                const randomIndex = Math.floor(Math.random() * jokes.length);
                const randomJoke = jokes[randomIndex];
                const selectedJoke = randomJoke.value;
                console.log(selectedJoke)
                return selectedJoke;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function displayJoke() {
    let jokeText = document.getElementById("text");
    norrisApi("forest").then(joke => {
        if (joke) {
            jokeText.textContent = joke;
        } else {
            jokeText.textContent = "No joke found.";
        }
    });
}