import ES2022 from './es2022.js';
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
} from './es2022.js';

class ESNext extends ES2022 {
  static canonicalURL = 'https://bablr.org/languages/universe/en/esnext';
}

freezeClass(ESNext);

export default ESNext;
