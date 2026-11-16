# DeFiMind · Landing Page

Página de entrada da DeFiMind: a camada de segurança entre um agente de IA e a carteira
dele, nativa de x402 e a lançar primeiro na Solana. HTML, CSS e JavaScript puros, sem
build e sem dependências. Abre-se num browser e está a funcionar.

**Estado: pré-lançamento.** Nada na página diz que o produto está no ar, auditado ou a
correr em mainnet, porque não está. A Solana aparece como *Launching first* e as outras
cadeias como *In development* / *Planned*, o rodapé e o formulário dizem-no por extenso, e
a primeira pergunta das FAQ é "Is it live yet?" com a resposta "No." Se isso mudar,
muda-se nesses sítios — não antes.

## Estrutura

```
index.html               A página inteira
assets/css/styles.css    Estilos e tokens de design
assets/js/config.js      URL e chave publishable do Supabase
assets/js/main.js        Navegação, animações, fundo, calculadora, códigos, FAQ, formulário
assets/img/              Logótipo (marca, lettering e versão completa)
supabase/migrations/     SQL da tabela da lista de espera
vercel.json              Cabeçalhos de segurança e cache
```

## Ver localmente

```bash
python -m http.server 4173
```

Depois abre `http://localhost:4173`.

## Publicar

O repositório está ligado à Vercel: cada push para `main` publica em
[defimind.tech](https://defimind.tech). Não é preciso correr nada à mão.

## Idioma

A página está **só em inglês**. O público são programadores que integram agentes, e esse
mercado lê inglês. O ficheiro `i18n.js` da versão anterior foi removido: os 268 textos que
tinha descreviam o produto antigo e nenhum servia.

Se um dia fizer sentido voltar a ter idiomas, o padrão anterior está no histórico do git
(`git show 8ec9910:assets/js/i18n.js`).

## Cores

A paleta sai do próprio logótipo, amostrada pixel a pixel do `logo-mark.png`: o azul do
"d", o ciano do traço e o azul-noite do fundo.

| Papel | Valor |
| --- | --- |
| Fundo | `#030509` |
| Vidro (painéis) | `rgba(13,18,30,.62)` |
| Vidro secundário | `rgba(18,24,40,.5)` |
| Linhas | `rgba(255,255,255,.09)` |
| Texto principal | `#f3f5fa` |
| Texto secundário | `#9aa3b6` |
| Texto terciário | `#626c82` |
| **Azul da marca** | `#2b8af8` |
| Azul claro | `#79b6ff` |
| Azul escuro | `#1763c9` |
| Ciano | `#1ad7ea` |
| Aviso | `#e8b45c` |
| Recusa | `#e8756b` |

Está tudo em tokens no topo de `styles.css`. O degradê dos números, dos destaques e do
botão principal é `--grad`, que vai do azul da marca ao ciano.

As cores do fundo animado estão em `main.js`, no array `strands`, em RGB sem `#` porque
são interpoladas com transparência variável.

**Contraste do botão principal:** texto `#02142b` sobre o degradê dá cerca de 5,4:1 na
ponta azul e 10,5:1 na ponta ciano. Passa o mínimo das normas (4,5:1). Não pôr texto
branco em cima — era isso que falhava na versão anterior do site.

## Desenho

Superfícies translúcidas sobre um fundo vivo. As regras são três:

- **O fundo anima-se atrás da página inteira.** O canvas está em `position:fixed` com
  `z-index:-2`, por baixo de tudo, e por cima dele há um `.bg__scrim` — dois gradientes
  sobrepostos que escurecem o suficiente para o texto se ler, deixando o topo do ecrã
  claro para as fitas aparecerem.
- **Os painéis são `.glass`**: fundo translúcido, borda de 1px a 9% de branco, sombra
  grande e um risco de luz no topo (`::before`). Nenhum deles usa `backdrop-filter`,
  de propósito: desfocar por cima de um canvas que se mexe obriga o browser a recompor
  cada painel a cada frame. Só a barra de navegação, o cartão de pedidos e o telemóvel
  é que desfocam, porque são três elementos e não vinte.
- **Cabeçalhos ao centro**, com uma `.chip` em monoespaçado por cima do título.

## Fundo animado

Um canvas com cinco fitas que ondulam devagar, desenhadas em `lighter` (aditivo) para os
cruzamentos acenderem. Cada fita é traçada quatro vezes, de larga e fraca a estreita e
brilhante, o que dá o halo sem precisar de blur.

Está **fixo por trás da página toda**, não só do hero, e por isso corre o tempo todo. Três
travões para isso não pesar:

- **30fps**, travados por tempo dentro do `requestAnimationFrame`. A animação é lenta o
  bastante para ninguém notar a diferença e é metade do trabalho.
- **`devicePixelRatio` travado em 1,5**, para não pintar quatro vezes mais pixels do que
  é preciso num ecrã retina.
- **Pára quando o separador fica escondido** e nunca arranca com `prefers-reduced-motion`
  ligado — nesse caso o CSS substitui-o por um gradiente estático.

O canvas tem o tamanho da janela, não o do documento, por isso o custo não cresce com o
comprimento da página.

## x402

O x402 tem secção própria (`#x402`), logo a seguir aos números, mais um atalho na
navegação e um chip no hero. A secção tem duas colunas:

- **três passos** — `402` (a API diz o preço), `DFM` (a DeFiMind decide), `200` (pago, e
  os dados voltam);
- **um bloco `.wire`** que imita a conversa HTTP real, em monoespaçado colorido. O
  conteúdo está escrito à mão no HTML com `white-space:pre`, sem JavaScript nenhum.

A Solana aparece como a primeira cadeia (`Launching first` na tabela), no chip do hero,
na roadmap e numa pergunta das FAQ ("Why Solana first?"). Continua tudo em estado de
pré-lançamento: "launching" não é "live".

## Interruptor de estados das funcionalidades

No topo do `main.js` vive um objecto, e **só ele** decide o que a página diz estar
disponível:

    // Set a feature to 'live' only on the day it ships.
    var FEATURES = {
      s1: 'soon', s2: 'soon', ... s10: 'soon',   // as dez funcionalidades
      p1: 'soon', ... p5: 'soon'                 // as cinco fases da roadmap
    };

Cada slot e cada fase traz `data-feature="<chave>"`. No arranque, o script percorre-os e
põe `data-status="soon"` ou `"live"`, trocando o crachá entre **Coming soon** (cinzento) e
**Live** (ciano), e actualizando o contador "0 de dez".

Ligar uma funcionalidade é mudar **uma palavra** neste objecto. Nada mais.

**A falha segura está do lado certo:** o HTML é servido com "Coming soon" e o JavaScript
só promove para "Live". Se o script falhar, a página pode prometer a menos, nunca a mais.

### Porque é que as chaves não têm nome

**Este repositório é público.** Uma chave com o nome da funcionalidade anunciava a roadmap
tão alto como o texto anunciava — qualquer pessoa lê o `main.js` servido ao browser. Por isso os slots são `s1`–`s10` e as fases `p1`–`p5`, e **a página não contém o
título nem a descrição de nenhuma funcionalidade por lançar**.

As barras tapadas da secção são desenhadas em CSS, não são texto escondido: não há nada
para ler no código-fonte da página.

No dia em que uma funcionalidade sair, escreves nessa altura o título e o texto do cartão,
e mudas a chave para `'live'`. Até lá, o que existe é o número: dez.

### Mapa dos slots

Não está aqui, de propósito. Guarda-o fora do repositório.

## Secções

| Secção | id | O que é |
| --- | --- | --- |
| Hero | `#top` | "The firewall for the agent economy." |
| Números | — | 3 · 530 · 24 · 20 · 0, do código do produto |
| Built on | — | x402, MCP, Squads v4, Safe, USDC, USDG, Telegram |
| x402 | `#x402` | 402 → decisão → 200, com a conversa HTTP |
| Problema | — | o trade-off de dar a chave ao agente |
| Como funciona | `#how` | os quatro passos |
| Garantia | `#security` | as quatro camadas + calculadora |
| Aprovações | `#approvals` | o telemóvel com o Telegram |
| Códigos de recusa | `#codes` | 20 códigos, três famílias |
| Developers | `#developers` | as quatro ferramentas MCP |
| Chains | `#chains` | Solana, Robinhood Chain, Base |
| **What's coming** | `#coming` | dez slots tapados e um contador |
| **Roadmap** | `#roadmap` | Now + 5 fases, só com os títulos |
| FAQ | `#faq` | nove perguntas |

## O que ficou de fora, de propósito

O brief que originou esta versão pedia mais coisas. Nenhuma entrou, e convém que fique
escrito porquê:

- **Secção do token, benefícios para detentores, buyback/burn e endereço do contrato.**
  Fora por instrução directa do dono, repetida três vezes.
- **Links para o GitHub.** O brief mandava manter o URL do repositório do produto. Esse
  nome não pode aparecer em lado nenhum, e um link público punha-o no HTML, no `href` e no
  Google. Não há botão de GitHub.
- **Página de whitepaper.** Não existe neste repositório. Um botão dava 404.
- **O detalhe das funcionalidades por lançar.** O brief trazia dez cartões com o texto
  todo escrito, e a roadmap com cada item nomeado. Saiu por instrução do dono: a página
  diz que são dez e não diz quais.

E uma afirmação foi corrigida em vez de copiada: o brief punha no hero
*"Public beta · Live on Robinhood Chain and Solana"* e no rodapé *"DefiMind is in public
beta"*. O produto não está no ar. O pill diz **Coming soon** e o rodapé diz **pre-launch**.

## Calculadora "Your worst day"

Três cursores — limite diário, saldo da carteira quente, valor no cofre — e uma conta:

```
perda máxima em 24h = limite diário + saldo da carteira quente
```

Não é uma estimativa. É o tecto que a cadeia impõe, e por isso vale mesmo que o serviço
seja totalmente comprometido. A percentagem por baixo mostra o que isso representa do
cofre; se a perda igualar ou passar o cofre, a mensagem muda e sugere baixar o limite.

## Códigos de recusa

Os vinte códigos estão em `main.js`, no objecto `DATA`, divididos em `shared` (12),
`solana` (4) e `evm` (4). Os separadores trocam a lista sem recarregar nada.

**A confirmar:** os nomes dos códigos foram escritos aqui a partir da descrição do
comportamento, não lidos do repositório do produto. Antes de o site ir a público vale a
pena compará-los com o enum real e corrigir os que não baterem certo. O número total (20)
vem do produto e está também no bloco de números do topo.

## Números do topo

| Número | O que é |
| --- | --- |
| 3 | cadeias suportadas no código |
| 530 | testes automáticos |
| 24 | cenários de ataque bloqueados em teste |
| 20 | códigos de recusa |
| 0 | contratos novos para o utilizador confiar |

Vêm do código do produto, não de produção. A legenda por baixo diz exactamente isso:
*"Figures from the codebase. Not yet deployed publicly."* Se os números mudarem, mudam-se
no `index.html` e aqui.

## Lista de espera (Supabase)

> **Neste momento o formulário não está na página.** A secção final — "Give your agent
> spending power, not your keys" com a caixa de email — foi removida a pedido. A página
> acaba na FAQ e passa directo ao rodapé, e **não há forma de recolher emails**.
>
> O que ficou: o `main.js` ainda traz o bloco do formulário (não faz nada, porque não
> encontra o `#wlForm`), o `config.js`, o CSS `.cta`/`.wl` e a migração SQL. Repor é colar
> a secção de volta no `index.html` — está em `git show HEAD:index.html`. Nada na base de
> dados foi tocado.
>
> Os dois botões "Get early access" (barra e hero) também saíram, porque não tinham para
> onde apontar. O hero ficou com "What is x402?" e "See how it works".

O resto desta secção descreve como o formulário funciona, para quando voltar.

O formulário grava em Supabase. É preciso **um passo manual** antes de funcionar: criar a
tabela. Abre o *SQL Editor* do projecto, cola o conteúdo de
`supabase/migrations/0001_waitlist.sql` e executa.

### Porque é que a chave está à vista

`assets/js/config.js` tem a chave *publishable* em texto simples. É suposto. Essa chave
viaja no JavaScript e qualquer visitante a consegue ler, em qualquer site que use Supabase
no browser. Não é um descuido nem se resolve escondendo-a.

Quem faz a segurança é a base de dados. A migração liga *row level security* e cria uma
única política: **inserir sim, ler não**. Não existe política de `select`, `update` ou
`delete`, portanto mesmo com a chave na mão ninguém descarrega a lista de emails a partir
do browser. Para ler é preciso a chave `service_role`, que nunca pode sair do servidor e
nunca deve entrar neste repositório.

A validação do email também está do lado do servidor, numa restrição `check`. A validação
do browser é conveniência; a que conta é a que não se consegue contornar.

### Emails repetidos

Um email já inscrito devolve `409`, e o JavaScript mostra na mesma a mensagem de sucesso.
Se dissesse "já estás inscrito", o formulário passava a ser uma forma de descobrir quem
está na lista, um email de cada vez.

A primeira tentativa foi `Prefer: resolution=ignore-duplicates`, que resolveria isto do
lado do servidor. Não dá: esse cabeçalho obriga o PostgREST a exigir privilégio de
`SELECT` na tabela, exactamente o que recusamos para ninguém poder ler a lista. Ou se tem
um ou se tem o outro, e a lista fechada vale mais.

### Cabeçalhos do pedido

Só `apikey`. A chave *publishable* não é um JWT, por isso mandá-la também em
`Authorization: Bearer` faz o PostgREST tentar lê-la como token e responder `401`.

### Ver as inscrições

Pelo painel do Supabase, em *Table editor → waitlist*. Não há maneira de as ler a partir
do site, de propósito.

### Verificado contra o projecto a sério

| Tentativa | Resultado |
| --- | --- |
| Inscrever email novo | `201`, gravado |
| Inscrever o mesmo outra vez | `409`, mensagem de sucesso à mesma |
| Inscrever email inválido | `400`, recusado pela restrição do servidor |
| **Ler a lista** com a chave pública | `401`, negado |
| **Alterar** uma linha | `401`, negado |
| **Apagar** uma linha | `401`, negado |

A coluna `lang` aceita `pt`, `en` ou `es`; a página manda sempre `en`.

### Por fazer

- **Limpar as linhas de teste.** A tabela tem inscrições de teste de sessões anteriores
  (`t1@`, `t2@`, `directo.…`, `final.…`, `leque.…`, `novo.…`, `captura.…`,
  `PRODUCAO.…@defimind.test`). Só se apagam pelo painel do Supabase, porque a chave
  pública não tem direito de `delete` — e é assim que deve ser.
- **Limitar a cadência.** O Supabase tem limites gerais de API, mas nada impede alguém de
  inserir milhares de emails válidos. Um gatilho que conte inserções por janela de tempo
  resolve.
- **Confirmar o email** antes de considerar a inscrição válida, se a lista for usada para
  envios a sério.
- **RGPD:** guardamos email, idioma e data, e mais nada. Sem IP, sem impressão digital do
  browser. Antes do lançamento é preciso a política de privacidade e uma forma de pedir
  a remoção.

## Segurança e cache

O `vercel.json` traz uma CSP apertada: `default-src 'none'`, sem `unsafe-inline` nos
scripts. O único script inline da página — `document.documentElement.className+=' js';` —
está autorizado por **hash SHA-256**, não por `unsafe-inline`:

```
'sha256-5JWz2pFlxEjBn60lOlhminb3At6YloWzeus5DqPU7W8='
```

Se esse script mudar um único caracter, a CSP deixa de o aceitar e a página fica sem a
classe `js`. Recalcula-se assim:

```bash
printf "%s" "document.documentElement.className+=' js';" | openssl dgst -sha256 -binary | openssl base64
```

É por causa desta CSP que o CSS e o JavaScript vivem em ficheiros próprios em vez de
estarem embutidos no HTML.

`assets/css` e `assets/js` são servidos com `must-revalidate`, não com `immutable`. Sem
build que ponha uma impressão digital no nome dos ficheiros, marcá-los como imutáveis
faria com que uma actualização nunca chegasse a quem já tivesse visitado o site. Só as
imagens levam cache longa, porque essas não mudam.

## Antes de ir para o ar

- [ ] Criar `assets/img/og-image.png` (1200×630). Neste momento as partilhas usam o
      `logo-full.png`, que serve mas não está no formato certo
- [ ] Confirmar os nomes dos códigos de recusa contra o enum do produto
- [ ] **Decidir como se recolhem contactos.** Sem a secção final a página não tem
      nenhuma chamada à acção nem forma de alguém deixar o email
- [ ] Escrever as páginas legais (privacidade, termos) e ligá-las no rodapé
- [ ] Decidir se há whitepaper e, se houver, acrescentar o link à navegação
- [ ] Confirmar que o texto do x402 bate certo com a implementação (a ordem exacta do
      402 → pagamento → repetição do pedido)
- [ ] Decidir se o repositório do produto fica público e, se ficar, acrescentar o link

## Notas técnicas

- Fontes Inter, Inter Tight e IBM Plex Mono via Google Fonts. Os ícones são SVG inline.
  Não há pedidos a servidores externos além das fontes e do Supabase, e a CSP só autoriza
  esses três destinos.
- O conteúdo aparece com `IntersectionObserver`, mas só fica escondido de início se o
  JavaScript correr: o `<script>` inline no `<head>` põe a classe `js` no `<html>` e é
  essa classe que activa o `opacity:0`. Se o JavaScript falhar, a página aparece inteira
  em vez de ficar em branco. Há ainda uma rede de segurança por scroll e um temporizador.
- Testado sem overflow horizontal a 375px e 1440px.
- A navegação passa a menu aos 1180px. São oito links mais o logótipo, por isso o chip
  "Pre-launch" só aparece a partir dos 1340px — abaixo disso não há largura e a barra
  partia em duas linhas. O estado de pré-lançamento está também no hero e no rodapé, por
  isso nada se perde. É um breakpoint separado do layout (900px) de propósito.
- Acessibilidade: um único `<h1>`, link de salto, foco visível, menu com `aria-expanded`,
  separadores com `role="tablist"` e `aria-selected`, tabelas com `<caption>`, FAQ em
  `<details>` nativo (funciona sem JavaScript), e `prefers-reduced-motion` desliga as
  animações e o fundo.
