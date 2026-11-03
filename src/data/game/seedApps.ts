import type { AppDefinition } from '../../game/types'

export const appDefinitions: AppDefinition[] = [
  { id: 'whatsapp', name: 'Conversas', device: 'both', preinstalled: true },
  { id: 'phone', name: 'Telefone', device: 'both', preinstalled: true },
  { id: 'notes', name: 'Notas', device: 'mariana', preinstalled: true },
  { id: 'photos', name: 'Fotos', device: 'mariana', preinstalled: true },
  { id: 'files', name: 'Arquivos', device: 'mariana', preinstalled: true },
  { id: 'recorder', name: 'Gravador', device: 'mariana', preinstalled: true },
  { id: 'browser', name: 'Navegador', device: 'mariana', preinstalled: true },
  { id: 'appstore', name: 'Loja de apps', device: 'mariana', preinstalled: true },
  { id: 'settings', name: 'Ajustes', device: 'both', preinstalled: true },
  { id: 'calendar', name: 'Calendário', device: 'mariana', preinstalled: true },
  {
    id: 'hidden-diary',
    name: 'Diário',
    device: 'mariana',
    hiddenByDefault: true,
    preinstalled: true,
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
