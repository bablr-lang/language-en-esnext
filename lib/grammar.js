import ES2020 from './es2020.js';
import { freeze } from '@bablr/agast-helpers/object';

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

class ESNext extends ES2020 {
  static canonicalURL = 'https://bablr.org/languages/universe/en/esnext';
}

freeze(ESNext);
freeze(ESNext.prototype);

export default ESNext;
