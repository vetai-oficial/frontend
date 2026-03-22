import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const diagnosisSchema : ResponseSchema = {
  description: 'Resposta de diagnóstico veterinário',
  type: SchemaType.OBJECT,
  properties: {
    message: {
      type: SchemaType.STRING,
      description: 'Resposta conversacional em linguagem natural e profissional para o veterinário.',
      nullable: false,
    },
    diseases: {
      type: SchemaType.ARRAY,
      description: 'Lista de possíveis doenças diagnosticadas.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: 'Nome da doença' },
          probability: { type: SchemaType.NUMBER, description: 'Probabilidade de 0 a 100' },
          severity: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['red', 'yellow', 'green'],
            description: 'Severidade da condição',
          },
          reasoning: { type: SchemaType.STRING, description: 'Explicação curta do porquê desta suspeita' },
        },
        required: ['name', 'probability', 'severity', 'reasoning'],
      },
    },
    suggestedQuestions: {
      type: SchemaType.ARRAY,
      description: 'Perguntas sugeridas para aprofundar o diagnóstico.',
      items: { type: SchemaType.STRING },
    },
  },
  required: ['message', 'diseases', 'suggestedQuestions'],
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'API key não configurada' }, { status: 500 });
    }

    // Mudei para o modelo 1.5 Flash (versão estável atual)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema, // AQUI ESTÁ O SEGREDO
      },
    });

    const conversationContext = messages
      .slice(0, -1)
      .map((msg: Message) => `${msg.role === 'user' ? 'Veterinário' : 'IA'}: ${msg.content}`)
      .join('\n');

    const lastMessage = messages[messages.length - 1].content;

    // O prompt agora pode ser mais simples, pois a estrutura é imposta pela config
    const systemPrompt = `Você é um assistente de IA especializado em diagnóstico veterinário.
    
    Seu papel é:
    1. Auxiliar veterinários com raciocínio clínico.
    2. Analisar sintomas e sugerir diagnósticos diferenciais.
    3. Manter um tom profissional.
    
    Diretrizes:
    - Use terminologia técnica adequada.
    - NUNCA dê diagnósticos definitivos.
    - Severidade: red (urgente), yellow (atenção), green (leve).

    ${conversationContext ? `Histórico:\n${conversationContext}\n\n` : ''}
    Nova mensagem: ${lastMessage}`;

    const result = await model.generateContent(systemPrompt);

    // Com Structured Outputs, o texto retornado JÁ É um JSON válido garantido
    const responseText = result.response.text();
    console.log('Resposta bruta da IA:', responseText); // Veja isso no terminal se der erro novamente

    // Limpeza preventiva (às vezes o modelo coloca markdown mesmo no modo JSON)
    const cleanText = responseText.replace(/```json|```/g, '').trim();

    const parsedResponse = JSON.parse(cleanText);

    // Validação extra de segurança (opcional, mas boa prática)
    if (!parsedResponse.message) {
      throw new Error('Resposta incompleta da IA');
    }

    // Limita os arrays conforme sua lógica original
    if (parsedResponse.diseases?.length > 5) {
      parsedResponse.diseases = parsedResponse.diseases.slice(0, 5);
    }
    if (parsedResponse.suggestedQuestions?.length > 6) {
      parsedResponse.suggestedQuestions = parsedResponse.suggestedQuestions.slice(0, 6);
    }

    return Response.json(parsedResponse);

  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);

    // Fallback em caso de erro real da API
    return Response.json({
      message: 'Ocorreu um erro ao processar o diagnóstico. Poderia reformular os sintomas?',
      diseases: [],
      suggestedQuestions: ['Poderia repetir os sintomas principais?'],
    });
  }
}
