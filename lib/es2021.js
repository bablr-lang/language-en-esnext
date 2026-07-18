import { m, o, eat, match, startSpan, endSpan } from '@bablr/helpers/grammar';
import * as BListKeyed from '@bablr/agast-helpers/b-map';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import ES2020 from './es2020.js';
import { printSource } from '@bablr/agast-helpers/tree';
import { parseObject } from '@bablr/agast-helpers/parsers';
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
} from './es2020.js';

class ES2021Atrivial extends ES2020.atrivial {
  static canonicalURL = 'https://bablr.org/languages/universe/en/es2021';
}

freezeClass(ES2021Atrivial);

export default triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span.name === 'Bare',

    *Trivia({ s }) {
      let span = BListKeyed.get('Trivia', s().spans);

      let spaces = (span && parseObject(span.props).spaces) ?? Infinity;

      yield startSpan('Trivia', null, span?.props);
      let res = yield match(m`/\/\/|\/\*|[ \t][^ \t\r\n\g/]|[ \n\r\t]/`);

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
  ES2021Atrivial,
);
