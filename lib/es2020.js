import { re, spam as m } from '@bablr/boot';
import { o, eat, eatMatch, match, fail } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import Space from '@bablr/language-en-blank-space';
import Comment from '@bablr/language-en-c-comments';
import Regex from '@bablr/language-en-es6/regex';
import es2019 from './es2019.js';
import { printSource } from '@bablr/agast-helpers/tree';

export const dependencies = { Comment, Space, Regex };

export const defaultMatcher = m`_+: <_Expression />`;

export const fragmentProduction = 'Fragment';

export {
  reservedWords,
  assignmentOperators,
  assignmentOperatorAlternatives,
  unaryPrefixOperators,
  unaryPrefixOperatorAlternatives,
  unaryPostfixOperators,
  unaryPostfixOperatorAlternatives,
  getBinaryOperatorAlternatives,
} from './es2019.js';

export const canonicalURL = 'https://bablr.org/languages/universe/en/es6';

const atrivial = class ES2020Grammar extends es2019.grammar.atrivial {
  *LogicExpression(args) {
    let {
      props: { power = 34 },
    } = args;
    let res;
    if (power >= 2) {
      res = yield eatMatch(m`<MemberExpression /\?\./ />`, o({ power }));
      if (!res) {
        yield* super.LogicExpression(args);
      }
    } else {
      yield* super.LogicExpression(args);
    }
  }

  *MemberExpression() {
    yield eat(m`object+$: <_Expression />`, o({}), o({ held: 'eat' }));

    let sigil = yield match(re`/\?\.|[[.]/`);

    switch (printSource(sigil)) {
      case '?.': {
        yield eat(m`dotToken*: <* '?.' />`);

        if (yield eatMatch(m`openToken*: <* '[' />`)) {
          yield eat(m`property+$: <_Expression />`);
          yield eat(m`closeToken*: <* ']' />`);
        } else {
          yield eat(m`property+$: <Identifier />`, o({ scoped: false }));
        }

        break;
      }

      case '.': {
        yield eat(m`dotToken*: <* '.' />`);
        yield eat(m`property+$: <Identifier />`, o({ scoped: false }));
        break;
      }

      case '[': {
        yield eat(m`openToken*: <* '[' />`);
        yield eat(m`property+$: <_Expression />`);
        yield eat(m`closeToken*: <* ']' />`);
        break;
      }

      default:
        yield fail();
    }
  }
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span.name === 'Bare',
    triviaMatcher: m`#: <Trivia /[ \n\r\t]|\/\/|\/\*|/ />`,

    *Trivia() {
      while (
        (yield eatMatch(m`.: :Space: <_Blank /[ \n\r\t]+/ />`)) ||
        (yield eatMatch(m`.: :Comment: <_Comment /\/\/|\/\*/ />`))
      );
    },
  },
  atrivial,
);

export default { canonicalURL, dependencies, grammar, defaultMatcher, fragmentProduction };
