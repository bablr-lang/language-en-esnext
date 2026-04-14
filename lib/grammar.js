import ES2022 from './es2022.js';
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
} from './es2022.js';

class ESNext extends ES2022 {
  static canonicalURL = 'https://bablr.org/languages/universe/en/esnext';
}

freeze(ESNext);
freeze(ESNext.prototype);

export default ESNext;
