import { m, o, eat, eatMatch, match, fail, startSpan, endSpan } from '@bablr/helpers/grammar';
import * as BListKeyed from '@bablr/agast-helpers/b-map';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import ES2019 from './es2019.js';
import { printSource } from '@bablr/agast-helpers/tree';
import { freezeClass } from '@bablr/agast-helpers/object';

export {
  reservedWords,
  assignmentOperators,
  assignmentOperatorAlternatives,
  unaryPrefixOperators,
  unaryPrefixOperatorAlternatives,
  unaryPostfixOperators,
  unaryPostfixOperatorAlternatives,
  getBinaryOperatorAlternatives,
  startsIdentifierPattern,
} from './es2019.js';

class ES2020Atrivial extends ES2019.atrivial {
  static canonicalURL = 'https://bablr.org/languages/universe/en/es2020';

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

    let sigil = yield match(m`/\?\.|[[.]/`);

    switch (printSource(sigil)) {
      case '?.': {
        yield eat(m`dotToken*: <* '?.' />`);

        if (yield eatMatch(m`openToken*: <* '[' />`)) {
          yield eat(m`property+$: <_Expression />`);
          yield eat(m`closeToken*: <* ']' />`);
        } else {
          yield eat(m`property+$: <*Identifier />`, o({ scoped: false }));
        }

        break;
      }

      case '.': {
        yield eat(m`dotToken*: <* '.' />`);
        yield eat(m`property+$: <*Identifier />`, o({ scoped: false }));
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
}

freezeClass(ES2020Atrivial);

export default triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span.name === 'Bare',

    *Trivia({ s }) {
      let span = BListKeyed.get('Trivia', s().spans);

      let spaces = span?.props.spaces ?? Infinity;

      yield startSpan('Trivia', null, span?.props);
      let res = yield match(m`/\/\/|\/\*|[ \t][^ \t\r\n\g]|[ \n\r\t]/`);

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
  ES2020Atrivial,
);
