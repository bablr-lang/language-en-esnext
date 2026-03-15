import { spam as m, re } from '@bablr/boot';
import {
  eat,
  eatMatch,
  endSpan,
  getInstrMatcher,
  match,
  startSpan,
  o,
  extendLanguage,
} from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import Space from '@bablr/language-en-blank-space';
import Comment from '@bablr/language-en-c-comments';
import ES6Regex from '@bablr/language-en-es6/regex';
import { List } from '@bablr/helpers/productions';
import * as Spans from '@bablr/agast-helpers/spans';

import es2017 from './es2017.js';
import { reifyMatcherReferenceName } from '@bablr/agast-vm-helpers';
import { Coroutine } from '@bablr/coroutine';
import { printSource } from '@bablr/agast-helpers/tree';
import { freeze } from '@bablr/agast-helpers/object';

const flagCharacters = freeze({
  global: 'g',
  ignoreCase: 'i',
  multiline: 'm',
  sticky: 's',
  unicode: 'u',
  sticky: 'y',
});

let Regex = extendLanguage(ES6Regex, {
  grammar: class ES2018Regex extends ES6Regex.grammar {
    static get flagCharacters() {
      return flagCharacters;
    }
  },
});

export const dependencies = { Comment, Space, Regex };

export const defaultMatcher = m`_+: <_Expression />`;

let runCo = (generator) => new Coroutine(generator).advance();

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

export const canonicalURL = 'https://bablr.org/languages/universe/en/es6';

export const fragmentProduction = 'Fragment';

const atrivial = class ES2018Grammar extends es2017.grammar.atrivial {
  *Object() {
    yield eat(m`openToken*: <* '{' />`);
    yield startSpan('Bare', '}');
    yield* List({
      element: m`properties[]+: <_ObjectElement />`,
      separator: m`#separatorTokens: <* ',' />`,
      allowTrailingSeparator: true,
    });
    yield endSpan();
    yield eat(m`closeToken*: <* '}' />`);
  }

  *ObjectMember() {
    if (yield eatMatch(m`<SpreadElement '...' />`)) {
    } else {
      yield eat(m`<Property />`);
    }
  }

  *For(args) {
    let co = runCo(super.For(args));

    while (!co.done) {
      let instr = co.value;
      let refName = reifyMatcherReferenceName(getInstrMatcher(instr));

      co.advance(yield instr);
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
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span.name === 'Bare',

    *Trivia({ s }) {
      let span = Spans.getSpan('Trivia', s().spans);

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
