import {
  m,
  o,
  r,
  eat,
  match,
  startSpan,
  endSpan,
  eatMatch,
  fail,
  startSubspan,
} from '@bablr/helpers/grammar';
import * as BListKeyed from '@bablr/agast-helpers/b-map';
import { triviaEnhancer } from '@bablr/helpers/trivia';
import ES2021 from './es2021.js';
import { printSource } from '@bablr/agast-helpers/tree';
import { deepFreezeRecord, freezeClass } from '@bablr/agast-helpers/object';
import { arrayValues } from '@bablr/agast-helpers/iterable';

export {
  reservedWords,
  assignmentOperators,
  assignmentOperatorAlternatives,
  unaryPrefixOperators,
  unaryPrefixOperatorAlternatives,
  unaryPostfixOperators,
  unaryPostfixOperatorAlternatives,
  getBinaryOperatorAlternatives,
} from './es2021.js';

class ES2022Atrivial extends ES2021.atrivial {
  static canonicalURL = 'https://bablr.org/languages/universe/en/es2021';

  *ClassMember() {
    let { type, modifiers } = (yield match(m`<ClassModifiers />`, o({}), o({ allowEmpty: true })))
      .value;

    switch (type) {
      case 'ClassMethod':
        yield eat(m`<ClassMethod />`, o({ modifiers }));
        break;
      case 'ClassProperty':
        yield eat(m`<ClassProperty />`, o({ modifiers }));
        break;
      case 'ClassStaticBlock':
        yield eat(m`<ClassStaticBlock />`);
        break;
      default:
        throw new Error();
    }
  }

  *ClassProperty({ props }) {
    let { modifiers } = props;
    if (!modifiers) {
      ({ modifiers } = (yield match(m`<ClassModifiers />`, o({}), o({ allowEmpty: true }))).value);
    }
    if (modifiers[0] === 'static') {
      yield eatMatch(m`staticToken*: <*Keyword 'static' />`);
    }

    if (yield eatMatch(m`openNameToken*: <* '[' />`)) {
      yield eat(m`name+$: <_Expression />`);
      yield eat(m`closeNameToken*: <* ']' />`);
    } else {
      yield eatMatch(m`name+$: <*Identifier />`, o({ scoped: false }), o({ bind: true }));
    }

    yield eat(m`sigilToken*: <* '=' />`);

    yield eat(m`value+$: <_Expression />`);

    yield eat(m`endToken*: <* ';' />`);
  }

  *ClassStaticBlock() {
    yield eat(m`sigilToken*: <*Keyword 'static' />`);
    yield eat(m`block: <Block />`);
  }

  *ClassMethod({ props }) {
    let { modifiers } = props;
    if (!modifiers) {
      let match_ = yield match(m`<ClassModifiers />`, o({}), o({ allowEmpty: true }));
      modifiers = match_.value;
    }
    let modifiers_ = [...arrayValues(modifiers)];
    if (modifiers_[0] === 'static') {
      yield eatMatch(m`staticToken*: <*Keyword 'static' />`);
      modifiers_.shift();
    }

    let acc, a, gen;
    if (['get', 'set'].includes(modifiers_[0])) {
      acc = yield eatMatch(m`kindToken*: <*Keyword /get|set/ />`);
      modifiers_.shift();
    }

    if (!acc) {
      if (modifiers_[0] === 'async') {
        a = yield eatMatch(m`asyncToken*: <*Keyword 'async' />`);
      }
      gen = yield eatMatch(m`starToken*: <* '*' />`);
    }

    if (a && gen) yield fail();

    if (yield eatMatch(m`openNameToken*: <* '[' />`)) {
      yield eat(m`name+$: <_Expression />`);
      yield eat(m`closeNameToken*: <* ']' />`);
    } else {
      yield eatMatch(m`name+$: <*Identifier />`, o({ scoped: false }), o({ bind: true }));
    }

    yield eat(m`openParamsToken*: <* '(' />`);

    yield startSpan('Bare', ')');
    let sep = true;
    while (sep && !(yield match(m`/$/`))) {
      yield startSubspan(null, ',');
      yield eat(m`params[]+$: <_CapturePattern />`);
      yield endSpan();
      sep = yield eatMatch(m`#separatorTokens: <* ',' />`);
    }
    if (sep && sep !== true) yield fail();

    yield endSpan();
    yield eat(m`closeParamsToken*: <* ')' />`);
    yield eat(m`body$: <Block />`);
  }

  *ClassModifiers() {
    let modifiers = [];

    if (yield eatMatch(m`<* 'static' />`)) {
      modifiers.push('static');
    }
    if (yield match(m`'{'`)) {
      return r(null, deepFreezeRecord({ type: 'ClassStaticBlock', modifiers }));
    }
    let async_;
    if ((async_ = yield eatMatch(m`<* 'async' />`))) {
      modifiers.push('async');
    } else if (yield eatMatch(m`<* 'get' />`)) {
      modifiers.push('get');
    } else if (yield eatMatch(m`<* 'set' />`)) {
      modifiers.push('set');
    }

    let type = 'ClassMethod';
    let m_;
    if ((m_ = yield match(m`/[=(]/`))) {
      modifiers.pop();
      if (printSource(m_) === '=') {
        type = 'ClassProperty';
      }
    } else if (yield eatMatch(m`<*Identifier />`)) {
      if (printSource(yield match(m`'='`)) === '=') {
        type = 'ClassProperty';
      }
    }

    return r(null, deepFreezeRecord({ type, modifiers }));
  }
}

freezeClass(ES2022Atrivial);

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
  ES2022Atrivial,
);
