import { GoogleGenAI, Type } from "@google/genai";
import { 
  ChapterResponse, 
  ReadingPlanItem, 
  SearchResult, 
  DailyDevotional, 
  MoodResult, 
  StudyLesson, 
  CharacterBiography 
} from "../types";

/**
 * Servicio basado en Programación Orientada a Objetos (POO) para interactuar con la API de Gemini
 * para exégesis bíblica, planes de lectura, lecciones y tutoría teológica.
 */
export class GeminiBibleService {
  private chapterCache: Map<string, ChapterResponse>;
  private readonly modelName: string;

  constructor(modelName: string = 'gemini-3-flash-preview') {
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
