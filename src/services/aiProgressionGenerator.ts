import { v4 as uuidv4 } from 'uuid';
import type {
  Song,
  SongSection,
  Chord,
  Key,
  AIGenerationRequest,
  CanonicalNote,
  ChordQuality,
  SectionType,
} from '../types/music';
import { normalizeNoteName, createChord, getKeyId } from '../utils/musicTheory';
import { generateAlgorithmicSong } from './algorithmicGenerator';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// System prompt for the AI
const SYSTEM_PROMPT = `You are a music theory expert and composer assistant. Your task is to generate chord progressions for songs based on the user's mood, style, and preferences.

When generating chord progressions, follow these principles:
1. Use music theory fundamentals: circle of fifths, diatonic harmony, secondary dominants, borrowed chords
2. Match the emotional quality of the requested mood
3. Create progressions that flow naturally and resolve satisfyingly
4. Include varied sections (verse, chorus, bridge) for a complete song structure
5. Use appropriate chord qualities (major, minor, 7ths, suspended, etc.) to enhance the mood

IMPORTANT: You must respond with ONLY valid JSON in the exact format specified. No explanations outside the JSON.

Response format:
{
  "title": "Song title suggestion",
  "key": { "tonic": "C", "mode": "major" },
  "tempo": 120,
  "sections": [
    {
      "type": "verse",
      "name": "Verse 1",
      "chords": ["C", "Am", "F", "G"],
      "bars": 8
    },
    {
      "type": "chorus",
      "name": "Chorus",
      "chords": ["F", "G", "C", "Am"],
      "bars": 8
    }
  ],
  "explanation": "Brief explanation of the musical choices"
}

Valid section types: intro, verse, pre-chorus, chorus, bridge, outro, solo, breakdown
Valid chord formats:
- Basic: C, D, E, F, G, A, B (with #/b for sharps/flats)
- Minor: Am, Dm, Em, etc.
- 7th chords: Cmaj7, Dm7, G7, Am7, etc.
- Suspended: Csus2, Dsus4, etc.
- Diminished: Bdim, C#dim7, etc.
- Augmented: Caug, etc.
- Extended: Cadd9, Dm9, G13, etc.

Match complexity to the mood - simple folk songs need fewer complex chords, jazz/progressive needs more sophisticated harmony.`;

// Parse a chord string into root and quality
function parseChordString(chordStr: string): { root: CanonicalNote; quality: ChordQuality } | null {
  const str = chordStr.trim();

  // Match root note (with optional sharp/flat)
  const rootMatch = str.match(/^([A-G][#b]?)/);
  if (!rootMatch) return null;

  const rootRaw = rootMatch[1];
  const root = normalizeNoteName(rootRaw as any);

  const suffix = str.slice(rootMatch[0].length).toLowerCase();

  // Determine quality from suffix
  let quality: ChordQuality = 'major';

  if (suffix === '' || suffix === 'maj') {
    quality = 'major';
  } else if (suffix === 'm' || suffix === 'min' || suffix === 'minor') {
    quality = 'minor';
  } else if (suffix === 'dim' || suffix === '°' || suffix === 'dim7' || suffix === '°7') {
    quality = suffix.includes('7') ? 'dim7' : 'diminished';
  } else if (suffix === 'aug' || suffix === '+') {
    quality = 'augmented';
  } else if (suffix === '7' || suffix === 'dom7') {
    quality = 'dominant7';
  } else if (suffix === 'maj7' || suffix === 'M7' || suffix === 'Δ7') {
    quality = 'major7';
  } else if (suffix === 'm7' || suffix === 'min7' || suffix === '-7') {
    quality = 'minor7';
  } else if (suffix === 'm7b5' || suffix === 'ø' || suffix === 'ø7') {
    quality = 'half-dim7';
  } else if (suffix === 'sus2') {
    quality = 'sus2';
  } else if (suffix === 'sus4' || suffix === 'sus') {
    quality = 'sus4';
  } else if (suffix === 'add9' || suffix === '2') {
    quality = 'add9';
  } else if (suffix.includes('m')) {
    // Catch-all for minor variants (m9, m11, etc.)
    quality = 'minor7';
  } else if (suffix.match(/^\d/)) {
    // Numbers like 9, 11, 13 - treat as dominant
    quality = 'dominant7';
  }

  return { root, quality };
}

// Convert parsed AI response to Song structure
function parseAIResponse(response: any, customMood: string): Song {
  const keyTonic = normalizeNoteName((response.key?.tonic || 'C') as any);
  const keyMode = response.key?.mode === 'minor' ? 'minor' : 'major';
  const key: Key = { tonic: keyTonic, mode: keyMode };
  const keyContext = getKeyId(key);

  const sections: SongSection[] = (response.sections || []).map((section: any, index: number) => {
    const chords: Chord[] = (section.chords || []).map((chordStr: string) => {
      const parsed = parseChordString(chordStr);
      if (!parsed) {
        // Fallback to C major if parsing fails
        return createChord('C', 'major', undefined, undefined, keyContext);
      }
      return createChord(parsed.root, parsed.quality, undefined, undefined, keyContext);
    });

    const sectionType = validateSectionType(section.type);

    return {
      id: uuidv4(),
      type: sectionType,
      name: section.name || `${sectionType} ${index + 1}`,
      chords,
      bars: section.bars || chords.length,
    };
  });

  // Ensure at least one section
  if (sections.length === 0) {
    sections.push({
      id: uuidv4(),
      type: 'verse',
      name: 'Verse 1',
      chords: [
        createChord('C', 'major', undefined, undefined, keyContext),
        createChord('G', 'major', undefined, undefined, keyContext),
        createChord('A', 'minor', undefined, undefined, keyContext),
        createChord('F', 'major', undefined, undefined, keyContext),
      ],
      bars: 4,
    });
  }

  return {
    id: uuidv4(),
    title: response.title || 'Untitled',
    description: response.explanation,
    key,
    tempo: response.tempo || 100,
    sections,
    customMood,
    generatedBy: 'ai',
  };
}

function validateSectionType(type: string): SectionType {
  const validTypes: SectionType[] = ['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'solo', 'breakdown'];
  const normalized = (type || 'verse').toLowerCase().replace(/[^a-z-]/g, '');
  return validTypes.includes(normalized as SectionType) ? (normalized as SectionType) : 'verse';
}

// Generate progression using Anthropic API
export async function generateProgressionWithAI(
  apiKey: string,
  request: AIGenerationRequest
): Promise<Song> {
  const userPrompt = buildUserPrompt(request);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;

    try {
      const errorJson = JSON.parse(errorText);
      const errorType = errorJson.error?.type || '';
      const errorDetail = errorJson.error?.message || errorText;

      // Provide user-friendly error messages
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your Anthropic API key and try again.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again, or check your API usage limits.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request. Please try again with a different mood description.';
      } else if (response.status === 500 || response.status === 503) {
        errorMessage = 'Anthropic API is temporarily unavailable. Please try again later or use pattern-based generation.';
      } else if (errorType === 'insufficient_quota') {
        errorMessage = 'API quota exceeded. Please check your Anthropic account billing or use pattern-based generation.';
      } else {
        errorMessage = `API error: ${errorDetail}`;
      }
    } catch {
      errorMessage = `API request failed (${response.status}): ${errorText.slice(0, 100)}`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Parse JSON from response
  let parsed;
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response as JSON');
  }

  return parseAIResponse(parsed, request.mood);
}

function buildUserPrompt(request: AIGenerationRequest): string {
  let prompt = `Generate a chord progression for a song with the following characteristics:\n\n`;
  prompt += `Mood/Feeling: ${request.mood}\n`;

  if (request.key) {
    prompt += `Key: ${request.key.tonic} ${request.key.mode}\n`;
  } else {
    prompt += `Key: Choose an appropriate key for the mood\n`;
  }

  if (request.style) {
    prompt += `Style/Genre: ${request.style}\n`;
  }

  if (request.complexity) {
    prompt += `Complexity: ${request.complexity}\n`;
    if (request.complexity === 'simple') {
      prompt += `(Use mostly basic major/minor chords, simple progressions)\n`;
    } else if (request.complexity === 'complex') {
      prompt += `(Include 7th chords, extended chords, borrowed chords, key changes)\n`;
    }
  }

  prompt += `\nPlease generate a complete song structure with verse, chorus, and optionally bridge or other sections. Make the progression musically interesting and appropriate for the mood.`;

  return prompt;
}

// Fallback generation without AI (uses algorithmic music theory generator)
export function generateProgressionFallback(request: AIGenerationRequest): Song {
  return generateAlgorithmicSong(request);
}
