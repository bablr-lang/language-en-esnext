import {
  eat,
  eatMatch,
  endSpan,
  getInstrMatcher,
  match,
  startSpan,
  o,
  m,
} from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import Space from '@bablr/language-en-blank-space';
import Comment from '@bablr/language-en-c-comments';
import ES6Regex from '@bablr/language-en-es6/regex';
import { List } from '@bablr/helpers/productions';
import * as BListKeyed from '@bablr/agast-helpers/b-map';

import es2017 from './es2017.js';
import { reifyMatcherReferenceName } from '@bablr/agast-vm-helpers';
import { printSource } from '@bablr/agast-helpers/tree';
import { deepFreezeRecord, freeze, freezeClass } from '@bablr/agast-helpers/object';

let Regex = class ES2018Regex extends ES6Regex {
  static canonicalURL = 'https://bablr.org/languages/universe/en/es2018-regex-pattern';
  static context = deepFreezeRecord({
    flagCharacters: {
      ...super.flagCharacters,
      dotAll: 's',
    },
  });
};

freezeClass(Regex);

export {
  reservedWords,
  assignmentOperators,
  assignmentOperatorAlternatives,
  unaryPrefixOperators,
  unaryPrefixOperatorAlternatives,
  unaryPostfixOperators,
  unaryPostfixOperatorAlternatives,
  getBinaryOperatorAlternatives,
} from './es2017.js';

class ES2018Atrivial extends es2017.atrivial {
  static dependencies = freeze({ Comment, Space, Regex });
  static canonicalURL = 'https://bablr.org/languages/universe/en/es2018';

  *ObjectMember() {
    if (yield eatMatch(m`<SpreadElement '...' />`)) {
    } else {
      yield eat(m`<Property />`);
    }
  }

  *For(args) {
    let iter = super.For(args);
    let step = iter.next();

    while (!step.done) {
      let instr = step.value;
      let refName = reifyMatcherReferenceName(getInstrMatcher(instr));

      step = iter.next(yield instr);
      if (refName === 'sigilToken') {
        yield eatMatch(m`awaitToken*: <*Keyword 'await' />`);
      }
    }
  }

  *ObjectPattern() {
    yield eat(m`openToken*: <* '{' />`);
    yield startSpan('Bare', '}');
    yield* List({
      element: m`params[]+$: <PropertyPattern />`,
      allowTrailingSeparator: true,
      separator: m`#separatorTokens: <* ',' />`,
    });
    if (yield eatMatch(m`params[]+$: <SpreadElement '...' />`)) {
      yield eatMatch(m`#separatorTokens: <* ',' />`);
    }
    yield endSpan();
    yield eat(m`closeToken*: <* '}' />`);
  }
}

freezeClass(ES2018Atrivial);

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
  ES2018Atrivial,
);
