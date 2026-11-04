import type { AppDefinition } from '../../game/types'

/**
 * Apps dos dois aparelhos. Apps comuns sem função narrativa (câmera, mail, mapas…) existem para o
 * celular parecer um celular de verdade: tocar neles não faz nada (sem “bloqueado”).
 *
 * `hidden-diary` NÃO aparece no launcher em nenhuma circunstância: o acesso é forense (módulo
 * Perícia do computador) e exige o PIN recuperado dos seis áudios.
 */
export const appDefinitions: AppDefinition[] = [
  { id: 'phone', name: 'Telefone', device: 'both', preinstalled: true },
  { id: 'messages', name: 'Mensagens', device: 'both', preinstalled: true },
  { id: 'whatsapp', name: 'WhatsApp', device: 'both', preinstalled: true },
  { id: 'camera', name: 'Câmera', device: 'both', preinstalled: true },
  { id: 'photos', name: 'Fotos', device: 'both', preinstalled: true },
  { id: 'mail', name: 'Mail', device: 'both', preinstalled: true },
  { id: 'maps', name: 'Mapas', device: 'both', preinstalled: true },
  { id: 'calendar', name: 'Calendário', device: 'both', preinstalled: true },
  { id: 'clock', name: 'Relógio', device: 'both', preinstalled: true },
  { id: 'calculator', name: 'Calculadora', device: 'both', preinstalled: true },
  { id: 'notes', name: 'Notas', device: 'both', preinstalled: true },
  { id: 'weather', name: 'Clima', device: 'both', preinstalled: true },
  { id: 'files', name: 'Arquivos', device: 'both', preinstalled: true },
  { id: 'settings', name: 'Ajustes', device: 'both', preinstalled: true },
  { id: 'recorder', name: 'Gravador', device: 'mariana', preinstalled: true },
  { id: 'browser', name: 'Navegador', device: 'mariana', preinstalled: true },
  { id: 'appstore', name: 'Loja de apps', device: 'mariana', preinstalled: true },
  {
    id: 'hidden-diary',
    name: 'Diário',
    device: 'mariana',
    hiddenByDefault: true,
    preinstalled: false,
  },
  {
    id: 'wavelab-mobile',
    name: 'WaveLab Mobile',
    device: 'mariana',
    searchableInStore: true,
    storeKeywords: ['wavelab', 'wave', 'audio', 'lab'],
    narrativeDescription: 'Processamento de áudio no dispositivo',
  },
]
