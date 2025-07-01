    const alertaAudio = new Audio('sons/alerta.mp3');
    alertaAudio.preload = 'auto';
    alertaAudio.volume = 1.0;
    alertaAudio.load();

    const vitoriaAudio = new Audio('sons/vitoria.mp3');
    vitoriaAudio.preload = 'auto';
    vitoriaAudio.volume = 1.0;
    vitoriaAudio.load();

    let audioHabilitado = false;
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    });

    let pontuacao = 0;
    let tamanho = 100;
    let modoZen = false;
    let vitoriaExibida = false;
    let isProvocacaoAtiva = false;
    let movementIntervalId = null;
    let missedClicks = 0;
    let enableLaughter = false;
    let risadaAtual = null;
    let ultimaRisada = null;

    const quadrado = document.getElementById('quadrado');
    const modalPermissaoAudio = document.getElementById('modalPermissaoAudio');

    const frasesPsicologicas = [
      "Você tá realmente se esforçando... pra quê mesmo?",
      "Se você usasse esse foco todo nos boletos, estaria rico.",
      "Na moral... é isso que você chama de diversão?",
      "Clicando num quadrado como se fosse seu ex.",
      "Tá jogando ou fugindo das responsabilidades?"
    ];

    const mensagens = [
      "Desistir agora é economizar tempo e vergonha.",
      "Cada clique é um grito de socorro não ouvido.",
      "Seu mouse sofre em silêncio… diferente de mim.",
      "Clicou? Parabéns, ainda sem propósito.",
      "Essa insistência... já tentou terapia?",
      "Tá difícil? Pior tá o Brasil e seguimos aí.",
      "Mais de 5 cliques? Seu chefe ia te demitir.",
      "O quadrado foge igual as oportunidades da sua vida.",
      "Teimosia ou burrice? Você decide.",
      "Você tá brigando com um quadrado. Um QUADRADO!",
      "15 cliques e zero conquistas reais.",
      "Chegou até aqui? Já é meio caminho pro arrependimento.",
      "Mais 4 cliques e você ganha um parabéns irônico.",
      "Se tá aqui ainda é porque desistir também dá trabalho.",
      "Cresce, sofre e clica. Essa é a vida.",
      "Chega, vai descansar... ou não.",
      "Última chance de provar que clica melhor que decide."
    ];

    const mensagensProvocacao = [
      "Tá aí ainda? Achei que já tinha desistido faz tempo.",
      "Você tá lutando com um quadrado… precisa mesmo de tanta emoção?",
      "Esse quadrado já alugou um triplex na sua cabeça.",
      "Persistência é legal… mas isso aqui já é teimosia.",
      "Se o INSS contasse cliques, você já tava aposentado.",
      "Parabéns! Tá perdendo pra um pixel com ego.",
      "O quadrado tá fugindo, mas sua dignidade foi primeiro."
    ];

    function iniciarJogoComAudio() {
      audioHabilitado = true;
      modalPermissaoAudio.style.display = 'none';
      iniciarJogo();
    }

    function iniciarJogoSemAudio() {
      audioHabilitado = false;
      modalPermissaoAudio.style.display = 'none';
      iniciarJogo();
    }

    function iniciarJogo() {
      moverQuadrado();
      atualizarIntervaloMovimento();
      setInterval(() => {
        if (!modoZen && !vitoriaExibida && pontuacao >= 6 && 
            document.getElementById('modalZen').style.display !== 'flex' && 
            document.getElementById('modalVitoria').style.display !== 'flex' &&
            document.getElementById('modalPermissaoAudio').style.display !== 'flex') {
          if (Math.random() < 0.8) {
            exibirMensagemProvocacao();
          }
        }
      }, 20000);
    }

    function clicouNoQuadrado() {
      pontuacao++;
      document.getElementById('pontuacao').textContent = "Pontuação: " + pontuacao + " de 15";

      if (pontuacao >= 5 && !enableLaughter) {
        enableLaughter = true;
        console.log('Risadas habilitadas a partir da pontuação 5.');
      }

      if (audioHabilitado) {
        try {
          alertaAudio.currentTime = 0;
          const playPromise = alertaAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.warn('Erro ao tocar alerta:', e.message));
          }
        } catch (e) {
          console.warn('Erro no áudio de alerta:', e.message);
        }
      }

      if (pontuacao === 10 && !modoZen) {
        abrirModalZen();
        return;
      }

      if (pontuacao === 15 && !vitoriaExibida) {
        exibirVitoria();
        return;
      }

      atualizarMensagem();
      tamanho = Math.max(30, 100 - pontuacao * 5);
      quadrado.style.width = tamanho + "px";
      quadrado.style.height = tamanho + "px";
      
      if (!modoZen) {
        setTimeout(moverQuadrado, 150);
      }
      
      atualizarIntervaloMovimento();

      if (pontuacao >= 12 && !modoZen) {
        document.getElementById('rage').style.display = 'block';
      }
    }

    function clicouForaDoQuadrado() {
      console.log('Clique fora do quadrado detectado em elemento.');
      if (audioHabilitado && !modoZen && !vitoriaExibida && enableLaughter) {
        missedClicks++;
        console.log('missedClicks:', missedClicks);
        if (missedClicks >= 15) { //Quantidade de clicks falhos para tocar risada
          console.log('15 missedClicks alcançados! Tentando tocar risada...');
          tocarRisadaAleatoria();
          missedClicks = 0;
        }
      } else {
        let reason = [];
        if (!audioHabilitado) reason.push('Áudio desabilitado');
        if (modoZen) reason.push('Modo Zen ativo');
        if (vitoriaExibida) reason.push('Vitória exibida');
        if (!enableLaughter) reason.push('Risadas desativadas (pontuação < 5)');
        console.log('Clique fora do quadrado ignorado porque:', reason.join(', '));
      }
    }

    document.addEventListener('click', (e) => {
      if (modalPermissaoAudio.style.display === 'none') {
        if (e.target !== quadrado && 
            e.target.closest('#modalZen') === null && 
            e.target.closest('#modalVitoria') === null &&
            e.target.closest('#modalPermissaoAudio') === null) {
          clicouForaDoQuadrado();
        } else {
          if (e.target === quadrado) console.log('Clique no quadrado (acerto).');
          if (e.target.closest('#modalZen')) console.log('Clique dentro da modal Zen.');
          if (e.target.closest('#modalVitoria')) console.log('Clique dentro da modal de vitória.');
          if (e.target.closest('#modalPermissaoAudio')) console.log('Clique dentro da modal de permissão de áudio.');
        }
      } else {
        console.log('Jogo não iniciado, esperando permissão de áudio.');
      }
    });

    function atualizarMensagem() {
      const msg = mensagens[Math.min(pontuacao, mensagens.length - 1)];
      document.getElementById('mensagem').textContent = msg;
    }

    function moverQuadrado() {
      const largura = window.innerWidth - tamanho;
      const altura = window.innerHeight - tamanho;
      const novaEsquerda = Math.random() * largura;
      const novoTopo = Math.random() * altura;
      quadrado.style.left = novaEsquerda + "px";
      quadrado.style.top = novoTopo + "px";
    }

    function getIntervaloMovimentoBase() {
      if (modoZen) {
        return 1000;
      }
      const baseInterval = 800;
      const minInterval = 30;
      let calculatedInterval = baseInterval - (pontuacao * 30);
      return Math.max(minInterval, calculatedInterval);
    }

    let isMouseNear = false;

    function getIntervaloMovimento() {
      const baseSpeed = getIntervaloMovimentoBase();
      if (isMouseNear) {
        return Math.max(50, baseSpeed / 2.5);
      }
      return baseSpeed;
    }

    function atualizarIntervaloMovimento() {
      if (movementIntervalId) {
        clearInterval(movementIntervalId);
      }
      
      if (!vitoriaExibida && document.getElementById('modalZen').style.display !== 'flex' && 
          document.getElementById('modalVitoria').style.display !== 'flex' &&
          document.getElementById('modalPermissaoAudio').style.display !== 'flex') {
        movementIntervalId = setInterval(() => {
          moverQuadrado();
        }, getIntervaloMovimento());
      } else {
        if (movementIntervalId) {
          clearInterval(movementIntervalId);
          movementIntervalId = null;
        }
      }
    }

    function abrirModalZen() {
      const frase = frasesPsicologicas[Math.floor(Math.random() * frasesPsicologicas.length)];
      document.getElementById('textoZen').textContent = frase;
      document.getElementById('modalZen').style.display = 'flex';
      if (movementIntervalId) {
        clearInterval(movementIntervalId);
        movementIntervalId = null;
      }
    }

    function fecharModalZen() {
      document.getElementById('modalZen').style.display = 'none';
      atualizarIntervaloMovimento();
    }

    function ativarModoZen() {
      modoZen = true;
      tamanho = 130;
      quadrado.style.width = tamanho + "px";
      quadrado.style.height = tamanho + "px";
      document.getElementById('mensagem').textContent = "Modo Zen ativado. Respira. Clica. Paz. ☯️";
      document.getElementById('rage').style.display = 'none';
      atualizarIntervaloMovimento();
      fecharModalZen();
    }

    function exibirVitoria() {
  vitoriaExibida = true;
  document.getElementById('modalVitoria').style.display = 'flex';
  quadrado.style.display = 'none';

  // Para o movimento do quadrado
  if (movementIntervalId) {
    clearInterval(movementIntervalId);
    movementIntervalId = null;
  }

  // Para risada atual, se estiver tocando
  if (typeof risadaAtual !== 'undefined' && risadaAtual) {
    risadaAtual.pause();
    risadaAtual.currentTime = 0;
    console.log('Risada interrompida pela vitória.');
  }

  // Toca áudio de vitória
  if (audioHabilitado) {
    try {
      vitoriaAudio.currentTime = 0;
      const playPromise = vitoriaAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Áudio de vitória tocado com sucesso.');
          })
          .catch(e => {
            console.warn('Erro ao tocar áudio de vitória:', e.message);
            if (e.name === 'NotAllowedError') {
              console.error('Erro de autoplay: interação do usuário necessária.');
            } else if (e.name === 'NotSupportedError') {
              console.error('Erro: formato de áudio não suportado ou arquivo vitoria.mp3 não encontrado.');
            }
          });
      }
    } catch (e) {
      console.warn('Erro no áudio de vitória:', e.message);
    }
  } else {
    console.log('Áudio de vitória não tocado: áudio desabilitado.');
  }
}

    function copiarMensagemVitoria() {
      const mensagem = document.getElementById('mensagemVitoria').innerText;
      navigator.clipboard.writeText(mensagem).then(() => {
        alert('Mensagem copiada para a área de transferência!');
      }).catch(() => {
        alert('Falha ao copiar a mensagem. Tente novamente.');
      });
    }


function tocarRisadaAleatoria() {
  if (!audioHabilitado) {
    console.log('Áudio de risada não pode ser reproduzido: áudio desabilitado.');
    return;
  }

  const risadasSrc = [
    "sons/risada1.mp3",
    "sons/risada2.mp3",
    "sons/risada3.mp3",
    "sons/risada4.mp3",
    "sons/risada5.mp3",
    "sons/risada6.mp3",
    "sons/risada7.mp3",
    "sons/risada8.mp3"
  ];

  // Filtra a última risada tocada, se houver
  const risadasDisponiveis = ultimaRisada
    ? risadasSrc.filter(risada => risada !== ultimaRisada)
    : risadasSrc;

  // Escolhe um índice aleatório entre as risadas disponíveis
  const index = Math.floor(Math.random() * risadasDisponiveis.length);
  const audioPath = risadasDisponiveis[index];

  try {
    // Para risada anterior, se estiver tocando
    if (risadaAtual) {
      risadaAtual.pause();
      risadaAtual.currentTime = 0;
    }

    risadaAtual = new Audio(audioPath);
    // Volume aleatório entre 0.5 e 1.0
    risadaAtual.volume = 0.5 + Math.random() * 0.5;
    // Velocidade de reprodução aleatória entre 0.8x e 1.2x
    risadaAtual.playbackRate = 0.8 + Math.random() * 0.4;
    risadaAtual.preload = 'auto';

    risadaAtual.addEventListener('canplaythrough', () => {
      const playPromise = risadaAtual.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Risada ${audioPath} tocada com volume ${risadaAtual.volume.toFixed(2)} e velocidade ${risadaAtual.playbackRate.toFixed(2)}.`);
            ultimaRisada = audioPath; // Atualiza a última risada tocada
          })
          .catch(e => console.warn(`Erro ao tocar risada ${audioPath}:`, e.message));
      }
    }, { once: true });

    risadaAtual.addEventListener('error', (e) => {
      console.error(`Erro ao carregar risada ${audioPath}:`, e);
    }, { once: true });

  } catch (e) {
    console.error('Erro ao criar áudio de risada:', e.message);
  }
}

    function exibirMensagemProvocacao() {
      if (isProvocacaoAtiva) return;
      isProvocacaoAtiva = true;
      const msgProvocacao = mensagensProvocacao[Math.floor(Math.random() * mensagensProvocacao.length)];
      const mensagemProvocacao = document.getElementById('mensagemProvocacao');
      mensagemProvocacao.textContent = msgProvocacao;
      mensagemProvocacao.style.display = 'block';
      setTimeout(() => {
        mensagemProvocacao.style.display = 'none';
        isProvocacaoAtiva = false;
      }, 15000);
    }

    document.addEventListener('mousemove', (e) => {
      if (modoZen || vitoriaExibida || 
          document.getElementById('modalZen').style.display === 'flex' || 
          document.getElementById('modalVitoria').style.display === 'flex' ||
          document.getElementById('modalPermissaoAudio').style.display === 'flex') return;

      const rect = quadrado.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const distanciaCritica = Math.max(20, 100 - pontuacao * 4);

      const distanciaX = Math.abs(rect.left + tamanho / 2 - mouseX);
      const distanciaY = Math.abs(rect.top + tamanho / 2 - mouseY);

      const currentlyMouseNear = distanciaX < distanciaCritica && distanciaY < distanciaCritica;

      if (currentlyMouseNear !== isMouseNear) {
        isMouseNear = currentlyMouseNear;
        atualizarIntervaloMovimento();
      }
    });