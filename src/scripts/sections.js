import { gpt, initOpenAI } from "../shared/openai.ts";
import { getMusicData } from "./music.js";
import dedent from "npm:dedent";

export async function getMusicAnalysis(artistName, songTitle, duration) {
  const musicData = await getMusicData(artistName, songTitle, duration);
  const spotifyInfoPrompt = musicData.incomplete
    ? ""
    : dedent`Here is the info for the song as whole:
  Valence, from 0 to 1 where 0 is very negative and 1 is very positive: ${musicData.valence};
   Energy where 0 is very calm and 1 is very energetic: ${musicData.energy};
    Danceability, from 0 to 1 where 0 is not danceable and 1 is very danceable: ${musicData.danceability};
    The genre of the song is ${musicData.genre}.`;

  const lyricsPrompt = musicData.lyricsAnnotations.instrumental
    ? "The song is instrumental;"
    : `Here are the lyrics with timestamps in seconds, as a JSON object:
  ${JSON.stringify(musicData.lyrics, null, 2)};`;

  const prompt = dedent`I will give you the lyrics, with timestamps, and some 
  information for the song ${songTitle} by ${artistName}. 
    The duration of the song is ${musicData.duration} seconds.
    ${spotifyInfoPrompt}
    ${lyricsPrompt}
    Here are the annotations for the lyrics, as a JSON object:
    ${JSON.stringify(musicData.lyricsAnnotations, null, 2)};

    Based on the information provided and whatever else you know about the song, provide structured data for the song, dividing it into 5 to 10 significant sections (like the chorus,
    where signifcant shifts in music or mood happen, etc).`;

  const songProperties = {
    explanation: {
      type: "string",
      description: "A brief explanation of the section, what is happening.",
    },
    mood: {
      type: "array",
      description: "An array with keywords about the mood of the section, consider the mood and lyrics.",
      items: {
        type: "string",
      },
    },
    chaos_level: {
      type: "number",
      description:
        "Level of chaos of the section where 0 is very calm and 1 is very chaotic. Consider things like tempo, mood, etc.",
    },
    energy: {
      type: "number",
      description:
        "Overall energy of the section from 0 to 1 relating to emotional level. For example, consider if it's the chorus which could be more energetic",
    },
    texture: {
      type: "number",
      description: "texture of section if 0 is completely homophonic and 1 is completely polyphonic",
    },
    colors: {
      type: "array",
      description: `An array of 5 colors in HEX that represent the mood of the section, as well as the overall style, genre, time period, and aesthetic of the song and artist. For example, if the section is angry, choose reds but with variety, for visual interest.
      If the style of the song is 80s, choose colors that are reminiscent of that era. Or if it's an emo song, choose emo colors.
      Consider also the level of energy and chaos of the section. Have a varied color palette that tells a story to the viewer.`,
      items: {
        type: "string",
      },
    },
    harmony: {
      type: "number",
      description:
        "if 0 is very dissonant and chaotic and 1 is very consonant and harmonious, where does the section fall?",
    },
  };

  const sectionProperties = {
    ...songProperties,
    start: { type: "number", description: "The start timestamp of the section, in seconds." },
    duration: { type: "number", description: "The duration of the section, in seconds." },
  };

  initOpenAI();

  const result = await gpt({
    messages: [
      {
        role: "system",
        content: dedent`You are a graphic designer specialized in music visualization. 
          You analyze songs based on Oliver Sack's Musicophilia.
          The user will give youa lot of information about a specific song. Your job is to break the song into different sections, 
          based on the information. The sections will be utilized for further processing for a music visualization project.
          Try to have a shift in color between sections depending on mood and lyrics, while still making sense.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
    model: "gpt-4o-2024-11-20",
    // seed: 256,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "music_analysis",
        schema: {
          type: "object",
          properties: {
            song_start: {
              type: "object",
              description: "The start of the song, starting at 0 seconds.",
              properties: songProperties,
              required: ["explanation", "mood", "chaos_level", "energy", "texture", "colors", "harmony"],
              additionalProperties: false,
            },
            sections: {
              type: "array",
              description: "An array with for each section of the song.",
              items: {
                type: "object",
                properties: sectionProperties,
                required: [
                  "explanation",
                  "start",
                  "duration",
                  "mood",
                  "chaos_level",
                  "energy",
                  "texture",
                  "colors",
                  "harmony",
                ],
                additionalProperties: false,
              },
            },
            song_end: {
              type: "object",
              description: "The end of the song.",
              properties: songProperties,
              required: ["explanation", "mood", "chaos_level", "energy", "texture", "colors", "harmony"],
              additionalProperties: false,
            },
          },
          required: ["sections", "song_start", "song_end"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  musicData.sections = result.parsed.sections;
  musicData.song_start = result.parsed.song_start;
  musicData.song_start.start = 0;
  musicData.song_start.duration = musicData.sections[0].start;
  musicData.song_end = result.parsed.song_end;
  musicData.song_end.start =
    musicData.sections[musicData.sections.length - 1].start +
    musicData.sections[musicData.sections.length - 1].duration;
  musicData.song_end.duration = musicData.duration - musicData.song_end.start;

  return musicData;
}
