import { BIBLE_BOOKS, CATEGORY_LABELS } from '../constants';
import { BibleBook } from '../types';

export interface CategoryProgress {
  category: string;
  label: string;
  totalChapters: number;
  completedChapters: number;
  percentage: number;
  color: string;
  testament: 'AT' | 'NT';
}

export interface CanonicalProgressStats {
  totalBibleChapters: number;
  totalCompleted: number;
  overallPercentage: number;
  otTotalChapters: number;
  otCompleted: number;
  otPercentage: number;
  ntTotalChapters: number;
  ntCompleted: number;
  ntPercentage: number;
  estimatedHoursRemaining: number;
  categories: CategoryProgress[];
}

export interface HeatmapDay {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  isToday: boolean;
  isActive: boolean;
  intensity: 0 | 1 | 2 | 3;
}

export interface CovenantTimelineItem {
  id: string;
  order: number;
  name: string;
  biblicalEra: string;
  mediator: string;
  scripture: string;
  sign: string;
  promise: string;
  christologicalFulfillment: string;
  theologicalSignificance: string;
  color: string;
  iconName: string;
}

export interface TabernacleStation {
  id: string;
  number: number;
  zone: 'Atrio Exterior' | 'Lugar Santo' | 'Lugar Santísimo';
  name: string;
  hebrewName: string;
  scripture: string;
  materials: string;
  priestlyFunction: string;
  christologicalShadow: string;
  spiritualMeaning: string;
  svgPosition: { x: number; y: number };
}

/**
 * Motor Orientado a Objetos (POO) para la generación de gráficos, métricas canónicas,
 * visualizaciones de cronología y mapas sagrados del estudio bíblico.
 */
export class BiblicalGraphicsEngine {
  private static instance: BiblicalGraphicsEngine;

  private categoryColors: Record<string, string> = {
    law: '#D97706',           // Ámbar dorado
    history: '#2563EB',       // Azul zafiro
    poetry: '#7C3AED',        // Púrpura real
    prophets_major: '#DC2626',// Carmesí profético
    prophets_minor: '#EA580C',// Naranja fuego
    gospels: '#059669',       // Esmeralda de vida
    church_history: '#0D9488',// Turquesa misionero
    letters: '#4F46E5',       // Índigo apostólico
    prophecy: '#B91C1C'       // Escarlata de juicio y gloria
  };

  public constructor() {}

  public static getInstance(): BiblicalGraphicsEngine {
    if (!BiblicalGraphicsEngine.instance) {
      BiblicalGraphicsEngine.instance = new BiblicalGraphicsEngine();
    }
    return BiblicalGraphicsEngine.instance;
  }

  /**
   * Obtiene la lista completa de libros con sus metadatos.
   */
  public getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  }

  /**
   * Calcula las estadísticas detalladas de lectura canónica en la Biblia completa.
   */
  public calculateCanonicalProgress(completedChapterKeys: string[] = []): CanonicalProgressStats {
    const completedSet = new Set(completedChapterKeys);
    let otTotal = 0;
    let otDone = 0;
    let ntTotal = 0;
    let ntDone = 0;

    const categoryMap = new Map<string, { total: number; completed: number; testament: 'AT' | 'NT' }>();

    for (const book of BIBLE_BOOKS) {
      const isNT = ['gospels', 'church_history', 'letters', 'prophecy'].includes(book.category);
      const testament: 'AT' | 'NT' = isNT ? 'NT' : 'AT';

      let bookDone = 0;
      for (let ch = 1; ch <= book.chapters; ch++) {
        const key = `${book.name}-${ch}`;
        if (completedSet.has(key)) {
          bookDone++;
        }
      }

      if (isNT) {
        ntTotal += book.chapters;
        ntDone += bookDone;
      } else {
        otTotal += book.chapters;
        otDone += bookDone;
      }

      const existing = categoryMap.get(book.category) || { total: 0, completed: 0, testament };
      existing.total += book.chapters;
      existing.completed += bookDone;
      categoryMap.set(book.category, existing);
    }

    const totalBible = otTotal + ntTotal;
    const totalCompleted = otDone + ntDone;
    const remainingChapters = Math.max(0, totalBible - totalCompleted);
    // Asumiendo ~4 minutos de lectura meditada por capítulo
    const estimatedHoursRemaining = Math.round((remainingChapters * 4) / 60);

    const categories: CategoryProgress[] = [];
    categoryMap.forEach((val, cat) => {
      categories.push({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        totalChapters: val.total,
        completedChapters: val.completed,
        percentage: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
        color: this.categoryColors[cat] || '#888888',
        testament: val.testament
      });
    });

    return {
      totalBibleChapters: totalBible,
      totalCompleted,
      overallPercentage: totalBible > 0 ? Math.round((totalCompleted / totalBible) * 100) : 0,
      otTotalChapters: otTotal,
      otCompleted: otDone,
      otPercentage: otTotal > 0 ? Math.round((otDone / otTotal) * 100) : 0,
      ntTotalChapters: ntTotal,
      ntCompleted: ntDone,
      ntPercentage: ntTotal > 0 ? Math.round((ntDone / ntTotal) * 100) : 0,
      estimatedHoursRemaining,
      categories
    };
  }

  /**
   * Genera la matriz de calor (heatmap) para los últimos N días de consistencia espiritual.
   */
  public generateActivityHeatmap(completedDays: string[] = [], daysCount: number = 28): HeatmapDay[] {
    const daysSet = new Set(completedDays);
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const result: HeatmapDay[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const isActive = daysSet.has(iso);

      let intensity: 0 | 1 | 2 | 3 = 0;
      if (isActive) {
        intensity = 3;
      }

      result.push({
        date: iso,
        dayOfMonth: d.getDate(),
        dayOfWeek: d.getDay(),
        isToday: iso === todayISO,
        isActive,
        intensity
      });
    }

    return result;
  }

  /**
   * Retorna los datos teológicos estructurados para el gráfico interactivo de la Cronología de los Pactos.
   */
  public getCovenantTimelineData(): CovenantTimelineItem[] {
    return [
      {
        id: 'adamic',
        order: 1,
        name: 'Pacto Edénico & Adámico',
        biblicalEra: 'La Creación y la Caída (~4000 a.C.)',
        mediator: 'Adán (Representante Federal)',
        scripture: 'Génesis 1:28; 3:15 (Protoevangelio)',
        sign: 'El Árbol de la Vida / Vestiduras de Piel',
        promise: 'Dominio sobre la creación y la promesa de la Simiente que aplastará la cabeza de la serpiente.',
        christologicalFulfillment: 'Cristo es el Postrer Adán (1 Corintios 15:45) que vence donde el primer Adán cayó y deshace las obras del diablo.',
        theologicalSignificance: 'Fundamento de la antropología bíblica y origen de la promesa de redención por gracia.',
        color: '#D97706',
        iconName: 'Sparkles'
      },
      {
        id: 'noachic',
        order: 2,
        name: 'Pacto Noéico',
        biblicalEra: 'El Diluvio y la Preservación (~2400 a.C.)',
        mediator: 'Noé (Hombre Justo)',
        scripture: 'Génesis 9:8-17',
        sign: 'El Arcoíris en las Nubes',
        promise: 'Dios nunca más destruirá toda carne con diluvio de aguas; orden y estabilidad cósmica para la historia.',
        christologicalFulfillment: 'Cristo es el Arca eterna en quien los elegidos son preservados del juicio de la ira divina (1 Pedro 3:20-21).',
        theologicalSignificance: 'Pacto de gracia común que preserva el escenario histórico para que opere la redención.',
        color: '#2563EB',
        iconName: 'Shield'
      },
      {
        id: 'abrahamic',
        order: 3,
        name: 'Pacto Abrahámico',
        biblicalEra: 'La Elección y la Promesa (~2000 a.C.)',
        mediator: 'Abraham (Padre de la Fe)',
        scripture: 'Génesis 12:1-3; 15:1-18; 17:1-8',
        sign: 'La Circuncisión de la Carne',
        promise: 'Tierra prometida, descendencia incontable como las estrellas y bendición a todas las familias de la tierra.',
        christologicalFulfillment: 'La simiente singular es Cristo (Gálatas 3:16). Todo el que cree es hijo de Abraham e hijo de la promesa.',
        theologicalSignificance: 'Pacto incondicional fundamentado únicamente en la fidelidad jurada de Jehová.',
        color: '#059669',
        iconName: 'Star'
      },
      {
        id: 'mosaic',
        order: 4,
        name: 'Pacto Mosaico (Sinaí)',
        biblicalEra: 'El Éxodo y la Ley (~1446 a.C.)',
        mediator: 'Moisés (Profeta y Caudillo)',
        scripture: 'Éxodo 19-24; Deuteronomio 28',
        sign: 'Las Tablas del Testimonio & El Shabat',
        promise: 'Reino de sacerdotes y gente santa; bendición por obediencia y maldición por quebrantar la ley.',
        christologicalFulfillment: 'Cristo cumplió perfectamente toda la ley moral y ceremonial (Mateo 5:17) y nos rescató de la maldición (Gálatas 3:13).',
        theologicalSignificance: 'Muestra la santidad inmutable de Dios, la gravedad del pecado y actúa como ayo que nos lleva a Cristo.',
        color: '#DC2626',
        iconName: 'Scroll'
      },
      {
        id: 'davidic',
        order: 5,
        name: 'Pacto Davídico',
        biblicalEra: 'La Monarquía Teocrática (~1000 a.C.)',
        mediator: 'David (Rey conforme al Corazón de Dios)',
        scripture: '2 Samuel 7:12-16; Salmo 89',
        sign: 'El Trono y la Corona Perpetua',
        promise: 'Un linaje real eterno y una dinastía cuyo trono jamás será removido.',
        christologicalFulfillment: 'Jesús nació del linaje de David (Lucas 1:32-33) y reina eternamente a la diestra del Padre.',
        theologicalSignificance: 'Establece la dimensión monárquica del Reino Mesiánico escatológico.',
        color: '#7C3AED',
        iconName: 'Crown'
      },
      {
        id: 'new_covenant',
        order: 6,
        name: 'El Nuevo Pacto',
        biblicalEra: 'La Gracia y Consumación Eterna (Siglo I d.C. - Eternidad)',
        mediator: 'Jesucristo (Hijo de Dios y Sumo Sacerdote)',
        scripture: 'Jeremías 31:31-34; Lucas 22:20; Hebreos 8:6-13',
        sign: 'La Santa Cena (Pan y Copa) & El Sello del Espíritu Santo',
        promise: 'Perdón total de pecados, la ley escrita en los corazones, reconciliación definitiva y vida eterna.',
        christologicalFulfillment: 'Sellado con la preciosa sangre de Cristo en la cruz del Calvario: "Consumado es".',
        theologicalSignificance: 'La cúspide y cumplimiento glorioso de toda la revelación divina; un pacto eterno e indestructible.',
        color: '#B45309',
        iconName: 'Flame'
      }
    ];
  }

  /**
   * Retorna los datos y coordenadas para el Diagrama Gráfico del Tabernáculo de Moisés.
   */
  public getTabernacleBlueprint(): TabernacleStation[] {
    return [
      {
        id: 'gate',
        number: 1,
        zone: 'Atrio Exterior',
        name: 'La Puerta del Atrio',
        hebrewName: 'Shaar Hejatsér',
        scripture: 'Éxodo 27:16; Juan 10:9',
        materials: 'Cortina de azul, púrpura, carmesí y lino torcido bordado (20 codos)',
        priestlyFunction: 'Único punto de acceso para el pueblo y los sacerdotes al santuario de Dios.',
        christologicalShadow: 'Jesús declara: "Yo soy la puerta; el que por mí entrare, será salvo". No hay otro acceso al Padre.',
        spiritualMeaning: 'La exclusividad y generosidad de la salvación abierta para todo aquel que cree.',
        svgPosition: { x: 50, y: 92 }
      },
      {
        id: 'brazen_altar',
        number: 2,
        zone: 'Atrio Exterior',
        name: 'El Altar del Holocausto (Bronce)',
        hebrewName: 'Mizbéaj HaNejóshet',
        scripture: 'Éxodo 27:1-8; Hebreos 9:14',
        materials: 'Madera de acacia recubierta con bronce resistente al fuego constante',
        priestlyFunction: 'Donde se ofrecían los sacrificios de expiación con derramamiento de sangre.',
        christologicalShadow: 'La cruz del Calvario donde el Cordero de Dios cargó el castigo de nuestro pecado bajo la justicia de Dios.',
        spiritualMeaning: 'Sin derramamiento de sangre no se hace remisión de pecados; sustitución vicaria perfecta.',
        svgPosition: { x: 50, y: 72 }
      },
      {
        id: 'laver',
        number: 3,
        zone: 'Atrio Exterior',
        name: 'La Fuente de Bronce (Lavacro)',
        hebrewName: 'Kíyor HaNejóshet',
        scripture: 'Éxodo 30:17-21; Tito 3:5',
        materials: 'Bronce pulido fundido de los espejos donados por las mujeres devotas',
        priestlyFunction: 'Los sacerdotes debían lavarse las manos y pies antes de entrar al Lugar Santo para no morir.',
        christologicalShadow: 'El lavamiento de la regeneración por el Espíritu Santo y la purificación diaria por la Palabra.',
        spiritualMeaning: 'Santificación progresiva: ya justificados, necesitamos la purificación diaria de nuestras obras.',
        svgPosition: { x: 50, y: 55 }
      },
      {
        id: 'menorah',
        number: 4,
        zone: 'Lugar Santo',
        name: 'El Candelabro de Oro (Menorá)',
        hebrewName: 'Menorát Zaháv',
        scripture: 'Éxodo 25:31-40; Juan 8:12',
        materials: 'Un talento de oro puro labrado a martillo de una sola pieza, con 7 lámparas alimentadas de aceite puro de oliva',
        priestlyFunction: 'Iluminar el Lugar Santo día y noche; las mechas eran cuidadas perpetuamente.',
        christologicalShadow: 'Cristo como "La Luz del Mundo" y el Espíritu Santo con sus siete manifestaciones de sabiduría perfecta.',
        spiritualMeaning: 'Iluminación espiritual; sin Cristo andamos en tinieblas doctrinales y morales.',
        svgPosition: { x: 30, y: 38 }
      },
      {
        id: 'showbread',
        number: 5,
        zone: 'Lugar Santo',
        name: 'La Mesa de los Panes de la Proposición',
        hebrewName: 'Shulján Léjem Paním',
        scripture: 'Éxodo 25:23-30; Juan 6:35',
        materials: 'Madera de acacia recubierta de oro puro con una moldura de corona de oro alrededor',
        priestlyFunction: '12 tortas de flor de harina renovadas cada sábado, comidas por los sacerdotes.',
        christologicalShadow: 'Jesús como "El Pan de Vida descendido del cielo", comunión perpetua con las 12 tribus del pueblo de Dios.',
        spiritualMeaning: 'Comunión íntima y sustento espiritual que Dios provee a su pueblo sacerdotal.',
        svgPosition: { x: 70, y: 38 }
      },
      {
        id: 'incense_altar',
        number: 6,
        zone: 'Lugar Santo',
        name: 'El Altar de Oro del Incienso',
        hebrewName: 'Mizbéaj HaKetóret',
        scripture: 'Éxodo 30:1-10; Hebreos 7:25; Apocalipsis 8:3-4',
        materials: 'Madera de acacia recubierta de oro fino con cuatro cuernos de oro',
        priestlyFunction: 'Quema continua de incienso aromático especial justo frente al velo del Arca.',
        christologicalShadow: 'La intercesión perpetua de Cristo en el cielo a favor de los creyentes y las oraciones de los santos.',
        spiritualMeaning: 'La oración ferviente y aromática que sube ante el trono de la gracia.',
        svgPosition: { x: 50, y: 30 }
      },
      {
        id: 'veil',
        number: 7,
        zone: 'Lugar Santo',
        name: 'El Velo del Templo',
        hebrewName: 'Parójet',
        scripture: 'Éxodo 26:31-33; Mateo 27:51; Hebreos 10:19-20',
        materials: 'Tejido grueso de azul, púrpura, carmesí y lino torcido con querubines primorosamente bordados',
        priestlyFunction: 'Separaba el Lugar Santo del Lugar Santísimo impidiendo la entrada a la presencia de Dios salvo una vez al año.',
        christologicalShadow: 'El cuerpo de Jesús rasgado en la cruz de arriba hacia abajo, abriendo libre entrada al trono divino.',
        spiritualMeaning: 'Acceso directo a Dios sin intermediarios humanos; ya no hay velo que nos separe.',
        svgPosition: { x: 50, y: 22 }
      },
      {
        id: 'ark_mercy_seat',
        number: 8,
        zone: 'Lugar Santísimo',
        name: 'El Arca del Pacto & El Propiciatorio',
        hebrewName: 'Arón HaBrit & Kapóret',
        scripture: 'Éxodo 25:10-22; Romanos 3:25; Hebreos 9:3-5',
        materials: 'Cofre de acacia bañado en oro con querubines de gloria extendiendo sus alas sobre la cubierta de oro sólido',
        priestlyFunction: 'El Sumo Sacerdote entraba con sangre en Yom Kipur para rociar el propiciatorio entre los querubines.',
        christologicalShadow: 'Cristo es nuestra propiciación; el lugar donde la misericordia y la verdad de Dios se besan.',
        spiritualMeaning: 'La presencia Shekinah de Dios morando con su pueblo; justicia y misericordia reconciliadas.',
        svgPosition: { x: 50, y: 12 }
      }
    ];
  }
}

// Instancia Singleton por defecto
export const biblicalGraphicsEngine = BiblicalGraphicsEngine.getInstance();
