import { GoogleGenerativeAI } from "@google/generative-ai";

const genAIInstance = (providedKey?: string) => {
  const key = (providedKey?.trim()) || (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || "";
  
  // Guard against "undefined" string if vite define failed
  const finalKey = (key === 'undefined' || !key) ? "" : key;
  
  if (!finalKey) {
    console.warn("Gemini API Key is missing. Please provide it in the app settings.");
  }
  
  return new GoogleGenerativeAI(finalKey);
};

export async function generateMarketingContent(prompt: string, type: string, imageBase64?: string, userApiKey?: string) {
  try {
    const genAI = genAIInstance(userApiKey);
    const modelName = "gemini-1.5-flash"; // More stable default
    let systemInstruction = `You are a world-class digital marketing expert. 
    Generate high-converting ${type} content based on the user's request. 
    
    STYLE GUIDE:
    1. Keep the caption SIMPLE, PUNCHY, and ENGAGING.
    2. Use a conversational and friendly tone.
    3. Avoid long-winded sentences or heavy jargon.
    4. Use relevant emojis to make it visually attractive.
    5. Focus on a strong HOOK and a clear CALL TO ACTION.
    
    IMPORTANT: Split your response into TWO parts separated by exactly "---ADVICE---".
    Part 1: The main caption/content (including hashtags).
    Part 2: Marketing advice, suggestions, or tips for this specific content.
    
    Format the output in clean Markdown. 
    DO NOT wrap the entire response in markdown code blocks (backticks). Return the raw markdown content directly.`;

    if (type === 'TikTok Viral Script') {
      systemInstruction = `You are a viral TikTok content creator. 
      Generate a high-energy, engaging TikTok script. 
      
      STYLE GUIDE:
      1. Keep it simple, fast-paced, and easy to understand.
      2. Use casual, "slang" or conversational Indonesian (Bahasa Gaul) where appropriate.
      3. Use emojis to highlight visual cues.
      
      IMPORTANT: Split your response into TWO parts separated by exactly "---ADVICE---".
      Part 1: The script (Hook, Body, CTA) and hashtags.
      Part 2: Tips for filming, lighting, or trending audio suggestions.
      
      Include:
      1. A powerful HOOK (first 3 seconds).
      2. Engaging BODY content with visual cues.
      3. A clear CALL TO ACTION (CTA).
      4. Recommended trending music style and 5 relevant hashtags.
      Format the output in clean Markdown with clear sections. Use Indonesian language for the content.
      DO NOT wrap the entire response in markdown code blocks (backticks). Return the raw markdown content directly.`;
    } else {
      systemInstruction += " Use Indonesian language for the content.";
    }

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction
    });

    let result;
    if (imageBase64) {
      // Extract mime type and data from base64 string
      // Format: data:image/png;base64,iVBOR...
      const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const imageData = imageBase64.split(',')[1];
      
      result = await model.generateContent([
        {
          inlineData: {
            data: imageData,
            mimeType: mimeType
          }
        },
        { text: prompt || `Analisis ${mimeType.startsWith('video') ? 'video' : 'gambar'} ini dan buatkan ${type} yang menarik.` }
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    return response.text() || "Gagal menghasilkan konten. Silakan coba lagi.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi AI. Pastikan API Key sudah benar.";
  }
}

export async function generateAutoCaption(imageBase64: string, userApiKey?: string) {
  try {
    const genAI = genAIInstance(userApiKey);
    const modelName = "gemini-1.5-flash"; // More stable default
    const model = genAI.getGenerativeModel({ model: modelName });

    const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const imageData = imageBase64.split(',')[1];

    const prompt = `Analisis gambar ini secara mendalam. Identifikasi objek, suasana, dan konteksnya. 
    Lalu buatkan caption media sosial yang sangat menarik, kreatif, dan relevan dalam Bahasa Indonesia.
    Gunakan emoji yang sesuai. Berikan juga 5 hashtag yang relevan.
    
    Format output:
    [Caption]
    
    [Hashtags]`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Auto-Caption Error:", error);
    return "Gagal membuat caption otomatis.";
  }
}
