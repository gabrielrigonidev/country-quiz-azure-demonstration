// script.js

let countries = [];
let currentRound = 0;
let score = 0;
let currentQuestion = null;

const TOTAL_ROUNDS = 5;

// Carrega países da API
async function loadCountries() {
    const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,flags"
    );

    countries = await response.json();

    nextQuestion();
}

// Gera pergunta
function generateQuestion() {
    const correct =
        countries[Math.floor(Math.random() * countries.length)];

    let options = [correct.name.common];

    while (options.length < 4) {
        const random =
            countries[Math.floor(Math.random() * countries.length)]
                .name.common;

        if (!options.includes(random)) {
            options.push(random);
        }
    }

    options.sort(() => Math.random() - 0.5);

    return {
        answer: correct.name.common,
        flag: correct.flags.png,
        options: options
    };
}

// Próxima rodada
function nextQuestion() {
    if (currentRound >= TOTAL_ROUNDS) {
        finishGame();
        return;
    }

    currentQuestion = generateQuestion();

    document.getElementById("flag").src =
        currentQuestion.flag;

    document.getElementById("round").innerText =
        `Rodada ${currentRound + 1} de ${TOTAL_ROUNDS}`;

    document.getElementById("score").innerText =
        `Pontuação: ${score}`;

    const optionsDiv =
        document.getElementById("options");

    optionsDiv.innerHTML = "";

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");

        button.innerText = option;

        button.onclick = () => answer(option, button);

        optionsDiv.appendChild(button);
    });
}

// Responder
function answer(option, clickedButton) {
    const buttons =
        document.querySelectorAll("#options button");

    buttons.forEach(button => {
        button.disabled = true;

        if (
            button.innerText === currentQuestion.answer
        ) {
            button.classList.add("correct");
        } else if (button === clickedButton) {
            button.classList.add("wrong");
        }
    });

    if (option === currentQuestion.answer) {
        score++;
    }

    setTimeout(() => {
        currentRound++;
        nextQuestion();
    }, 1200);
}

// Final do jogo
async function finishGame() {
    document.getElementById("quiz")
        .classList.add("hidden");

    document.getElementById("result")
        .classList.remove("hidden");

    document.getElementById("final-score")
        .innerText =
        `Você acertou ${score} de ${TOTAL_ROUNDS}!`;

    const player = prompt("Digite seu nome:");

    if (player) {
        await fetch("/api/SaveScore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: player,
                score: score
            })
        });
    }

    loadRanking();
}

// Carrega ranking
async function loadRanking() {
    const response =
        await fetch("/api/GetRanking");

    const ranking =
        await response.json();

    let html = "<h3>🏆 Ranking</h3>";

    ranking.forEach((item, index) => {
        html += `<p>${index + 1}. ${item.name} - ${item.score}</p>`;
    });

    document.getElementById("ranking").innerHTML = html;
}

// Reiniciar
function restartGame() {
    currentRound = 0;
    score = 0;

    document.getElementById("quiz")
        .classList.remove("hidden");

    document.getElementById("result")
        .classList.add("hidden");

    nextQuestion();
}

// Iniciar jogo
loadCountries();