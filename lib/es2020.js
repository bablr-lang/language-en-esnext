import { re, spam as m } from '@bablr/boot';
import { o, eat, eatMatch, match, fail, startSpan, endSpan } from '@bablr/helpers/grammar';
import * as BMap from '@bablr/agast-helpers/b-map';
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
        yield startSpan('Bare', ']');
        yield eat(m`property+$: <_Expression />`);
        yield endSpan();
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

    *Trivia({ s }) {
      let span = BMap.get('Trivia', s().spans);

      let spaces = span?.props.spaces ?? Infinity;

      yield startSpan('Trivia', null, span?.props);
      let res = yield match(re`/\/\/|\/\*|[ \t][^ \t\r\n\g]|[ \n\r\t]/`);

      if (res) {
        res = printSource(res);
      }

      if (res && ' \t'.includes(res[0]) && res.length === 2 && spaces > 1) {
        yield eat(m`#: <* ' ' />`, o({}), o({ hold: true }));
      } else {
        yield eat(m`#: <Trivia />`, o({}), o({ hold: true }));
      }
      yield endSpan();
    },
  },
  atrivial,
);

export default { canonicalURL, dependencies, grammar, defaultMatcher, fragmentProduction };
