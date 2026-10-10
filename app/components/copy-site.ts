/**
 * Purpose: the words every screen shows above any campaign or entry (BR-47; P1 §4.6), in English per L-01: the test-money
 *          notice and the not-audited notice, while each is true; and the footer's privacy link and age line. A copy
 *          file, so the vocabulary test reads it (Sprint 13; they lived in site-notice.tsx since Sprint 09).
 * Version: 0.4.0 (the founder, 2026-10-10: the age line, since the terms that carried it are down; 0.3.0, answer 9a:
 *          the privacy link; 0.2.0, the Sprint 13 reviews: "join", the record link, and BRAND.md's footer line)
 * Sprint:  09 (site shell, theme and wallet); 13 (moved here)
 */
/** P1 §4.6: "Estamos em fase de testes. Aqui se entra com SOL de teste, que não vale dinheiro." */
export const TEST_NOTICE = "We are in a test phase. Here you join with test SOL, which has no real value.";
/** BR-47: "Programa ainda sem auditoria", shown while true. */
export const AUDIT_NOTICE = "The program is not audited yet.";
/** The link after the not-audited notice: who can change the program, and how, is on the record page. */
export const AUDIT_LINK = "Who can do what";
/** BRAND.md §4's approved footer line (the legal review: no page may read as an offer). */
export const NOT_AN_OFFER =
  "Nothing here is an offer or an invitation to put in real money, and availability by country has not been decided.";
/** The founder's answer 9a (2026-10-10; TP §8.2): every page's footer links the privacy page (`PRIVACY_URL`). */
export const PRIVACY_LABEL = "Privacy";
/** The founder (2026-10-10): every footer says the age rule, which lived in the terms (down until Sprint 17). */
export const AGE_NOTICE = "Brot Markets is for adults, 18 and over.";
