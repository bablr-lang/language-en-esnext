import { spam as m } from '@bablr/boot';
import { CoveredBy, Node } from '@bablr/helpers/decorators';
import { o, eat, eatMatch } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import * as Comment from '@bablr/language-en-c-comments';
import * as es2017 from './es2017.js';

export const dependencies = { Comment };

export const defaultMatcher = m`.+: <_Expression />`;

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
  @CoveredBy('JSONExpression')
  @CoveredBy('Expression')
  @Node
  *Object() {
    yield eat(m`open: <*Punctuator '{' { balanced: '}' } />`);
    yield eat(
      m`properties[]$: <__List />`,
      o({
        element: m`<_ObjectMember />`,
        separator: m`#separatorTokens[]: <*Punctuator ',' />`,
        allowTrailingSeparator: true,
      }),
    );
    yield eat(m`close: <*Punctuator '}' { balancer: true } />`);
  }

  *ObjectMember() {
    if (yield eatMatch(m`<SpreadElement '...' />`)) {
    } else {
      yield eat(m`<Property />`);
    }
  }

  @Node
  *ObjectPattern() {
    yield eat(m`openToken: <*Punctuator '{' { balanced: '}' } />`);
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
    yield eat(m`closeToken: <*Punctuator '}' { balancer: true } />`);
  }

  @Node
  *SpreadElement() {
    yield eat(m`sigilToken: <*Punctuator '...' />`);
    yield eat(m`value+$: <_Expression />`, o({ power: 32 }));
  }
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span === 'Bare',
    triviaMatcher: m`#: :Comment: <__Trivia /[ \n\r\t]|\/\/|\/\*/ />`,
  },
  atrivialGrammar,
);
