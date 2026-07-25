import type { MediaSource } from '@/types/media';

/**
 * Registro manual de fuentes de vídeo autorizadas.
 *
 * Cada título actual del catálogo tiene abajo su bloque con nombre, tipo e ID.
 * Descomenta su línea y sustituye la URL de ejemplo. Para películas, añade
 * una fuente por ID. Para series, la fuente por ID será la predeterminada;
 * un episodio concreto usa la clave `${titleId}:${episodeId}` y tiene prioridad.
 *
 * No incluyas tokens ni URLs firmadas con secretos en el repositorio. Si el
 * proveedor los exige, entrega la fuente desde un backend autorizado.
 */
export const mediaSources: Readonly<Record<string, MediaSource>> = {
  // Serie: "7de Laan" — ID: 17887
  // '17887': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "9 Songs" — ID: 27
  // '27': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Agente Kim reactivado" — ID: 296206
  // '296206': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "All Elite Wrestling: Collision" — ID: 226687
  // '226687': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Amor Redentor" — ID: 698508
  // '698508': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Arcane" — ID: 94605
  // '94605': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Así aprenderás" — ID: 276161
  // '276161': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Au Bonheur des Dames" — ID: 47612
  // '47612': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Avatar: Aang, El último Maestro Aire" — ID: 980431
  // '980431': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Avatar: Fuego y ceniza" — ID: 83533
  // '83533': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Avatar: La leyenda de Aang" — ID: 82452
  // '82452': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Avatar: La leyenda de Aang" — ID: 246
  // '246': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Avengers: Doomsday" — ID: 1003596
  // '1003596': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Ayrılıq imiş" — ID: 1534239
  // '1534239': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Backrooms: Sin salida" — ID: 1083381
  // '1083381': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Bastardos sin gloria" — ID: 16869
  // '16869': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Batman" — ID: 414906
  // '414906': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Binnelanders" — ID: 206559
  // '206559': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Black Box" — ID: 1321008
  // '1321008': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Black Mirror" — ID: 42009
  // '42009': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Bohemian Rhapsody" — ID: 424694
  // '424694': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Bokshi" — ID: 718833
  // '718833': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Bosco d'amore" — ID: 204407
  // '204407': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Boulevard" — ID: 1595852
  // '1595852': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Breaking Bad" — ID: 1396
  // '1396': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "C.I.D" — ID: 15226
  // '15226': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "CentoVetrine" — ID: 80318
  // '80318': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Coco" — ID: 354912
  // '354912': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Contéstame 1988" — ID: 64010
  // '64010': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Corazones De Hierro" — ID: 228150
  // '228150': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Cowboys & Aliens" — ID: 49849
  // '49849': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Criaturas luminosas" — ID: 1330021
  // '1330021': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Cruzada" — ID: 1495
  // '1495': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Culpa mía" — ID: 1010581
  // '1010581': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Demain nous appartient" — ID: 72879
  // '72879': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Demon Slayer: Kimetsu no Yaiba Castillo infinito" — ID: 1311031
  // '1311031': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Demonio Ancestral" — ID: 1451078
  // '1451078': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Descendientes: Un malvado País de las Maravillas" — ID: 1318621
  // '1318621': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Deseo" — ID: 1668364
  // '1668364': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Django sin Cadenas" — ID: 68718
  // '68718': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Doctor Who" — ID: 57243
  // '57243': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Doraemon" — ID: 57911
  // '57911': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Doraemon, el gato cósmico" — ID: 65733
  // '65733': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Dunkerque" — ID: 374720
  // '374720': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "EastEnders" — ID: 1871
  // '1871': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Egoli: Place of Gold" — ID: 12415
  // '12415': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Bueno, El Malo y El Feo" — ID: 429
  // '429': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El código enigma" — ID: 205596
  // '205596': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Día D: Bajo presión" — ID: 1318413
  // '1318413': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El día de la revelación" — ID: 1275779
  // '1275779': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El diablo viste a la moda 2" — ID: 1314481
  // '1314481': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Drama" — ID: 1325734
  // '1325734': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Guardaespaldas" — ID: 619
  // '619': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El Halcón" — ID: 254528
  // '254528': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El nuevo show del Pájaro Loco" — ID: 9980
  // '9980': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El palacio del este" — ID: 279323
  // '279323': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Pasajero Del Diablo" — ID: 1368314
  // '1368314': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El polígamo" — ID: 322430
  // '322430': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El Señor de los Cielos" — ID: 44953
  // '44953': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "El Último Conquistador" — ID: 1207162
  // '1207162': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "El Último Reino" — ID: 63333
  // '63333': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Enola Holmes 3" — ID: 1202033
  // '1202033': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Equipo Demolición" — ID: 1168190
  // '1168190': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Equipo Seal" — ID: 71789
  // '71789': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Érase una vez en el Oeste" — ID: 335
  // '335': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Está Detrás De Ti" — ID: 270303
  // '270303': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Estación Zombie: tren a Busan" — ID: 396535
  // '396535': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Evil Dead: En llamas" — ID: 1212763
  // '1212763': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Fauda" — ID: 69557
  // '69557': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "For All Mankind" — ID: 87917
  // '87917': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Forgive Us All" — ID: 1443894
  // '1443894': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Frieren: Más allá del final del viaje" — ID: 209867
  // '209867': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "From" — ID: 124364
  // '124364': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Game of Thrones" — ID: 1399
  // '1399': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Goede Tijden, Slechte Tijden" — ID: 11890
  // '11890': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Golden Kamuy: Asalto a la prisión de Abashiri" — ID: 1397201
  // '1397201': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Guerrero del Desierto" — ID: 898704
  // '898704': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Gute Zeiten, schlechte Zeiten" — ID: 13945
  // '13945': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Hasta el Último Hombre" — ID: 324786
  // '324786': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Heartstopper Forever" — ID: 1468683
  // '1468683': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Hermanito" — ID: 1397385
  // '1397385': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Hogan's Heroes" — ID: 4068
  // '4068': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Holby City" — ID: 1028
  // '1028': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Homeland" — ID: 1407
  // '1407': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Hope" — ID: 1058424
  // '1058424': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Hoppers: Operación castor" — ID: 1327819
  // '1327819': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Il frullo del passero" — ID: 200066
  // '200066': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Impacto Mortal" — ID: 1127384
  // '1127384': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Kraken" — ID: 1110034
  // '1110034': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Kuruluş Osman" — ID: 95603
  // '95603': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "L.A. Law" — ID: 732
  // '732': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "La casa del dragón" — ID: 94997
  // '94997': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La doncella" — ID: 290098
  // '290098': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La Empleada" — ID: 1368166
  // '1368166': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La Lista de Schindler" — ID: 424
  // '424': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La Odisea" — ID: 1368337
  // '1368337': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La Odisea: El Regreso" — ID: 975511
  // '975511': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "La posesión de la momia" — ID: 1304313
  // '1304313': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Las guerreras k-pop" — ID: 803796
  // '803796': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Las nuevas aventuras de Rocki y sus amigos" — ID: 1025
  // '1025': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Las ovejas detectives" — ID: 1301421
  // '1301421': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "LEGO Ninjago: El ascenso de los dragones" — ID: 212989
  // '212989': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Letras Robadas" — ID: 1284016
  // '1284016': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Los 8 Más Odiados" — ID: 273248
  // '273248': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Los elegidos" — ID: 85077
  // '85077': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Los siete magníficos" — ID: 966
  // '966': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Los Simpson: Simpsley" — ID: 1725116
  // '1725116': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Lucifer" — ID: 63174
  // '63174': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Maddie + Triggs" — ID: 257723
  // '257723': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Malhação" — ID: 14424
  // '14424': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Más que rivales" — ID: 301507
  // '301507': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Mash" — ID: 918
  // '918': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Mensajes de voz para Isabelle" — ID: 614945
  // '614945': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Michael" — ID: 936075
  // '936075': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Minions & Monstruos" — ID: 1315772
  // '1315772': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Miraculous: Las aventuras de Ladybug" — ID: 65334
  // '65334': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Moana" — ID: 1108427
  // '1108427': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Moana 2" — ID: 1241982
  // '1241982': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Mortal Kombat II" — ID: 931285
  // '931285': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Muerte en el Nilo" — ID: 505026
  // '505026': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Mushoku Tensei Jobless Reincarnation" — ID: 94664
  // '94664': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "My Wife Has No Emotion" — ID: 250596
  // '250596': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "NCIS: Criminología Naval" — ID: 4614
  // '4614': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "New Looney Tunes" — ID: 65763
  // '65763': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Night of the Living Dead" — ID: 1645603
  // '1645603': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Obsesión" — ID: 1339713
  // '1339713': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Obsesión" — ID: 11012
  // '11012': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Off Campus" — ID: 273240
  // '273240': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "One Piece" — ID: 37854
  // '37854': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Operativo: Lioness" — ID: 113962
  // '113962': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Oppenheimer" — ID: 872585
  // '872585': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Oscar Shaw" — ID: 1601243
  // '1601243': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Oshin" — ID: 6231
  // '6231': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Parásitos" — ID: 496243
  // '496243': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Paw Patrol: Patrulla de Cachorros" — ID: 57532
  // '57532': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Peligrosa Obsesión" — ID: 269955
  // '269955': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Peppa Pig" — ID: 12225
  // '12225': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Primitive War" — ID: 1257009
  // '1257009': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Proyecto Fin del Mundo" — ID: 687163
  // '687163': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Rancho Dutton" — ID: 299167
  // '299167': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Rango" — ID: 44896
  // '44896': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Re:ZERO -Starting Life in Another World-" — ID: 65942
  // '65942': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Rescatando al soldado Ryan" — ID: 857
  // '857': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Revenant: El renacido" — ID: 281957
  // '281957': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Rick y Morty" — ID: 60625
  // '60625': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Rugrats: Aventuras en Pañales" — ID: 3022
  // '3022': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Rush: Cinema Strangiato - R40+ Director's Cut" — ID: 872712
  // '872712': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Scary Movie: Terroríficamente incorrecta" — ID: 1273221
  // '1273221': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Sesame Street: Plaza Sésamo" — ID: 502
  // '502': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Si la vida te da mandarinas..." — ID: 219246
  // '219246': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Silo" — ID: 125988
  // '125988': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Sin lugar para los débiles" — ID: 6977
  // '6977': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Sing 2: ¡Ven y Canta de Nuevo!" — ID: 438695
  // '438695': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Soul" — ID: 508442
  // '508442': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Spider-Man: Un nuevo día" — ID: 969681
  // '969681': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Star Wars: The Mandalorian and Grogu" — ID: 1228710
  // '1228710': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Stop! That! Train!" — ID: 1541560
  // '1541560': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Stranger Things" — ID: 66732
  // '66732': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Sturm der Liebe" — ID: 45789
  // '45789': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Su precio... unos dólares" — ID: 352821
  // '352821': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Super Mario Galaxy: La película" — ID: 1226863
  // '1226863': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Supergirl" — ID: 1081003
  // '1081003': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Supernatural" — ID: 1622
  // '1622': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Te encontraré" — ID: 278178
  // '278178': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The Boys" — ID: 76479
  // '76479': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "The Furious" — ID: 1280738
  // '1280738': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The Loud House" — ID: 68073
  // '68073': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The Misfit of Demon King Academy" — ID: 97617
  // '97617': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The Pacific" — ID: 16997
  // '16997': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The Witcher" — ID: 71912
  // '71912': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "The WONDERfools" — ID: 259837
  // '259837': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Toy Story 5" — ID: 1084244
  // '1084244': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Trolls 2: Gira Mundial" — ID: 446893
  // '446893': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Troya" — ID: 652
  // '652': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Tu corazón será destrozado" — ID: 1523145
  // '1523145': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Untitled" — ID: 2122
  // '2122': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Untitled" — ID: 298610
  // '298610': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Untitled" — ID: 278624
  // '278624': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Untitled" — ID: 321564
  // '321564': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Untitled" — ID: 289139
  // '289139': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Vikings" — ID: 44217
  // '44217': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Warmth of Love" — ID: 1285366
  // '1285366': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "Westworld" — ID: 63247
  // '63247': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Whiplash: Música y Obsesión" — ID: 244786
  // '244786': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Serie: "WWE Raw" — ID: 4656
  // '4656': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Zombies of the Third Reich" — ID: 1301310
  // '1301310': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Zona Cero" — ID: 1375646
  // '1375646': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "Zootopia 2" — ID: 1084242
  // '1084242': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "ਸਤਲੁਜ" — ID: 1155818
  // '1155818': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "இதயம் முரளி" — ID: 1432631
  // '1432631': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "꿈" — ID: 350004
  // '350004': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "버려진 청춘" — ID: 479787
  // '479787': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "오케이 마담" — ID: 599335
  // '599335': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "三国第一部：争洛阳" — ID: 1671541
  // '1671541': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "功夫女足" — ID: 1491920
  // '1491920': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "四大名妓之李香君" — ID: 1123261
  // '1123261': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },

  // Película: "抓特务" — ID: 1305672
  // '1305672': { kind: 'hls', url: 'PEGA_AQUI_LA_URL_AUTORIZADA.m3u8' },
};

export function mediaSourceKey(titleId: string, episodeId?: string): string {
  return episodeId ? `${titleId}:${episodeId}` : titleId;
}

export function getLocalMediaSource(titleId: string, episodeId?: string): MediaSource | undefined {
  return mediaSources[mediaSourceKey(titleId, episodeId)] ?? mediaSources[titleId];
}
