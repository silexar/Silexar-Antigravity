/**
 * 🏷️ DOMAIN TYPE: TipoMaterial
 * 
 * Define los tipos de materiales creativos soportados por el sistema de reconocimiento.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export type TipoMaterial = 
  | 'audio_pregrabado'   // Spot comercial estándar
  | 'mencion_vivo'       // Locutor hablando en tiempo real
  | 'presentacion'       // Intro de programa
  | 'cierre'             // Outro de programa
  | 'cortina'            // Música de fondo/separador
  | 'display_banner'     // [DIGITAL] Banner web/app
  | 'video_vast'         // [DIGITAL] Video Pre/Mid/Post-roll
  | 'audio_digital';     // [DIGITAL] Audio Ad (Spotify/Podcast)
