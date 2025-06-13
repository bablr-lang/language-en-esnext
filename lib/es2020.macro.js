import { re, spam as m } from '@bablr/boot';
import { CoveredBy, Node, UndefinedAttributes } from '@bablr/helpers/decorators';
import { o, defineAttribute, eat, eatMatch, match, fail } from '@bablr/helpers/grammar';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import * as Comment from '@bablr/language-en-c-comments';
import * as es2019 from './es2019.js';

export const dependencies = { Comment };

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
} from './es2019.js';

export const canonicalURL = 'https://bablr.org/languages/universe/es6';

export const atrivialGrammar = class ES2020Grammar extends es2019.atrivialGrammar {
  *LogicExpression(args) {
    let {
      props: { power = 34 },
    } = args;
    let res;
    if (power >= 2) {
      res = yield eatMatch(m`<MemberExpression /\g\?\./ />`, o({ power }));
      if (!res) {
        yield* super.LogicExpression(args);
      }
    } else {
      yield* super.LogicExpression(args);
    }
  }

  @UndefinedAttributes(['power'])
  @CoveredBy('Expression')
  @CoveredBy('LogicExpression')
  @Node
  *MemberExpression({ ctx }) {
    yield eat(m`object+$: <__Expression />`, o({ power: 2 }));
    yield defineAttribute('power', 2);

    let sigil = yield match(re`/\?\.|[[.]/`);

    switch (ctx.sourceTextFor(sigil)) {
      case '?.': {
        yield eat(m`dotToken: <*Punctuator '?.' />`);

        if (
          yield eatMatch(
            m`openToken: <*Punctuator '[' { balanced: ']' } />`,
            o({}),
            o({ bind: true }),
          )
        ) {
          yield eat(m`property+$: <__Expression />`);
          yield eat(m`closeToken: <*Punctuator ']' { balancer: true } />`);
        } else {
          yield eat(m`property+$: <__Expression />`, o({ power: 2 }));
          yield eat(m`closeToken: null`);
        }

        break;
      }

      case '.': {
        yield eat(m`dotToken: <*Punctuator '.' />`);
        yield eat(m`openToken: null`);
        yield eat(m`property+$: <Identifier />`, o({ scoped: false }));
        yield eat(m`closeToken: null`);
        break;
      }

      case '[': {
        yield eat(m`dotToken: null`);
        yield eat(m`openToken: <*Punctuator '[' { balanced: ']' } />`);
        yield eat(m`property+$: <__Expression />`);
        yield eat(m`closeToken: <*Punctuator ']' { balancer: true } />`);
        break;
      }

      default:
        yield fail();
    }
  }
};

export const grammar = triviaEnhancer(
  {
    triviaIsAllowed: (s) => s.span === 'Bare',
    triviaMatcher: m`#: :Comment: <_Trivia /[ \n\r\t]|\/\/|\/\*/ />`,
  },
  atrivialGrammar,
);
