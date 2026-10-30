import portrait480 from '../assets/profile/rajeev-kumar-480.webp';
import portrait960 from '../assets/profile/rajeev-kumar-960.webp';

/**
 * Portrait crops generated from the original photo with:
 *   npm run assets:brand -- --portrait "path/to/photo.png"
 * That command overwrites the files imported above and refreshes the
 * social-sharing image, so no code changes are needed to swap the photo.
 */
export const portrait = {
  alt: 'Portrait of Rajeev Kumar in a navy blazer and white shirt',
  small: portrait480,
  large: portrait960,
  width: 960,
  height: 1200,
  caption: 'B.E. Computer Science · BMSIT&M',
} as const;
