import type { ReadingMode, Token, UserPreferences } from '../../engines/types';
import { calculateORP } from '../../engines/orp-calculator';
import {
  applyBionic,
  computeHybridSegments,
  getFontWeights,
  getLightOpacity,
  shouldSkipBionic,
} from '../../engines/bionic-engine';
import { colorHex, getColorForWord } from '../../utils/color-theme';

interface WordDisplayProps {
  tokens: Token[];
  mode: ReadingMode;
  preferences: UserPreferences;
  fontSize: number;
}

function WordColorLabel({
  word,
  showName,
}: {
  word: string;
  showName: boolean;
}) {
  if (!showName) return null;
  const named = getColorForWord(word);
  return (
    <p className="mt-3 text-center text-xs text-reader-muted">
      {named.name} · {colorHex(named)}
    </p>
  );
}

function BionicWord({
  word,
  preferences,
}: {
  word: string;
  preferences: UserPreferences;
}) {
  const { bold, light } = getFontWeights(preferences.bionic);
  const lightOpacity = getLightOpacity(preferences.bionic);
  const segment = shouldSkipBionic(word, preferences.bionic)
    ? { bold: '', normal: word }
    : applyBionic(word, preferences.bionic);
  const wordColor = preferences.wordColorNames ? colorHex(getColorForWord(word)) : undefined;

  return (
    <span className="inline-block" style={wordColor ? { color: wordColor } : undefined}>
      <span style={{ fontWeight: bold }}>{segment.bold}</span>
      <span style={{ fontWeight: light, opacity: lightOpacity }}>
        {segment.normal}
      </span>
    </span>
  );
}

export function WordDisplay({ tokens, mode, preferences, fontSize }: WordDisplayProps) {
  const visible = tokens.filter((t) => !t.isParagraphBreak);
  const hasParagraphBreak = tokens.some((t) => t.isParagraphBreak);

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-reader-muted">
        <p className="text-lg">Pulsa Espacio para empezar</p>
      </div>
    );
  }

  if (hasParagraphBreak && visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-px w-24 bg-reader-muted/40" />
      </div>
    );
  }

  const word = visible[0]?.text ?? '';
  const { bold, light } = getFontWeights(preferences.bionic);
  const lightOpacity = getLightOpacity(preferences.bionic);
  const wordColor = preferences.wordColorNames ? colorHex(getColorForWord(word)) : undefined;
  const orpColor = wordColor ?? preferences.orpColor;

  if (mode === 'bionic') {
    return (
      <div
        className="reading-text flex h-full flex-col items-center justify-center px-4"
        style={{ fontSize }}
      >
        <p className="max-w-full text-center leading-relaxed">
          {visible.map((token, i) => (
            <span key={`${token.index}-${i}`}>
              {i > 0 && ' '}
              <BionicWord word={token.text} preferences={preferences} />
            </span>
          ))}
        </p>
        {preferences.wordColorNames && visible.length === 1 && (
          <WordColorLabel word={word} showName={preferences.showWordColorNames} />
        )}
      </div>
    );
  }

  if (mode === 'rsvp') {
    const orp = calculateORP(word);
    return (
      <div
        className="word-anchor flex h-full flex-col items-center justify-center px-4"
        style={{ fontSize }}
      >
        <span className="inline-flex items-baseline" style={wordColor ? { color: wordColor } : undefined}>
          <span className="word-padding" aria-hidden>
            {'\u00A0'.repeat(orp.leftPadding)}
          </span>
          <span>{orp.prefix}</span>
          <span style={{ color: orpColor, fontWeight: wordColor ? 700 : undefined }}>
            {orp.orpChar}
          </span>
          <span>{orp.suffix}</span>
        </span>
        {preferences.wordColorNames && (
          <WordColorLabel word={word} showName={preferences.showWordColorNames} />
        )}
      </div>
    );
  }

  const orp = calculateORP(word);
  const hybrid = computeHybridSegments(word, preferences.bionic, orp.index);

  return (
    <div
      className="word-anchor flex h-full flex-col items-center justify-center px-4"
      style={{ fontSize }}
    >
      <span className="inline-flex items-baseline" style={wordColor ? { color: wordColor } : undefined}>
        <span className="word-padding" aria-hidden>
          {'\u00A0'.repeat(hybrid.leftPadding)}
        </span>
        {hybrid.bionicBold && (
          <span style={{ fontWeight: bold }}>{hybrid.bionicBold}</span>
        )}
        {hybrid.bionicNormal && (
          <span style={{ fontWeight: light, opacity: lightOpacity }}>
            {hybrid.bionicNormal}
          </span>
        )}
        <span style={{ color: orpColor, fontWeight: 700 }}>
          {hybrid.orpChar}
        </span>
        <span style={{ fontWeight: light, opacity: lightOpacity }}>
          {hybrid.suffix}
        </span>
      </span>
      {preferences.wordColorNames && (
        <WordColorLabel word={word} showName={preferences.showWordColorNames} />
      )}
    </div>
  );
}
