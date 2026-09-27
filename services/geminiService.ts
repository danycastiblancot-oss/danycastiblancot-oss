import { GoogleGenAI, Type } from "@google/genai";
import { 
  ChapterResponse, 
  ReadingPlanItem, 
  SearchResult, 
  DailyDevotional, 
  MoodResult, 
  StudyLesson, 
  CharacterBiography,
  ExegeticalDeepDive,
  TheologicalDiagram,
  HomileticalOutline
} from "../types";

/**
 * Servicio basado en Programación Orientada a Objetos (POO) para interactuar con la API de Gemini
 * para exégesis bíblica, planes de lectura, lecciones y tutoría teológica.
 */
export class GeminiBibleService {
  private chapterCache: Map<string, ChapterResponse>;
  private readonly modelName: string;

  constructor(modelName: string = 'gemini-3.8-flash') {
    this.chapterCache = new Map<string, ChapterResponse>();
    this.modelName = modelName;
  }

  /**
   * Obtiene la instancia del cliente de GoogleGenAI.
   */
  private getAIInstance(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Limpia la caché interna de capítulos guardados.
   */
  public clearCache(): void {
    this.chapterCache.clear();
  }

  /**
   * Obtiene y genera el estudio teológico y texto bíblico de un capítulo específico.
   */
  public async getBibleChapter(book: string, chapter: number): Promise<ChapterResponse> {
    const cacheKey = `${book}-${chapter}`;
    if (this.chapterCache.has(cacheKey)) {
      return this.chapterCache.get(cacheKey)!;
    }

    const ai = this.getAIInstance();
    const systemInstruction = `
      Eres un erudito bíblico y teólogo de elite de la "Academia ABBA" (PhD en Teología e Historia). 
      Tu misión es realizar una exégesis exhaustiva y rigurosa. 
      
      REQUISITOS INNEGOCIABLES:
      1. NO resumas ni simplifiques. Proporciona explicaciones académicas extensas y ricas en matices.
      2. VERIFICA la información contra concordancias históricas (Strong, Thayer) y enciclopedias teológicas de prestigio (Sana Doctrina).
      3. Texto exacto: Reina Valera 1960.
      4. Análisis Multidimensional: Explica detalladamente el contexto político, social, geográfico y teológico.
      5. Transmite autoridad académica combinada con reverencia espiritual.
    `;

    const prompt = `Genera el contenido académico y pastoral para el libro de ${book}, capítulo ${chapter}.`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                book_name: { type: Type.STRING },
                chapter_number: { type: Type.NUMBER },
                author: { type: Type.STRING },
                estimated_date: { type: Type.STRING },
                target_audience: { type: Type.STRING },
                historical_setting: { type: Type.STRING },
                theological_theme: { type: Type.STRING },
                reading_guidance: { type: Type.STRING },
                detailed_explanation: { type: Type.STRING },
                key_quotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                purpose: { type: Type.STRING },
                category_group: { type: Type.STRING },
                speaker_voice: { type: Type.STRING },
                chronological_order: { type: Type.STRING }
              },
              required: [
                "book_name", 
                "chapter_number", 
                "author", 
                "estimated_date", 
                "target_audience", 
                "historical_setting", 
                "theological_theme", 
                "reading_guidance", 
                "detailed_explanation",
                "purpose",
                "category_group",
                "speaker_voice",
                "chronological_order"
              ]
            },
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.NUMBER },
                  text: { type: Type.STRING }
                },
                required: ["number", "text"]
              }
            }
          },
          required: ["metadata", "verses"]
        }
      }
    });

    const data = JSON.parse(response.text) as ChapterResponse;
    this.chapterCache.set(cacheKey, data);
    return data;
  }

  /**
   * Genera el plan de lectura cronológico bíblico.
   */
  public async getChronologicalPlan(): Promise<ReadingPlanItem[]> {
    const ai = this.getAIInstance();
    const prompt = `Proporciona un plan de lectura cronológico de 10 bloques clave de la Biblia. Explica cómo encaja en la historia de la redención.`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              order: { type: Type.NUMBER },
              book: { type: Type.STRING },
              chapters: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              reason: { type: Type.STRING }
            },
            required: ["order", "book", "chapters", "reason"]
          }
        }
      }
    });

    return JSON.parse(response.text) as ReadingPlanItem[];
  }

  /**
   * Busca temas o versículos en la Biblia.
   */
  public async searchBible(query: string): Promise<SearchResult[]> {
    const ai = this.getAIInstance();
    const prompt = `Busca en la Biblia (Reina Valera 1960) versículos sobre: "${query}". Máximo 10 resultados.`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              book: { type: Type.STRING },
              chapter: { type: Type.NUMBER },
              verse: { type: Type.NUMBER },
              text: { type: Type.STRING },
              relevance: { type: Type.STRING }
            },
            required: ["book", "chapter", "verse", "text", "relevance"]
          }
        }
      }
    });

    return JSON.parse(response.text) as SearchResult[];
  }

  /**
   * Genera un devocional diario.
   */
  public async getDailyDevotional(): Promise<DailyDevotional> {
    const ai = this.getAIInstance();
    const prompt = `Genera un devocional cristiano para hoy con versículo, reflexión pastoral, oración y acción práctica.`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verseReference: { type: Type.STRING },
            verseText: { type: Type.STRING },
            reflection: { type: Type.STRING },
            prayer: { type: Type.STRING },
            application: { type: Type.STRING }
          },
          required: ["verseReference", "verseText", "reflection", "prayer", "application"]
        }
      }
    });

    return JSON.parse(response.text) as DailyDevotional;
  }

  /**
   * Obtiene versículos bíblicos de acuerdo al estado de ánimo.
   */
  public async getVersesByMood(mood: string): Promise<MoodResult[]> {
    const ai = this.getAIInstance();
    const prompt = `Proporciona 3 versículos de consuelo para alguien que se siente: "${mood}".`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              verseReference: { type: Type.STRING },
              text: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["verseReference", "text", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text) as MoodResult[];
  }

  /**
   * Genera una lección teológica sobre un tema dado.
   */
  public async getStudyLesson(topic: string): Promise<StudyLesson> {
    const ai = this.getAIInstance();
    
    const systemInstruction = `
      Eres un erudito bíblico de la "Academia ABBA". 
      Tu misión es crear lecciones teológicas profundas, precisas y pedagógicas.
      PRINCIPIO FUNDAMENTAL: Debes seguir strictly la "Sana Doctrina" (doctrina bíblica ortodoxa).
      
      ESTRUCTURA DE LA LECCIÓN:
      1. Título impactante.
      2. Contenido teológico extenso y bien explicado.
      3. Versículos clave de apoyo (Reina Valera 1960).
      4. Un quiz de 5 preguntas de opción múltiple para evaluar la comprensión.
    `;

    const prompt = `Crea una lección teológica sobre: "${topic}".`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyVerses: { type: Type.ARRAY, items: { type: Type.STRING } },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["topic", "title", "content", "keyVerses", "quiz"]
        }
      }
    });

    return JSON.parse(response.text) as StudyLesson;
  }

  /**
   * Consulta al tutor teológico.
   */
  public async askTheologyTutor(question: string, contextTopic: string): Promise<string> {
    const ai = this.getAIInstance();
    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: `Pregunta sobre ${contextTopic}: ${question}`,
      config: {
        systemInstruction: "Eres un mentor teológico de sana doctrina. Responde breve y pastoralmente."
      }
    });
    return response.text || "Lo siento, no pude procesar la respuesta.";
  }

  /**
   * Genera la biografía de un personaje bíblico.
   */
  public async getCharacterBiography(character: string): Promise<CharacterBiography> {
    const ai = this.getAIInstance();
    
    const systemInstruction = `
      Eres un historiador y teólogo senior de la "Academia ABBA", experto en arqueología bíblica y estudios exegéticos. 
      Tu misión es proporcionar biografías bibliográficamente precisas, sin simplificaciones ni omisiones de complejidad histórica.
      
      DIRECTRICES:
      1. Verifica hechos contra las fuentes extrabíblicas (Josefo, Tácito) y bíblicas más rigurosas.
      2. Explica la importancia del personaje dentro del PACTO y la historia de la salvación.
      3. Incluye fechas estimadas con rigor académico y justificación de cronología.
      4. Narrativa: Debe ser inmersiva pero profundamente académica.
    `;

    const prompt = `Genera la biografía completa de: "${character}".`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            period: { type: Type.STRING },
            key_events: { type: Type.ARRAY, items: { type: Type.STRING } },
            significance: { type: Type.STRING },
            detailed_bio: { type: Type.STRING },
            related_verses: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "role", "period", "key_events", "significance", "detailed_bio", "related_verses"]
        }
      }
    });

    return JSON.parse(response.text) as CharacterBiography;
  }
  /**
   * Realiza un estudio exegético profundo con análisis lingüístico en griego/hebreo,
   * conexión cristocéntrica y teología bíblica.
   */
  public async getExegeticalDeepDive(passageOrTopic: string): Promise<ExegeticalDeepDive> {
    const ai = this.getAIInstance();
    const systemInstruction = `
      Eres un catedrático erudito de Lenguas Bíblicas y Teología Sistemática de la Academia ABBA.
      Analiza el pasaje o tema con máxima rigurosidad académica:
      1. Palabras clave en sus lenguas originales (Hebreo en el AT, Griego en el NT) con grafía original, transliteración fonética, número de concordancia Strong, significado léxico y su peso teológico.
      2. Contexto histórico, social y literario preciso.
      3. Conexión Cristocéntrica: cómo este pasaje o tema tipifica, profetiza o encuentra su cumplimiento glorioso en Jesucristo.
      4. Doctrinas teológicas clave involucradas (Sana Doctrina).
      5. Aplicaciones prácticas para la vida cristiana hoy.
    `;

    const prompt = `Realiza la exégesis lingüística y teológica de: "${passageOrTopic}".`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passage: { type: Type.STRING },
            historicalContext: { type: Type.STRING },
            originalLanguageInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalWord: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  strongsNumber: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  theologicalContext: { type: Type.STRING }
                },
                required: ["originalWord", "transliteration", "strongsNumber", "meaning", "theologicalContext"]
              }
            },
            christocentricConnection: { type: Type.STRING },
            theologicalDoctrines: { type: Type.ARRAY, items: { type: Type.STRING } },
            practicalApplication: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["passage", "historicalContext", "originalLanguageInsights", "christocentricConnection", "theologicalDoctrines", "practicalApplication"]
        }
      }
    });

    return JSON.parse(response.text) as ExegeticalDeepDive;
  }

  /**
   * Genera la estructura de un diagrama conceptual teológico con nodos y conexiones.
   */
  public async generateTheologicalDiagram(concept: string): Promise<TheologicalDiagram> {
    const ai = this.getAIInstance();
    const systemInstruction = `
      Eres un arquitecto de infografías y diagramas conceptuales de Teología Bíblica de la Academia ABBA.
      Diseña un diagrama visual estructurado con nodos y conexiones lógicas para el tema dado.
      Cada nodo debe tener un label claro, una descripción concisa, su referencia bíblica y categoría.
      Las conexiones deben reflejar relaciones doctrinales (ej: "cumple", "revela", "engendra", "sella", "prefigura").
    `;

    const prompt = `Diseña el diagrama conceptual teológico para: "${concept}".`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            centralTheme: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  scriptureReference: { type: Type.STRING },
                  category: { type: Type.STRING },
                  color: { type: Type.STRING }
                },
                required: ["id", "label", "description", "scriptureReference", "category"]
              }
            },
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fromId: { type: Type.STRING },
                  toId: { type: Type.STRING },
                  relationshipLabel: { type: Type.STRING }
                },
                required: ["fromId", "toId", "relationshipLabel"]
              }
            },
            summaryConclusion: { type: Type.STRING }
          },
          required: ["title", "description", "centralTheme", "nodes", "connections", "summaryConclusion"]
        }
      }
    });

    return JSON.parse(response.text) as TheologicalDiagram;
  }

  /**
   * Genera un bosquejo homilético expositivo para predicar o enseñar bíblicamente.
   */
  public async generateSermonOutline(passage: string, theme?: string): Promise<HomileticalOutline> {
    const ai = this.getAIInstance();
    const systemInstruction = `
      Eres un maestro de Homilética Expositiva y Predicación Bíblica de la Academia ABBA.
      Crea un bosquejo fiel a la hermenéutica sana con proposición central clara, introducción cautivadora,
      puntos numerados con su apoyo bíblico e ilustración, y una conclusión desafiante con oración.
    `;

    const prompt = `Crea un bosquejo homilético expositivo para el texto: "${passage}" ${theme ? `con énfasis en: "${theme}"` : ''}.`;

    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            mainText: { type: Type.STRING },
            title: { type: Type.STRING },
            centralProposition: { type: Type.STRING },
            introduction: { type: Type.STRING },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  romanNumeral: { type: Type.STRING },
                  title: { type: Type.STRING },
                  biblicalSupport: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  illustration: { type: Type.STRING }
                },
                required: ["romanNumeral", "title", "biblicalSupport", "explanation", "illustration"]
              }
            },
            conclusion: { type: Type.STRING },
            closingPrayer: { type: Type.STRING }
          },
          required: ["theme", "mainText", "title", "centralProposition", "introduction", "points", "conclusion", "closingPrayer"]
        }
      }
    });

    return JSON.parse(response.text) as HomileticalOutline;
  }
}

// Instancia singleton por defecto
export const geminiService = new GeminiBibleService();

// Funciones exportadas delegadas al servicio POO para mantener compatibilidad
export const getBibleChapter = (book: string, chapter: number) => geminiService.getBibleChapter(book, chapter);
export const getChronologicalPlan = () => geminiService.getChronologicalPlan();
export const searchBible = (query: string) => geminiService.searchBible(query);
export const getDailyDevotional = () => geminiService.getDailyDevotional();
export const getVersesByMood = (mood: string) => geminiService.getVersesByMood(mood);
export const getStudyLesson = (topic: string) => geminiService.getStudyLesson(topic);
export const askTheologyTutor = (question: string, contextTopic: string) => geminiService.askTheologyTutor(question, contextTopic);
export const getCharacterBiography = (character: string) => geminiService.getCharacterBiography(character);
export const getExegeticalDeepDive = (passageOrTopic: string) => geminiService.getExegeticalDeepDive(passageOrTopic);
export const generateTheologicalDiagram = (concept: string) => geminiService.generateTheologicalDiagram(concept);
export const generateSermonOutline = (passage: string, theme?: string) => geminiService.generateSermonOutline(passage, theme);
