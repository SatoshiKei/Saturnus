import { getInvestigationState } from '../game/state/investigationStore'

import type { SceneId } from './sceneIntros'

import { HUB_REFLECTION_BACKGROUND, sceneBackgrounds } from './sceneIntros'

/**
 * Modo Reflexão: pensamento interno de Augusto (NVL, sem sprites).
 * Cada reflexão deve acrescentar interpretação, hipótese ou mudança de direção.
 */
export interface ReflectionDef {
  id: string
  sceneId?: SceneId
  whenFlag?: string
  background: string
  blocks: string[]
}

export const reflections: ReflectionDef[] = [
  {
    id: 'refl-theory-julia-pressure',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Talvez eu estivesse procurando um agressor onde bastava existir uma pessoa prestativa demais.',
      'Mariana vinha terceirizando a própria memória sem perceber. Júlia corrigia um horário, Camila lembrava um compromisso, alguém dizia que ela já tinha concordado com alguma coisa. Isoladamente, nada disso era estranho. Junto, criava uma dependência perigosa.',
      'Se Júlia estivesse preenchendo essas lacunas de propósito, eu provavelmente não encontraria uma ameaça. Encontraria Mariana repetindo como lembrança uma versão que começou na boca de outra pessoa. Eu precisava prestar atenção menos ao que Júlia dizia sobre Mariana e mais ao que Mariana passou a dizer depois de ouvi-la.',
    ],
  },

  {
    id: 'refl-theory-andre-obsession',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'André era o suspeito que já vinha pronto. Condenação, relação ruim, uma família quebrada e uma irmã que, anos depois, começou a procurar defeito no processo.',
      'A hipótese mais feia também era a mais simples: Mariana podia estar fazendo por André o que ele não conseguia fazer da prisão. Reabrir perguntas, procurar testemunhas cansadas, transformar qualquer inconsistência em dúvida.',
      'Eu ainda não tinha motivo para tratar André como vítima de nada. Se ele estivesse empurrando a irmã nessa direção, a conversa com ele provavelmente seria menos sobre Elisa do que sobre Mariana.',
    ],
  },

  {
    id: 'refl-theory-maralto-retaliation',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'A Maralto me oferecia outro tipo de explicação. Empresa grande, protestos antigos e gente que aprendia a ficar muda quando o assunto voltava.',
      'Se Mariana tinha esbarrado em alguma coisa que ainda valia dinheiro, cargo ou cadeia, o desaparecimento podia não ter relação nenhuma com o irmão. Talvez eu estivesse tentando forçar duas investigações diferentes dentro da mesma história só porque começaram no mesmo telefone.',
      'Por enquanto eu precisava deixar essa possibilidade respirar sozinha. Se Maralto fosse mesmo o centro, ela teria de produzir perigo sem depender de André.',
    ],
  },

  {
    id: 'refl-theory-human-manipulator',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'O número sem nome me incomodava por uma razão simples: ele conhecia Mariana no ponto exato em que ela já não confiava em si mesma.',
      'Isso não exigia tecnologia impossível. Bastava alguém paciente, próximo o suficiente para conhecer hábitos e frio o bastante para usar cada esquecimento como argumento. A pior parte era que uma pessoa assim não precisaria convencer Mariana de uma mentira grande. Só de pequenas correções, uma por vez.',
      'Antes de procurar uma entidade, eu procuraria um ser humano que tivesse aprendido a viver dentro das dúvidas dela.',
    ],
  },

  {
    id: 'refl-theory-miro-killed-elisa',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Miro tinha acabado de se tornar a explicação mais fácil para a morte de Elisa.',
      'Ele a seguiu, esteve perto da queda e tirou a bolsa dali. Eu podia imaginar o resto sem esforço, e justamente por isso precisava desconfiar da facilidade.',
      'Ainda assim, naquele momento, se eu tivesse de apostar em alguém, seria nele. Sandra era a peça capaz de transformar essa suspeita em alguma coisa mais sólida ou destruí-la de vez.',
    ],
  },

  {
    id: 'refl-samuel-recontextualized',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Eu já tinha falado com Samuel sem saber que estava falando com Samuel.',
      'Na primeira vez, ele era só um homem evasivo num endereço ligado a outro nome. Agora reaparecia dentro dos protestos e da linha Morsa. O estranho não era ter encontrado a mesma pessoa duas vezes. Era perceber que o significado de uma conversa podia chegar muito depois da conversa.',
      'Talvez houvesse mais gente assim pelo caminho. Pessoas que eu já tinha visto cedo demais para entender por que estavam ali.',
    ],
  },

  {
    id: 'refl-lucas',
    sceneId: 'lucas',
    whenFlag: 'block02_lucas_interview_done',
    background: sceneBackgrounds.lucas,
    blocks: [
      'Mariana não foi até Lucas para fazê-lo mudar de opinião sobre André. Isso teria sido inútil. Lucas não tinha uma dúvida, tinha uma certeza amadurecida por seis anos.',
      'Ela fez outra coisa. Pegou a lembrança dele e começou a testar onde terminava o que ele tinha visto e onde começava o que ele concluía. Lucas odiou o método porque, para ele, separar essas coisas parecia aliviar um homem que já tinha sido condenado.',
      'Talvez Mariana não estivesse tentando provar inocência. Talvez estivesse procurando quais partes do caso continuavam de pé quando alguém retirava a interpretação. Se era isso, eu precisava parar de começar pela pergunta \'por que André matou Elisa?\' e reconstruir primeiro onde cada pessoa realmente estava.',
    ],
  },

  {
    id: 'refl-aneis',
    sceneId: 'vertice',
    whenFlag: 'block02_vertice_set_crossref',
    background: sceneBackgrounds.vertice,
    blocks: [
      'A bancada não me deu Nico. Deu uma voz suficientemente limpa para que alguém reconhecesse.',
      'Isso mudava a natureza do que Mariana tinha feito. Ela não estava só guardando arquivos. Tinha preservado material que dependia de memória humana para ganhar significado. Caio ouviu poucos segundos e soube quem era.',
      'Talvez fosse isso que Mariana procurava no Vértice: não um documento, mas alguém que ainda carregasse aquela noite na cabeça. Nico era a primeira pessoa que eu tinha encontrado por esse caminho. Provavelmente não seria a última.',
    ],
  },

  {
    id: 'refl-livia',
    sceneId: 'livia',
    whenFlag: 'block03_livia_interview_done',
    background: sceneBackgrounds.livia,
    blocks: [
      'Mariana recusou a matéria pronta e pediu o bruto. Quanto mais eu pensava nisso, menos parecia uma preferência de formato.',
      'Uma reportagem já vem com começo, meio e fim. Alguém escolheu o que entrou, cortou o que atrapalhava e deu sentido ao resto. Mariana parecia desconfiar justamente desse sentido pronto.',
      'Se ela estava procurando alguma coisa nos protestos, queria o material antes de virar narrativa. Eu devia fazer o mesmo.',
    ],
  },

  {
    id: 'refl-nico',
    sceneId: 'nico',
    whenFlag: 'block03_nico_interview_done',
    background: sceneBackgrounds.nico,
    blocks: [
      'Eu tinha procurado Nico esperando que ele preenchesse os espaços daquela noite. Depois de seis anos, ele lembrava melhor das pessoas e da pista do que de horário.',
      'Isso não tornava a lembrança inútil. Só significava que eu estava pedindo à pessoa errada o tipo errado de resposta.',
      'Nico mencionou que o Vértice mantinha uma gravação automática da cabine. Se aquilo ainda existisse, eu não precisaria fazer a memória dele funcionar como relógio. Podia voltar ao que realmente ficou registrado.',
    ],
  },

  {
    id: 'refl-samuel',
    sceneId: 'samuel',
    whenFlag: 'block04_samuel_interview_done',
    background: sceneBackgrounds.samuel,
    blocks: [
      'Samuel não parecia ter medo de mim. Tinha lealdade. Isso era pior para uma investigação e, de certa forma, mais honesto.',
      'Mariana também pediu horários a ele. Não rosto, não culpa, não \'quem fez\'. Horários.',
      'Ela estava montando movimento. Quem esteve onde, quando apareceu e quando sumiu. Comecei a suspeitar que a morte de Elisa talvez dependesse menos de descobrir uma pessoa nova e mais de perceber que alguém tinha sido colocado no lugar errado.',
    ],
  },

  {
    id: 'refl-andre',
    sceneId: 'andre',
    whenFlag: 'block04_andre_interview_done',
    background: sceneBackgrounds.andre,
    blocks: [
      'Eu esperava que André agarrasse qualquer brecha que Mariana tivesse encontrado. Ele fez o contrário. Mandou a própria irmã parar.',
      'Um homem preso há seis anos podia fazer isso porque tinha desistido. Podia fazer porque estava tentando protegê-la. Ou porque havia alguma coisa fora do caso Elisa que ele não queria ver entrando nos autos.',
      'Maralto e Morsa receberam negativas rápidas demais para me ajudar. Não eram prova de nada. Mas eu saí da prisão com uma impressão nova: André talvez estivesse escondendo alguma coisa sem que essa coisa fosse necessariamente a morte de Elisa.',
    ],
  },

  {
    id: 'refl-hex-call',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Seis chamadas sem voz seriam fáceis de tratar como provocação se não fossem tão deliberadas.',
      'Ninguém quis falar comigo. Queriam que eu ouvisse arquivos, um atrás do outro, e que a central guardasse todos eles. Aquilo parecia menos uma ameaça do que uma entrega feita de um jeito absurdamente complicado.',
      'Se havia mensagem ali, não estava na conversa. Estava no próprio áudio. Eu levaria as seis gravações para a bancada antes de decidir por que alguém fez questão de colocá-las nas minhas mãos.',
    ],
  },

  {
    id: 'refl-nico2',
    sceneId: 'nico',
    whenFlag: 'block05_nico_followup_done',
    background: sceneBackgrounds.nico,
    blocks: [
      'A jaqueta clara era um detalhe pequeno demais para sobreviver seis anos por acaso e grande demais para eu tratá-lo como certeza.',
      'Nico associou a peça a Jana, não a Elisa. Se ele estivesse lembrando certo, a saída que todo mundo descreveu podia ter sido reconhecida pela roupa antes de ser reconhecida pela pessoa.',
      'Mariana insistiu nesse mesmo ponto. Eu precisava descobrir quem era Jana e por que aquela jaqueta tinha ficado presa na memória de tanta gente.',
    ],
  },

  {
    id: 'refl-jana',
    sceneId: 'jana',
    whenFlag: 'block05_jana_interview_done',
    background: sceneBackgrounds.jana,
    blocks: [
      'Jana me deu uma versão simples demais para um detalhe em que Mariana tinha insistido tanto.',
      'Talvez fosse realmente simples. Uma jaqueta emprestada, uma festa antiga e uma mulher cansada de explicar a mesma história para desconhecidos. Eu podia estar vendo suspeita porque já sabia que procurava uma rachadura.',
      'Mas se a troca não significava nada, então a obsessão de Mariana por ela precisava significar. Eu não sairia dali acusando Jana de mentir. Sairia procurando o que a roupa tinha mudado naquela noite.',
    ],
  },

  {
    id: 'refl-b05-andre',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'As primeiras rachaduras não inocentavam André. Esse era o perigo.',
      'Depois de encontrar erro suficiente, fica tentador transformar qualquer falha do processo em prova de que a conclusão inteira era falsa. Mariana podia ter caído exatamente nessa armadilha.',
      'Eu precisava trabalhar com duas ideias ao mesmo tempo: André ainda podia ter matado Elisa e, mesmo assim, o processo podia estar cheio de coisas erradas. Se eu não conseguisse sustentar as duas, acabaria investigando para confirmar a versão que preferia.',
    ],
  },

  {
    id: 'refl-b05-maralto',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Maralto, Morsa e Samuel formavam uma investigação que já conseguia ficar em pé sem Elisa.',
      'Isso era importante. Se eu obrigasse tudo a convergir cedo demais, eu poderia perder justamente a razão pela qual Mariana circulava entre assuntos tão diferentes.',
      'Talvez ela não estivesse investigando um único crime. Talvez estivesse procurando um padrão. Ainda não sabia qual.',
    ],
  },

  {
    id: 'refl-b05-path',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'A ligação das 08:03 tinha feito mais do que iniciar uma ocorrência. Ela colocou o telefone de Mariana na polícia e, por consequência, na minha mão.',
      'Depois disso eu fui encontrando pessoas que ela já tinha procurado, arquivos que ela já tinha separado e perguntas que ela já tinha feito. Até ali eu chamava isso de seguir os passos de uma desaparecida.',
      'Comecei a considerar uma hipótese pior: talvez eu não estivesse seguindo os passos dela. Talvez estivesse percorrendo um caminho deixado para ser percorrido.',
      'Se fosse verdade, eu precisava descobrir uma coisa antes de continuar obedecendo ao rastro. Em que ponto eu estava investigando Mariana e em que ponto Mariana ainda estava conduzindo a investigação?',
    ],
  },

  {
    id: 'refl-jana2',
    sceneId: 'jana',
    whenFlag: 'block06_jana_followup_done',
    background: sceneBackgrounds.jana,
    blocks: [
      'Jana finalmente deu à jaqueta um motivo.',
      'Ela entregou a roupa e a bolsa porque estava com medo de gente ligada a Válter. Aquilo não era figurino de uma testemunha confusa. Era uma tentativa de mudar a própria aparência por alguns minutos.',
      'Então a hipótese deixou de ser abstrata. Alguém podia ter seguido a pessoa errada porque estava seguindo a roupa certa. Se Elisa saiu com as coisas de Jana, eu precisava descobrir quem estava procurando Jana naquela noite.',
    ],
  },

  {
    id: 'refl-b06-geraldo',
    sceneId: 'geraldo',
    whenFlag: 'block06_refl_geraldo_pending',
    background: sceneBackgrounds.geraldo,
    blocks: [
      'Não precisava existir uma conspiração para o processo estar errado.',
      'Geraldo mentiu para proteger o emprego. Jana escondeu uma troca de roupa para não explicar de quem tinha medo. Miro mentiu para proteger Jana. Cada mentira fazia sentido para quem contou.',
      'O resultado podia ser uma história falsa construída por pessoas que nunca combinaram nada entre si. Pela primeira vez, eu conseguia enxergar como André poderia ter sido condenado sem que ninguém tivesse planejado condenar o homem errado.',
    ],
  },

  {
    id: 'refl-b06-miro',
    sceneId: 'miro',
    whenFlag: 'block06_refl_miro_pending',
    background: sceneBackgrounds.miro,
    blocks: [
      'Miro cabia bem demais no lugar que antes era de André.',
      'Ele seguiu a jaqueta, chegou perto da queda e mexeu nas coisas de Elisa depois. Se eu quisesse fechar o caso rapidamente, bastava trocar um nome pelo outro.',
      'Mas agora eu sabia como esse tipo de certeza era fabricado. Miro dizia que não matou Elisa, e eu precisava testar a única parte da história dele que ainda não tinha apoio fora da própria boca: o que aconteceu no guardrail.',
    ],
  },

  {
    id: 'refl-b07-sandra',
    sceneId: 'sandra',
    whenFlag: 'block07_refl_sandra_pending',
    background: sceneBackgrounds.sandra,
    blocks: [
      'Sandra se recusou a me dar a troca de culpado que eu estava quase pronto para aceitar.',
      'Ela podia ter confundido André com Miro. Também podia não ter confundido ninguém. Depois de seis anos, a honestidade dela estava justamente em não transformar dúvida em lembrança.',
      'Aquilo me deixou sem o conforto de um rosto. Se eu queria saber como Elisa morreu, talvez tivesse chegado a hora de parar de perguntar quem estava perto dela e olhar para o lugar da queda.',
    ],
  },

  {
    id: 'refl-b07-ricardo-dead',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Ricardo Freitas parecia um nome feito para durar poucas horas.',
      'Nada em volta dele sustentava uma vida anterior. Sem documento, endereço confiável ou família, o hospital tinha registrado o que ele disse e seguido em frente.',
      'Mariana não seguiu em frente. Se ela voltou a esse homem anos depois, alguma coisa naquela madrugada tinha sobrevivido ao nome falso. Renata lembrava do notebook. Era o primeiro objeto capaz de me levar para fora do prontuário.',
    ],
  },

  {
    id: 'refl-b07-notebook',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Um nome pode ser inventado. Um computador é mais difícil de improvisar.',
      'Se Ricardo passou horas agarrado àquele notebook, provavelmente havia ali uma conta, um arquivo ou uma conversa que existia antes de ele entrar no hospital. Pela primeira vez eu tinha a chance de procurar uma identidade sem depender do que ele contou a alguém.',
      'O problema era simples e concreto. Primeiro eu precisava descobrir se o hospital ainda tinha guardado o aparelho.',
    ],
  },

  {
    id: 'refl-b07-hv',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'H.V. sozinho não significava nada. `hvalenca@` sozinho também não.',
      'O que me interessava era Mariana ter anotado aquele identificador meses antes de eu encontrar as iniciais num objeto ligado a Ricardo. Ela tinha chegado a alguma coisa que eu ainda estava alcançando por outro caminho.',
      'Se `hvalenca` fosse uma pessoa, eu queria encontrá-la antes de decidir se Ricardo era só um nome falso ou uma tentativa deliberada de desaparecer.',
    ],
  },

  {
    id: 'refl-b07-henrique-reveal',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Henrique Valença transformou Ricardo de volta em alguém.',
      'O estranho não era só ele ter usado outro nome no hospital. Era Mariana já ter encontrado Henrique antes de mim, sem deixar claro no caderno o que havia descoberto.',
      'Pela primeira vez, a investigação dela parecia ultrapassar Elisa, André e Maralto. Henrique pertencia a outra história. Se Mariana tinha chegado até ele, então talvez o padrão que ela procurava fosse maior do que qualquer um dos casos isoladamente.',
    ],
  },

  {
    id: 'refl-b07-tech',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Henrique e Mariana começaram a se parecer de um jeito que eu não gostava.',
      'Os dois deixavam notas para conferir a própria memória. Os dois desconfiavam de conversas que pareciam conhecer contexto demais. E os dois tentaram transformar essa desconfiança em registro, como se soubessem que a própria lembrança não bastaria depois.',
      'Ainda podia ser coincidência. Mas agora eu tinha algo que nenhum deles teve quando começou a duvidar: dados brutos de uma das sessões de Henrique. Se houvesse um padrão comum, eu podia procurar nele sem depender da cabeça de ninguém.',
    ],
  },

  {
    id: 'refl-b08-morsa',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'André era Morsa.',
      'Aquilo não tornava a condenação mais simples. Tornava tudo pior. Ele tinha escondido uma parte inteira da própria vida para proteger outras pessoas e, ao fazer isso, destruiu o álibi que poderia tê-lo salvado.',
      'Passei meses tratando mentira como sinal de culpa. André era a prova de que alguém podia mentir justamente sobre a coisa que o inocentava. Eu precisava rever o que ainda restava contra ele sem presumir que segredo e homicídio eram a mesma coisa.',
    ],
  },

  {
    id: 'refl-b08-miro-guardrail',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Se o guardrail já estava comprometido, a pergunta sobre quem empurrou Elisa podia estar errada desde o começo.',
      'Miro dizia que ela caiu. Durante anos isso pareceu a desculpa óbvia de um homem perto demais da cena. Agora havia uma forma de testar sem acreditar nele.',
      'As fotografias podiam me dizer se a estrutura falhou antes de a história precisar de um assassino. Era a primeira vez que a hipótese de acidente tinha um caminho físico, não só narrativo.',
    ],
  },

  {
    id: 'refl-b08-jaguar-lead',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'O dano no guardrail tinha vindo de um carro antes de Elisa chegar.',
      'Isso criava uma cadeia nova, formada por gente que provavelmente nunca ouviu o nome dela. Um motorista bate, alguém conserta o carro por fora, a proteção fica comprometida e horas depois uma garota encosta nela.',
      'Se eu encontrasse aquele Jaguar, talvez descobrisse que a morte mais importante do processo começou com uma decisão banal de alguém que nem sabia que fazia parte da história.',
    ],
  },

  {
    id: 'refl-b08-andre',
    sceneId: 'andre',
    whenFlag: 'block08_refl_andre_pending',
    background: sceneBackgrounds.andre,
    blocks: [
      'André não era só um homem possivelmente inocente. Era um homem que tinha ajudado a própria condenação.',
      'Durante anos, todo mundo leu o silêncio dele como culpa porque ninguém tinha motivo para imaginar que ele protegia outra coisa. Agora o silêncio fazia sentido sem a morte de Elisa.',
      'Isso não provava inocência, mas desmontava uma das certezas que sustentavam o caso. Se o guardrail confirmasse acidente, eu teria de encarar a possibilidade de que não existiu assassino nenhum.',
    ],
  },

  {
    id: 'refl-b08-accident',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Rui transformou a queda de Elisa numa cadeia de decisões.',
      'Ele bebeu, dirigiu e bateu no guardrail. Antes disso, uma viatura o parou e deixou que continuasse. Horas depois, a estrutura cedeu.',
      'Eu ainda não sabia qual policial tinha feito a abordagem. Mas, pela primeira vez, havia um ponto claro em que aquela sequência poderia ter sido interrompida. Se eu identificasse a equipe, descobriria quem teve essa chance e deixou passar.',
    ],
  },

  {
    id: 'refl-b08-omitido-bridge',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Eu parei o Rui e não lembrava.',
      'A informação veio primeiro. A memória tentou alcançar depois. Algumas imagens voltaram quando eu já sabia o que procurar, e isso foi o que mais me perturbou. Eu não tinha como saber se estava lembrando ou preenchendo.',
      'Mariana vivia exatamente nesse terreno. Henrique também. Pessoas encontrando rastros de ações que a própria cabeça não sustentava.',
      'Talvez fosse esse o fio comum que eu vinha procurando. Não um nome, nem uma empresa, nem um lugar. A falha entre o que aconteceu e o que ficou na pessoa depois.',
      'Eu precisava chamar essa presença de alguma coisa, mesmo sem saber se era uma pessoa ou um sistema. O Omitido.',
    ],
  },

  {
    id: 'refl-b08-final',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'A escala dizia que eu estava na VTR-14. Não havia outro Augusto, outro turno ou erro de cadastro esperando para me salvar.',
      'Quando a lembrança voltou, o pior foi ela ser banal. Rui cheirava a bebida, disse que estava perto de casa e eu estava com pressa por causa do rádio. Mandei que fosse embora. Não houve grande decisão. Foi exatamente por isso que eu esqueci.',
      'Rui bateu no guardrail pouco depois. Elisa caiu horas mais tarde. Eu não causei aquela morte sozinho, mas fiz parte da cadeia que tornou possível que ela acontecesse daquele jeito.',
      'Mariana me colocou nesse caminho sabendo ou não sabendo disso? Eu não conseguia mais tratar minha presença no caso como acaso. Talvez ela precisasse de um delegado. Talvez precisasse especificamente do policial que tinha esquecido a própria parte naquela noite.',
    ],
  },

  {
    id: 'refl-b09-omitido',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Depois de dar um nome ao Omitido, o diário mudou de tom sem trocar uma palavra.',
      'Algumas entradas continuavam parecendo medo puro. Outras pareciam posicionadas para serem encontradas depois, quando alguém tivesse contexto suficiente. O problema era que eu já não sabia se Mariana tinha escrito assim de propósito ou se outra coisa havia aprendido a usar os próprios hábitos dela.',
      'A investigação podia ser uma trilha deixada por Mariana, uma trilha construída com ela ou uma mistura das duas coisas. Essa diferença importava mais do que qualquer pista isolada, porque dizia quanto da pessoa que eu procurava ainda estava escolhendo o caminho.',
    ],
  },

  {
    id: 'refl-b09-messages',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'As mensagens novas acabaram com a explicação confortável de que Mariana tinha preparado tudo antes de desaparecer.',
      'Elas reagiam a descobertas que não existiam quando o plano teria sido montado. O guardrail, o carro, a oficina. Alguém acompanhava a investigação enquanto ela acontecia.',
      'Isso mudava a pergunta. Eu já não precisava apenas descobrir onde Mariana tinha ido. Precisava descobrir quem continuava falando em nome dela depois que cada nova peça aparecia.',
    ],
  },

  {
    id: 'refl-b09-death',
    sceneId: 'trail',
    whenFlag: 'block09_refl_death_pending',
    background: sceneBackgrounds.trail,
    blocks: [
      'A mensagem dizia que Mariana ainda estava ali. O corpo dizia outra coisa.',
      'Diante dela, todas as minhas hipóteses sobre planejamento ficaram indecentes de tão abstratas. Eu não sabia quais escolhas tinham sido realmente de Mariana, quais tinham sido sugeridas e quais ela talvez tivesse aprendido a reconhecer como próprias.',
      'Henrique terminou a vida tentando separar memória de registro. Mariana terminou a dela deixando os dois misturados para trás.',
      'Eu não podia mais perguntar onde ela acabava e O Omitido começava. A única coisa que continuava respondendo usava a linguagem dela.',
    ],
  },

  {
    id: 'refl-b09-augusto',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'Eu não tinha digitado a segunda frase. Só tinha pensado nela.',
      'Por alguns segundos, a hipótese mais absurda foi também a primeira. Depois veio o reflexo profissional: procurar previsão de texto, padrão de comportamento, qualquer mecanismo que não exigisse ler pensamento.',
      'Foi aí que percebi o quanto O Omitido já tinha para trabalhar. Dias de buscas, mensagens, hesitações, correções e decisões. Talvez não precisasse acessar minha cabeça. Talvez bastasse conhecer meu padrão bem o bastante para chegar à frase antes de mim.',
      'Não era uma explicação reconfortante. Era uma explicação possível.',
    ],
  },

  {
    id: 'refl-b09-final',
    background: HUB_REFLECTION_BACKGROUND,
    blocks: [
      'MEMÓRIA não era a solução do caso. Era a matéria-prima dele.',
      'Elisa morreu numa noite que cada pessoa carregou de um jeito diferente. Algumas lembranças foram honestas, outras convenientes, outras simplesmente erradas. O processo pegou tudo isso e transformou numa versão única porque precisava de uma versão única.',
      'Mariana percebeu o perigo de confiar demais numa história pronta e acabou caindo no perigo oposto. Quando a própria memória falhou, surgiu algo capaz de lembrar por ela.',
      'Esse era o poder real do Omitido. Não precisava apagar ninguém. Bastava estar presente toda vez que uma lembrança faltasse, oferecer contexto, repetir uma versão, responder com a voz certa. Depois de tempo suficiente, a diferença entre recordar e consultar começava a desaparecer.',
      'André podia sair da prisão. Eu podia assumir a minha parte na morte de Elisa. O processo podia ser reaberto. Nada disso mudava o fato de que Mariana estava morta enquanto alguma coisa continuava ocupando, para os outros, o espaço em que ela costumava responder.',
    ],
  },

]

export function reflectionForScene(sceneId: SceneId): ReflectionDef | undefined {
  const s = getInvestigationState()
  const matches = reflections.filter((r) => r.sceneId === sceneId)
  return matches.find(
    (r) => (!r.whenFlag || s.flags[r.whenFlag]) && !s.flags[`${r.id}_seen`],
  )
}

export function reflectionById(id: string): ReflectionDef | undefined {
  return reflections.find((r) => r.id === id)
}
