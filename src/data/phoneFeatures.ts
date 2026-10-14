/** Central locks — flip to false later to enable interactions. */
export const phoneFeatureLocks = {
  composerText: true,
  composerSend: true,
  attachmentClip: true,
  cameraButton: true,
  stickerButton: true,
  voiceCall: true,
  videoCall: true,
  whatsappUpdates: true,
  whatsappCommunities: true,
  whatsappNewChat: true,
} as const
