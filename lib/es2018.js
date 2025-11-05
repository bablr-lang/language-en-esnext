import { spam as m } from '@bablr/boot';
import { eat, eatMatch } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import Space from '@bablr/language-en-blank-space';
import Comment from '@bablr/language-en-c-comments';
import Regex from '@bablr/language-en-es6/regex';
import { List } from '@bablr/helpers/productions';

import es2017 from './es2017.js';

export const dependencies = { Comment, Space, Regex };

export const defaultMatcher = m`.+$: <_Expression />`;

export {
  powerLevels,
  reservedWords,
  assignmentOperators,
  assignmentOperatorAlternatives,
  unaryPrefixOperators,
  unaryPrefixOperatorAlternatives,
  unaryPostfixOperators,
  unaryPostfixOperatorAlternatives,
  getBinaryOperatorAlternatives,
} from './es2017.js';

export const canonicalURL = 'https://bablr.org/languages/universe/es6';

export const atrivial = class ES2018Grammar extends es2017.grammar.atrivial {
  *Object() {
    yield eat(m`openToken*: <*Punctuator '{' { balanced: '}' } />`);
    yield* List({
      element: m`properties[]$: <_ObjectMember />`,
      separator: m`#separatorTokens[]: <*Punctuator ',' />`,
      allowTrailingSeparator: true,
    });
    yield eat(m`closeToken*: <*Punctuator '}' { balancer: true } />`);
  }

  *ObjectMember() {
    if (yield eatMatch(m`<SpreadElement '...' />`)) {
    } else {
      yield eat(m`<Property />`);
    }
  }

  *ObjectPattern() {
    yield eat(m`openToken*: <*Punctuator '{' { balanced: '}' } />`);
    yield* List({
      element: m`params[]+$: <PropertyPattern />`,
      allowTrailingSeparator: true,
      separator: m`#separatorTokens[]: <*Punctuator ',' />`,
    });
    if (yield eatMatch(m`params[]+$: <SpreadElement '...' />`)) {
      yield eatMatch(m`#separatorTokens[]: <*Punctuator ',' />`);
    }
    yield eat(m`closeToken*: <*Punctuator '}' { balancer: true } />`);
  }
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span === 'Bare',
    triviaMatcher: m`#: <__Trivia /[ \n\r\t]|\/\/|\/\*/ />`,
  },
  atrivial,
);

export default { canonicalURL, dependencies, grammar, defaultMatcher };
