import { spam as m } from '@bablr/boot';
import { eat, eatMatch, getInstrMatcher } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import Space from '@bablr/language-en-blank-space';
import Comment from '@bablr/language-en-c-comments';
import Regex from '@bablr/language-en-es6/regex';
import { List } from '@bablr/helpers/productions';

import es2017 from './es2017.js';
import { reifyMatcherReferenceName } from '@bablr/agast-vm-helpers';
import { Coroutine } from '@bablr/coroutine';
import { get } from '@bablr/agast-helpers/path';

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

const atrivial = class ES2018Grammar extends es2017.grammar.atrivial {
  *Object() {
    yield eat(m`openToken*: <* '{' />`);
    yield* List({
      element: m`properties[]+: <_ObjectElement />`,
      separator: m`#separatorTokens: <* ',' />`,
      allowTrailingSeparator: true,
    });
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
    yield* List({
      element: m`params[]+$: <PropertyPattern />`,
      allowTrailingSeparator: true,
      separator: m`#separatorTokens: <* ',' />`,
    });
    if (yield eatMatch(m`params[]+$: <SpreadElement '...' />`)) {
      yield eatMatch(m`#separatorTokens: <* ',' />`);
    }
    yield eat(m`closeToken*: <* '}' />`);
  }
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span.name === 'Bare',
    triviaMatcher: m`#: <Trivia /[ \n\r\t]|\/\/|\/\*/ />`,

    *Trivia() {
      while (
        (yield eatMatch(m`.: :Space: <_Blank /[ \n\r\t]+/ />`)) ||
        (yield eatMatch(m`.: :Comment: <_Comment /\/\/|\/\*/ />`))
      );
    },
  },
  atrivial,
);

export default { canonicalURL, dependencies, grammar, defaultMatcher };
