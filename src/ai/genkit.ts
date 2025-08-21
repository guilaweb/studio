import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({retries: 2})],
  model: 'googleai/gemini-2.0-flash',
});
