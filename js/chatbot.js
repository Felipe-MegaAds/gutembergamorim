/* ==========================================================================
   CHATBOT.JS - MOTOR DO CHATBOT COM A ATENDENTE VIRTUAL MARIA
   Gutemberg Amorim Advocacia Especializada em Golpes Financeiros
   Atendimento humanizado, acolhedor e seguro com cálculo de emojis (🔴 🟡 🔵)
   e redirecionamento estruturado para o WhatsApp com traqueamento GTM.
   ========================================================================== */

/**
 * Constantes universais de emojis via escape Unicode (compatíveis com qualquer charset)
 * - Vermelho (\u{1F534}): Qualificado Prioritário (R$ 500 mil a R$ 1 milhão, Acima de R$ 1 milhão)
 * - Amarelo (\u{1F7E1}): Qualificado Médio / Não tanto (R$ 200 mil a R$ 500 mil)
 * - Azul (\u{1F535}): Não Qualificado / Padrão (R$ 30 mil a R$ 100 mil, R$ 100 mil a R$ 200 mil)
 */
const ICONE_QUALIFICADO_VERMELHO = '\u{1F534}'; // 🔴
const ICONE_QUALIFICADO_AMARELO  = '\u{1F7E1}'; // 🟡
const ICONE_QUALIFICADO_AZUL     = '\u{1F535}'; // 🔵

/**
 * Calcula dinamicamente o emoji de cor correspondente com base no valor informado
 * @param {string} valorTexto - Faixa de valor selecionada
 * @returns {string} Emoji correspondente (🔴, 🟡 ou 🔵)
 */
function calcularIconeQualificacao(valorTexto) {
  if (!valorTexto) return ICONE_QUALIFICADO_AZUL;
  const v = valorTexto.trim();
  
  // Faixas altas (R$ 500 mil a R$ 1 milhão ou Acima de R$ 1 milhão) -> 🔴 Vermelho (Qualificado Prioritário)
  if (v.includes('Acima de R$ 1 milh') || v.includes('R$ 500 mil a R$ 1 milh') || v.includes('1 milh')) {
    return ICONE_QUALIFICADO_VERMELHO;
  }
  
  // Faixa intermediária (R$ 200 mil a R$ 500 mil) -> 🟡 Amarelo (Qualificado Médio)
  if (v.includes('R$ 200 mil a R$ 500 mil') || (v.includes('200 mil') && v.includes('500 mil'))) {
    return ICONE_QUALIFICADO_AMARELO;
  }
  
  // Demais faixas (R$ 30 mil a R$ 100 mil ou R$ 100 mil a R$ 200 mil) -> 🔵 Azul (Não Qualificado)
  return ICONE_QUALIFICADO_AZUL;
}

/**
 * Estado global do fluxo de atendimento do Chatbot
 * Armazena as respostas coletadas ao longo das 7 etapas.
 */
const chatbotState = {
  currentStep: 1,
  data: {
    golpe: '',
    valor: '',
    iconeValidacao: ICONE_QUALIFICADO_AZUL,
    classificacaoTexto: 'Análise Técnica',
    boletimOcorrencia: '',
    medOuContestacao: '',
    nome: '',
    email: '',
    whatsapp: ''
  }
};

/**
 * Configuração dos números de WhatsApp e mensagens padrão
 */
const CHATBOT_CONFIG = {
  whatsappNumber: '5562981751315', // Telefone oficial do Dr. Gutemberg Amorim
  typingDelayMs: 780 // Tempo calibrado para simular digitação e leitura humana atenciosa
};

/**
 * Retorna o horário local atual formatado (ex: 16:54) para os balões de mensagem
 * @returns {string} Horário formatado HH:MM
 */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Inicialização do Chatbot quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

/**
 * Função principal de inicialização do Chatbot
 * Configura containers, eventos e inicia a primeira pergunta da atendente Maria.
 */
function initChatbot() {
  const chatBody = document.getElementById('chatBody');
  const chatActionArea = document.getElementById('chatActionArea');
  
  if (!chatBody || !chatActionArea) return;

  // Inicia a primeira etapa com apresentação da Maria
  renderStep(1);

  // Abre a janela do chatbot em tela cheia antes da landing page
  openChatbotModal();
}

/**
 * Abre a janela modal do Chatbot em primeiro plano antes da Landing Page
 */
function openChatbotModal() {
  const modal = document.getElementById('chatbotModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede a rolagem da página ao fundo
    scrollToBottom();
  }
}

/**
 * Fecha a janela do Chatbot e revela a Landing Page completa
 */
function closeChatbotModal() {
  const modal = document.getElementById('chatbotModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura a rolagem normal da landing page
    
    // Rolagem suave até o início da landing page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

/**
 * Atualiza a barra de progresso visual do Chatbot (1 a 7 etapas)
 * @param {number} step - Número do passo atual
 */
function updateProgressBar(step) {
  const progressBar = document.getElementById('chatbotProgressBar');
  if (!progressBar) return;
  const percentage = Math.min((step / 7) * 100, 100);
  progressBar.style.width = `${percentage}%`;
}

/**
 * Rola a caixa de mensagens para o final suavemente
 * e garante visibilidade imediata em telas mobile mesmo com o teclado virtual aberto
 */
function scrollToBottom() {
  const chatBody = document.getElementById('chatBody');
  if (chatBody) {
    setTimeout(() => {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: 'smooth'
      });
    }, 60);
  }
}

/**
 * Simula a digitação atenciosa e humanizada da atendente Maria
 * @param {Function} callback - Ação disparada ao término da digitação
 */
function showTypingIndicator(callback) {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  const typingRow = document.createElement('div');
  typingRow.className = 'chat-msg-row bot-msg-row';
  typingRow.id = 'botTypingIndicator';
  typingRow.innerHTML = `
    <div class="chat-bot-avatar-mini" title="Maria Silva">
      <img src="images/maria-atendente.jpg" alt="Maria Silva">
    </div>
    <div class="chat-bubble-container">
      <div class="typing-indicator-box">
        <span class="typing-text">Maria está digitando</span>
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;

  chatBody.appendChild(typingRow);
  scrollToBottom();

  setTimeout(() => {
    const existingTyping = document.getElementById('botTypingIndicator');
    if (existingTyping) existingTyping.remove();

    if (callback) callback();
  }, CHATBOT_CONFIG.typingDelayMs);
}

/**
 * Insere a mensagem enviada pela atendente virtual Maria no feed
 * @param {string} text - Conteúdo da mensagem
 */
function appendBotMessage(text) {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  const time = getCurrentTime();
  const msgRow = document.createElement('div');
  msgRow.className = 'chat-msg-row bot-msg-row';
  msgRow.innerHTML = `
    <div class="chat-bot-avatar-mini" title="Maria Silva · Concierge Jurídica">
      <img src="images/maria-atendente.jpg" alt="Maria Silva">
    </div>
    <div class="chat-bubble-container">
      <span class="chat-sender-tag">Maria Silva · Concierge Jurídica</span>
      <div class="chat-bubble bot-bubble">
        ${text}
      </div>
      <span class="chat-timestamp">${time}</span>
    </div>
  `;

  chatBody.appendChild(msgRow);
  scrollToBottom();
}

/**
 * Insere a resposta do usuário no feed de mensagens
 * @param {string} text - Resposta do usuário
 */
function appendUserMessage(text) {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  const time = getCurrentTime();
  const msgRow = document.createElement('div');
  msgRow.className = 'chat-msg-row user-row';
  msgRow.innerHTML = `
    <div class="chat-bubble-container">
      <div class="chat-bubble user-bubble">
        ${text}
      </div>
      <span class="chat-timestamp">${time} · Enviado</span>
    </div>
  `;

  chatBody.appendChild(msgRow);
  scrollToBottom();
}

/**
 * Renderizador mestre das etapas do Chatbot
 * Conduz o usuário através das 7 perguntas com acolhimento humanizado da atendente Maria
 * @param {number} step - Etapa atual
 */
function renderStep(step) {
  chatbotState.currentStep = step;
  updateProgressBar(step);

  const actionArea = document.getElementById('chatActionArea');
  if (!actionArea) return;
  actionArea.innerHTML = ''; // Limpa botões ou inputs anteriores

  switch (step) {
    /* ---------------------------------------------------------
       ETAPA 1: Você caiu em qual Golpe?
       Apresentação calorosa da Maria e opções refinadas com ícones
       --------------------------------------------------------- */
    case 1:
      showTypingIndicator(() => {
        appendBotMessage(`Olá! Seja muito bem-vindo(a). Meu nome é <strong>Maria Silva</strong>, sou a concierge jurídica do <strong>Dr. Gutemberg Amorim</strong>.<br><br>Sei o quanto ser vítima de um golpe bancário traz angústia e sensação de impotência, mas quero que saiba que você não está sozinho(a): as instituições financeiras têm responsabilidade objetiva pela segurança das transações.<br><br>Para que eu possa registrar as particularidades do seu caso e organizar sua triagem prioritária, me conte:<br><br><strong>1. Em qual dessas fraudes você caiu?</strong>`);
        
        actionArea.innerHTML = `
          <div class="chat-options-grid">
            
            <!-- Opção 1: Golpe do Pix -->
            <button type="button" class="chat-option-card" onclick="selectGolpe('Golpe do Pix')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
                </div>
                <span class="opt-title">Golpe do Pix / Transferência</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Opção 2: Falso Leilão -->
            <button type="button" class="chat-option-card" onclick="selectGolpe('Golpe do Falso Leilão')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                </div>
                <span class="opt-title">Golpe do Falso Leilão de Veículos</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Opção 3: Falso Advogado -->
            <button type="button" class="chat-option-card" onclick="selectGolpe('Golpe do Falso Advogado')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 2-4 4-2-2-4 4 2 2-4 4 4 4 4-4 2 2 4-4-2-2 4-4Z"/><path d="m18 10 4-4-2-2-4 4"/></svg>
                </div>
                <span class="opt-title">Golpe do Falso Advogado / Alvará</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Opção 4: Falsa Central Telefônica -->
            <button type="button" class="chat-option-card" onclick="selectGolpe('Golpe da Falsa Central / Gerente')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span class="opt-title">Falsa Central Bancária / Gerente</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Opção 5: Falso Investimento -->
            <button type="button" class="chat-option-card" onclick="selectGolpe('Golpe do Falso Investidor')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span class="opt-title">Falsos Investimentos / Cripto</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Opção 6: Outros -->
            <button type="button" class="chat-option-card" onclick="showCustomGolpeInput()">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
                </div>
                <span class="opt-title">Outro Tipo de Golpe (Especificar)</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

          </div>

          <!-- Campo Dinâmico para Especificação de Outro Golpe -->
          <div id="customGolpeArea" style="display: none; margin-top: 0.5rem;">
            <div class="chat-input-wrapper">
              <div class="chat-input-field-wrap">
                <svg class="chat-input-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <input type="text" id="customGolpeInput" class="chat-text-input" placeholder="Descreva brevemente o golpe sofrido..." onkeypress="handleKeyPress(event, submitCustomGolpe)">
              </div>
              <button type="button" class="chat-submit-btn" onclick="submitCustomGolpe()" aria-label="Confirmar">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        `;
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 2: Qual foi o valor do Golpe?
       Resposta empática da Maria e cartões de valores refinados
       --------------------------------------------------------- */
    case 2:
      showTypingIndicator(() => {
        appendBotMessage(`Compreendo perfeitamente a sua situação. Em casos de fraudes bancárias, as primeiras horas são preciosas para as medidas urgentes de rastreamento e bloqueio judicial das contas receptoras.<br><br><strong>2. Qual foi o valor aproximado do prejuízo sofrido?</strong>`);

        actionArea.innerHTML = `
          <div class="chat-options-grid">
            <button type="button" class="chat-option-card" onclick="selectValor('R$ 30 mil a R$ 100 mil')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8"/></svg>
                </div>
                <span class="opt-title">R$ 30 mil a R$ 100 mil</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <button type="button" class="chat-option-card" onclick="selectValor('R$ 100 mil a R$ 200 mil')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8"/></svg>
                </div>
                <span class="opt-title">R$ 100 mil a R$ 200 mil</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <button type="button" class="chat-option-card" onclick="selectValor('R$ 200 mil a R$ 500 mil')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8"/></svg>
                </div>
                <span class="opt-title">R$ 200 mil a R$ 500 mil</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <button type="button" class="chat-option-card" onclick="selectValor('R$ 500 mil a R$ 1 milhão')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8"/></svg>
                </div>
                <span class="opt-title">R$ 500 mil a R$ 1 milhão</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>

            <button type="button" class="chat-option-card" onclick="selectValor('Acima de R$ 1 milhão')">
              <div class="chat-option-card-left">
                <div class="opt-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8"/></svg>
                </div>
                <span class="opt-title">Acima de R$ 1 milhão</span>
              </div>
              <svg class="opt-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        `;
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 3: Você fez o Boletim de Ocorrência?
       --------------------------------------------------------- */
    case 3:
      showTypingIndicator(() => {
        appendBotMessage(`Valor anotado com sigilo profissional. O registro formal do Boletim de Ocorrência é uma peça indispensável para instruir a tese de responsabilização objetiva contra o banco.<br><br><strong>3. Você já conseguiu registrar o Boletim de Ocorrência (B.O.)?</strong>`);

        actionArea.innerHTML = `
          <div class="chat-boolean-options">
            <button type="button" class="boolean-card card-yes" onclick="selectBO('Sim')">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              <span>Sim, já registrei</span>
            </button>
            <button type="button" class="boolean-card card-no" onclick="selectBO('Não')">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
              <span>Não registrei ainda</span>
            </button>
          </div>
        `;
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 4: Fez MED ou contestou junto ao Banco?
       --------------------------------------------------------- */
    case 4:
      showTypingIndicator(() => {
        appendBotMessage(`Perfeito. Toda tentativa de solução administrativa e contestação não acolhida pelo banco evidencia a falha na prestação do serviço da instituição financeira.<br><br><strong>4. Você acionou o MED (Mecanismo Especial de Devolução) ou contestou a transação junto ao seu Banco?</strong>`);

        actionArea.innerHTML = `
          <div class="chat-boolean-options">
            <button type="button" class="boolean-card card-yes" onclick="selectMED('Sim')">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              <span>Sim, fiz o MED / contestei</span>
            </button>
            <button type="button" class="boolean-card card-no" onclick="selectMED('Não')">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
              <span>Não contestei ainda</span>
            </button>
          </div>
        `;
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 5: Nome Completo
       --------------------------------------------------------- */
    case 5:
      showTypingIndicator(() => {
        appendBotMessage(`Ótimo! Agora vou abrir o seu protocolo oficial de atendimento para que o <strong>Dr. Gutemberg Amorim</strong> e nossa equipe jurídica assumam a análise do seu caso.<br><br><strong>5. Como posso te chamar? Qual é o seu Nome Completo?</strong>`);

        actionArea.innerHTML = `
          <div class="chat-input-wrapper">
            <div class="chat-input-field-wrap">
              <svg class="chat-input-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" id="nomeInput" class="chat-text-input" placeholder="Digite seu nome completo..." autocomplete="name" onkeypress="handleKeyPress(event, submitNome)">
            </div>
            <button type="button" class="chat-submit-btn" onclick="submitNome()" aria-label="Enviar nome">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        `;
        setTimeout(() => {
          const input = document.getElementById('nomeInput');
          if (input) input.focus();
        }, 120);
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 6: E-mail
       --------------------------------------------------------- */
    case 6:
      showTypingIndicator(() => {
        appendBotMessage(`Muito prazer, <strong>${chatbotState.data.nome}</strong>! Conte conosco para reverter essa situação.<br><br><strong>6. Qual o seu melhor E-mail</strong> para receber a cópia do parecer técnico e o registro das orientações jurídicas?`);

        actionArea.innerHTML = `
          <div class="chat-input-wrapper">
            <div class="chat-input-field-wrap">
              <svg class="chat-input-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" id="emailInput" class="chat-text-input" placeholder="exemplo@email.com" autocomplete="email" onkeypress="handleKeyPress(event, submitEmail)">
            </div>
            <button type="button" class="chat-submit-btn" onclick="submitEmail()" aria-label="Enviar e-mail">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        `;
        setTimeout(() => {
          const input = document.getElementById('emailInput');
          if (input) input.focus();
        }, 120);
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 7: WhatsApp com DDD
       --------------------------------------------------------- */
    case 7:
      showTypingIndicator(() => {
        appendBotMessage(`Perfeito! Para finalizarmos o seu dossiê e conectarmos você diretamente com o Dr. Gutemberg no canal mais ágil:<br><br><strong>7. Qual é o seu número de WhatsApp com DDD?</strong>`);

        actionArea.innerHTML = `
          <div class="chat-input-wrapper">
            <div class="chat-input-field-wrap">
              <svg class="chat-input-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input type="tel" id="whatsappInput" class="chat-text-input" placeholder="(00) 00000-0000" autocomplete="tel" oninput="maskPhoneInput(this)" onkeypress="handleKeyPress(event, submitWhatsapp)">
            </div>
            <button type="button" class="chat-submit-btn" onclick="submitWhatsapp()" aria-label="Concluir triagem">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        `;
        setTimeout(() => {
          const input = document.getElementById('whatsappInput');
          if (input) input.focus();
        }, 120);
        scrollToBottom();
      });
      break;

    /* ---------------------------------------------------------
       ETAPA 8: Conclusão Humanizada da Maria e Botões de Conversão
       --------------------------------------------------------- */
    case 8:
      showTypingIndicator(() => {
        appendBotMessage(`<strong>Excelente, ${chatbotState.data.nome}! Seu dossiê preliminar foi registrado e organizado com sucesso.</strong><br><br>As informações já foram compiladas para a análise jurídica individual do <strong>Dr. Gutemberg Amorim</strong>. Clique no botão abaixo para darmos continuidade imediata pelo WhatsApp oficial do escritório.`);

        // Monta o link estruturado de WhatsApp
        const zapLink = generateWhatsAppLink();

        actionArea.innerHTML = `
          <div class="chat-final-card">
            <div class="chat-final-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              <span>Protocolo de Triagem Concluído</span>
            </div>
            <ul class="chat-summary-list">
              <li><span>Golpe Sofrido:</span> <strong>${chatbotState.data.golpe}</strong></li>
              <li><span>Prejuízo Estimado:</span> <strong>${chatbotState.data.valor}</strong></li>
              <li><span>Boletim de Ocorrência:</span> <strong>${chatbotState.data.boletimOcorrencia}</strong></li>
              <li><span>MED / Contestação:</span> <strong>${chatbotState.data.medOuContestacao}</strong></li>
              <li><span>Contato WhatsApp:</span> <strong>${chatbotState.data.whatsapp}</strong></li>
            </ul>
            <a href="${zapLink}" target="_blank" rel="noopener noreferrer" class="elementor_button chat-whatsapp-cta" onclick="trackLeadConversion()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              <span>Falar Agora com Dr. Gutemberg no WhatsApp</span>
            </a>
            <button type="button" class="chat-access-lp-btn" onclick="closeChatbotModal()">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              <span>Acessar a Landing Page Completa</span>
            </button>
            <button type="button" class="chat-restart-btn" onclick="restartChatbot()">Refazer Atendimento</button>
          </div>
        `;
        scrollToBottom();

        // Dispara o evento de lead concluído no dataLayer
        pushLeadToDataLayer();
      });
      break;
  }
}

/**
 * Captura a tecla Enter para submissão ágil do campo de input
 */
function handleKeyPress(event, submitFunction) {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitFunction();
  }
}

/* --------------------------------------------------------------------------
   FUNÇÕES DE SELEÇÃO E SUBMISSÃO DE CADA ETAPA
   -------------------------------------------------------------------------- */

function selectGolpe(golpeEscolhido) {
  chatbotState.data.golpe = golpeEscolhido;
  appendUserMessage(golpeEscolhido);
  renderStep(2);
}

function showCustomGolpeInput() {
  const customArea = document.getElementById('customGolpeArea');
  if (customArea) {
    customArea.style.display = 'block';
    const input = document.getElementById('customGolpeInput');
    if (input) input.focus();
    scrollToBottom();
  }
}

function submitCustomGolpe() {
  const input = document.getElementById('customGolpeInput');
  if (!input || !input.value.trim()) return;
  const val = input.value.trim();
  chatbotState.data.golpe = val;
  appendUserMessage(val);
  renderStep(2);
}

/**
 * Registra o valor aproximado do golpe e calcula automaticamente o emoji de qualificação
 * @param {string} valor - Faixa de valor escolhida pelo usuário
 */
function selectValor(valor) {
  chatbotState.data.valor = valor;
  const icone = calcularIconeQualificacao(valor);
  chatbotState.data.iconeValidacao = icone;
  chatbotState.data.classificacaoTexto = (icone === ICONE_QUALIFICADO_VERMELHO)
    ? 'Qualificado'
    : (icone === ICONE_QUALIFICADO_AMARELO ? 'Qualificado Médio' : 'Não Qualificado');

  // Exibe na tela do chat apenas o valor, mantendo a classificação técnica 100% oculta para o cliente
  appendUserMessage(valor);
  renderStep(3);
}

function selectBO(resposta) {
  chatbotState.data.boletimOcorrencia = resposta;
  appendUserMessage(`Boletim de Ocorrência: ${resposta}`);
  renderStep(4);
}

function selectMED(resposta) {
  chatbotState.data.medOuContestacao = resposta;
  appendUserMessage(`Fez MED / Contestação: ${resposta}`);
  renderStep(5);
}

function submitNome() {
  const input = document.getElementById('nomeInput');
  if (!input || !input.value.trim()) {
    alert('Por favor, informe seu nome completo para prosseguirmos.');
    return;
  }
  const nome = input.value.trim();
  chatbotState.data.nome = nome;
  appendUserMessage(nome);
  renderStep(6);
}

function submitEmail() {
  const input = document.getElementById('emailInput');
  if (!input || !input.value.trim()) {
    alert('Por favor, informe seu e-mail.');
    return;
  }
  const email = input.value.trim();
  if (!email.includes('@') || !email.includes('.')) {
    alert('Por favor, informe um endereço de e-mail válido.');
    return;
  }
  chatbotState.data.email = email;
  appendUserMessage(email);
  renderStep(7);
}

function submitWhatsapp() {
  const input = document.getElementById('whatsappInput');
  if (!input || !input.value.trim()) {
    alert('Por favor, informe o seu número de WhatsApp.');
    return;
  }
  const zap = input.value.trim();
  if (zap.replace(/\D/g, '').length < 10) {
    alert('Por favor, insira o DDD e o número completo.');
    return;
  }
  chatbotState.data.whatsapp = zap;
  appendUserMessage(zap);
  renderStep(8);
}

/**
 * Máscara dinâmica para o telefone no padrão brasileiro: (00) 00000-0000
 * @param {HTMLInputElement} input - Elemento input sendo preenchido
 */
function maskPhoneInput(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length > 11) val = val.substring(0, 11);

  if (val.length > 10) {
    val = val.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (val.length > 6) {
    val = val.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (val.length > 2) {
    val = val.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  } else if (val.length > 0) {
    val = val.replace(/^(\d{0,2})$/, '($1');
  }
  input.value = val;
}

/**
 * Gera a URL oficial do WhatsApp com a mensagem estruturada e classificada por cores
 * Utiliza o endpoint oficial direto api.whatsapp.com para preservação de 100% dos emojis UTF-8
 * @returns {string} Link com protocolo codificado para abertura instantânea do WhatsApp
 */
function generateWhatsAppLink() {
  const d = chatbotState.data;
  
  // Assegura que o ícone de cor correspondente (🔴, 🟡 ou 🔵) seja calculado infalivelmente
  const iconeCor = d.iconeValidacao || calcularIconeQualificacao(d.valor);
  
  // Monta a mensagem completa com o emoji no título e ao lado do valor do prejuízo
  const textMessage = 
`*NOVA TRIAGEM JURÍDICA - GOLPES FINANCEIROS* ${iconeCor}

*1. Nome do Cliente:* ${d.nome || 'Não informado'}
*2. WhatsApp:* ${d.whatsapp || 'Não informado'}
*3. E-mail:* ${d.email || 'Não informado'}
*4. Golpe Sofrido:* ${d.golpe || 'Não informado'}
*5. Valor do Prejuízo:* ${d.valor || 'Não informado'} ${iconeCor}
*6. Fez Boletim de Ocorrência:* ${d.boletimOcorrencia || 'Não informado'}
*7. Acionou MED / Contestou Banco:* ${d.medOuContestacao || 'Não informado'}

_Olá, Dr. Gutemberg Amorim! Concluí a qualificação no site e gostaria de uma orientação jurídica urgente sobre como recuperar meus valores e responsabilizar a instituição financeira._`;

  return `https://api.whatsapp.com/send?phone=${CHATBOT_CONFIG.whatsappNumber}&text=${encodeURIComponent(textMessage)}`;
}

/**
 * Disparo avançado de eventos para campanhas de tráfego (GTM, Google Ads e Meta Ads)
 */
function pushLeadToDataLayer() {
  const d = chatbotState.data;

  // Garante a existência do dataLayer
  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: 'lead_qualificado_chatbot',
    lead_score_icon: d.iconeValidacao,
    lead_score_tier: d.classificacaoTexto,
    golpe_tipo: d.golpe,
    valor_faixa: d.valor,
    fez_bo: d.boletimOcorrencia,
    fez_med: d.medOuContestacao
  });

  // Se o Pixel do Facebook estiver instalado
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', {
      content_name: d.golpe,
      value: d.valor,
      currency: 'BRL'
    });
  }

  // Se o gtag estiver instalado
  if (typeof gtag === 'function') {
    gtag('event', 'generate_lead', {
      event_category: 'Chatbot',
      event_label: d.iconeValidacao + ' ' + d.golpe,
      value: d.valor
    });
  }
}

/**
 * Registra o clique de conversão final no botão de WhatsApp do chatbot
 */
function trackLeadConversion() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'whatsapp_click_chatbot_final',
    lead_name: chatbotState.data.nome,
    lead_score: chatbotState.data.iconeValidacao
  });
}

/**
 * Reinicia a triagem para permitir novo preenchimento
 */
function restartChatbot() {
  chatbotState.data = {
    golpe: '',
    valor: '',
    iconeValidacao: ICONE_QUALIFICADO_AZUL,
    classificacaoTexto: 'Análise Técnica',
    boletimOcorrencia: '',
    medOuContestacao: '',
    nome: '',
    email: '',
    whatsapp: ''
  };

  const chatBody = document.getElementById('chatBody');
  if (chatBody) {
    chatBody.innerHTML = '';
  }

  renderStep(1);
}
