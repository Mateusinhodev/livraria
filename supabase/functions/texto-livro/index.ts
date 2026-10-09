// Edge Function: busca o texto completo de um livro no Project Gutenberg.
// Existe porque o gutenberg.org não permite CORS: o navegador não pode baixar
// o texto direto, mas um servidor pode.

// 1. Cabeçalhos de CORS: autorizam o navegador a ler a resposta desta função
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Atalho para responder com um erro em JSON (sempre com os cabeçalhos de CORS)
function erro(mensagem, status) {
    return Response.json({ erro: mensagem }, { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
    // 2. "Pré-voo": o navegador pergunta antes se pode chamar a função
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // 3. Validação: aceita só um número inteiro positivo (nada de URLs!)
    let id;
    try {
        const corpo = await req.json();
        id = Number(corpo.id);
    } catch {
        return erro('Envie um JSON no formato { "id": 1234 }.', 400);
    }

    if (!Number.isInteger(id) || id <= 0) {
        return erro('O id do livro deve ser um número inteiro positivo.', 400);
    }

    // 4. Busca no Gutenberg (do servidor, onde não existe CORS) e repassa o texto
    try {
        const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
        const resposta = await fetch(url);

        if (resposta.status === 404) {
            return erro('Livro não encontrado no Project Gutenberg.', 404);
        }
        if (!resposta.ok) {
            return erro('O Project Gutenberg não respondeu. Tente novamente mais tarde.', 502);
        }

        const texto = await resposta.text();

        return new Response(texto, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/plain; charset=utf-8',
                // O texto de um clássico não muda: o navegador pode guardar por 1 dia
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch {
        return erro('Falha ao buscar o livro.', 500);
    }
});