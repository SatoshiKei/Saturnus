import type { Document } from '../../game/types'

export const seedDocuments: Document[] = [
  {
    id: 'doc-bo-inicial',
    title: 'Boletim de ocorrência — desaparecimento',
    category: 'BO',
    blocks: [
      {
        id: 'b1',
        text: 'Mariana Silva, 26 anos, enfermeira, não compareceu ao plantão previsto para 07:00.',
      },
      {
        id: 'b2',
        text: 'Às 07:18, a colega Júlia Martins tentou contato telefônico sem resposta. Às 07:46, Júlia contatou Diego Azevedo, vizinho de Mariana, para verificar o apartamento. Diego tocou a campainha e bateu à porta, sem resposta.',
      },
      {
        id: 'b3',
        text: 'Às 08:03, a central de emergência recebeu uma chamada identificada pelo sistema como originada do número de Mariana. A gravação estava degradada; o operador compreendeu pedido de ajuda, ruído intenso e interrupção abrupta. Viatura enviada ao endereço.',
      },
      {
        id: 'b4',
        text: 'No local, ninguém respondeu. Diante da chamada, da ausência inexplicada e dos relatos, a equipe realizou entrada forçada. Mariana não foi encontrada. Não havia sinais evidentes de luta.',
      },
      {
        id: 'b5',
        text: 'O celular pessoal de Mariana foi encontrado no apartamento, ligado e sem bloqueio de tela. O número associado ao aparelho era o mesmo registrado como origem da chamada de emergência.',
      },
    ],
  },
]
