import { spam as m } from '@bablr/boot';
import { o, eat, eatMatch } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import * as Space from '@bablr/language-en-blank-space';
import * as Comment from '@bablr/language-en-c-comments';
import * as Regex from '@bablr/language-en-es6/regex';

import * as es2017 from './es2017.js';

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

export const atrivialGrammar = class ES2018Grammar extends es2017.atrivialGrammar {
  *Object() {
    yield eat(m`openToken*: <*Punctuator '{' { balanced: '}' } />`);
    yield eat(
      m`properties[]$: <__List />`,
      o({
        element: m`<_ObjectMember />`,
        separator: m`#separatorTokens[]: <*Punctuator ',' />`,
        allowTrailingSeparator: true,
      }),
    );
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
    yield eat(
      m`params[]+$: <__List />`,
      o({
        element: m`<PropertyPattern />`,
        allowTrailingSeparator: true,
        separator: m`#separatorTokens[]: <*Punctuator ',' />`,
      }),
    );
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
  atrivialGrammar,
);
