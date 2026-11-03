# Phone system

Dois dispositivos via `GameHubContext.phoneDevice`.

## Mariana

Apps base em `createInitialPhoneState('mariana')`. Loja: busca manual (`AppStoreView`) — sem listagem completa.

- Diário: app `hidden-diary`, oculto até `revealHiddenApps()` (Ajustes → armazenamento).
- Senha do diário: puzzle futuro; dev usa `discoverPassword: diary` + `demo-diary` temporário.
- Senha da conta (App Store): `discoverPassword: marianaAccount` + `demo-account` temporário.
- WaveLab Mobile: instalar da loja; processa `rafael_audio_protected`.

## Augusto

WhatsApp/contatos separados (`augustoVisibleChats`). Não usar aparelho de Mariana para testemunhas.

## Chats

Visibilidade: `phones.*.unlockedChatIds`. Dados: `src/data/mockChats.ts`.
