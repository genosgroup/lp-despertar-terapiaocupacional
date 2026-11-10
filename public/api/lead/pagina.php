<?php
/**
 * O que muda de uma pagina da Despertar para outra no envio do lead.
 * index.php, ao lado, e igual nas tres.
 *
 * - nome: a nota do card no Kommo. Igual a NOME_DA_PAGINA em src/lib/medicao.ts.
 * - webhook: a automacao do n8n desta pagina. O repositorio e publico, entao o
 *   endereco e visivel; a protecao e a senha em ~/.despertar-lp.php (ver index.php).
 */
return [
    'nome' => 'LP TO',
    'webhook' => 'https://webhook.automacaogenosgroup.com.br/webhook/despertar-lp-to',
];
