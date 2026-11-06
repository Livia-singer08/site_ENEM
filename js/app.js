const seletorAno = document.getElementById("ano");
const botaoBuscar = document.getElementById("carregarQuestoes");
const listaQuestoes = document.getElementById("listaQuestoes");

let respondidas = 0;
let acertos = 0;

async function carregarAnos() {
    try {
        const provas = await listarProvas();

        provas.sort((a, b) => b.year - a.year);

        provas.forEach(prova => {
            const option = document.createElement("option");
            option.value = prova.year;
            option.textContent = prova.title;
            seletorAno.appendChild(option);
        });

    } catch (erro) {
        listaQuestoes.textContent = "Não foi possível carregar as provas.";
    }
}

async function carregarQuestoes() {
    const ano = seletorAno.value;

    if (!ano) {
        alert("Selecione um ano primeiro!");
        return;
    }

    listaQuestoes.innerHTML = "<p>Carregando questões...</p>";

    try {
        const dados = await listarQuestoes(ano, 10, 0);

        listaQuestoes.innerHTML = "";

        dados.questions.forEach(questao => {
            const card = document.createElement("article");
            card.className = "question-card";

            const titulo = document.createElement("h3");
            titulo.textContent = questao.title;

            const disciplina = document.createElement("p");
            disciplina.textContent = questao.discipline || "Disciplina não informada";

            const botao = document.createElement("button");
            botao.textContent = "Resolver questão";

            botao.addEventListener("click", () => {
                resolverQuestao(ano, questao.index);
            });

            card.append(titulo, disciplina, botao);
            listaQuestoes.appendChild(card);
        });

    } catch (erro) {
        listaQuestoes.textContent = "Erro ao carregar questões.";
    }
}

async function resolverQuestao(ano, numero) {
    try {
        const questao = await buscarQuestao(ano, numero);

        listaQuestoes.innerHTML = "";

        const card = document.createElement("article");
        card.className = "question-card";

        const titulo = document.createElement("h2");
        titulo.textContent = questao.title;

        const contexto = document.createElement("p");
        contexto.textContent = questao.context || "Sem texto introdutório.";

        card.append(titulo, contexto);

        if (questao.alternativesIntroduction) {
            const introducao = document.createElement("p");
            introducao.textContent = questao.alternativesIntroduction;
            card.appendChild(introducao);
        }

        questao.files?.forEach(url => {
            const img = document.createElement("img");
            img.src = url;
            img.alt = "Imagem da questão";
            img.className = "question-image";
            card.appendChild(img);
        });

        const alternativas = document.createElement("div");

        questao.alternatives.forEach(alternativa => {
            const botao = document.createElement("button");
            botao.className = "alternative";
            botao.textContent =
                `${alternativa.letter}) ${alternativa.text || "Ver imagem"}`;

            if (alternativa.file) {
                const img = document.createElement("img");
                img.src = alternativa.file;
                img.alt = `Alternativa ${alternativa.letter}`;
                botao.appendChild(img);
            }

            botao.addEventListener("click", () => {
                const botoes = alternativas.querySelectorAll("button");

                botoes.forEach(b => b.disabled = true);

                respondidas++;

                if (alternativa.isCorrect) {
                    acertos++;
                    botao.classList.add("correct");
                } else {
                    botao.classList.add("incorrect");

                    botoes.forEach(b => {
                        if (b.textContent.startsWith(
                            questao.correctAlternative + ")"
                        )) {
                            b.classList.add("correct");
                        }
                    });
                }

                atualizarDesempenho();
            });

            alternativas.appendChild(botao);
        });

        card.appendChild(alternativas);
        listaQuestoes.appendChild(card);

    } catch (erro) {
        listaQuestoes.textContent = "Não foi possível abrir a questão.";
    }
}

function atualizarDesempenho() {
    const porcentagem = respondidas
        ? Math.round((acertos / respondidas) * 100)
        : 0;

    document.getElementById("totalRespondidas").textContent = respondidas;
    document.getElementById("totalAcertos").textContent = acertos;
    document.getElementById("aproveitamento").textContent = porcentagem + "%";

    localStorage.setItem("enemDesempenho", JSON.stringify({
        respondidas,
        acertos
    }));
}

function recuperarDesempenho() {
    const dados = JSON.parse(
        localStorage.getItem("enemDesempenho") || "null"
    );

    if (dados) {
        respondidas = dados.respondidas;
        acertos = dados.acertos;
        atualizarDesempenho();
    }
}

botaoBuscar.addEventListener("click", carregarQuestoes);

recuperarDesempenho();
carregarAnos();