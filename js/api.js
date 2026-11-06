const API_URL = "https://api.enem.dev/v1";

async function buscarDados(endpoint) {
    try {
        const resposta = await fetch(`${API_URL}${endpoint}`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao consultar API:", erro);
        throw erro;
    }
}

async function listarProvas() {
    return buscarDados("/exams");
}

async function buscarProva(ano) {
    return buscarDados(`/exams/${ano}`);
}

async function listarQuestoes(ano, limite = 10, offset = 0) {
    return buscarDados(
        `/exams/${ano}/questions?limit=${limite}&offset=${offset}`
    );
}

async function buscarQuestao(ano, numero) {
    return buscarDados(`/exams/${ano}/questions/${numero}`);
}