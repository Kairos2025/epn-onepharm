export interface EvaluationContext {
  dataValues: Record<string, number | null>; // keyed by deUid or deUid.cocUid
  reportingRates?: Record<string, number | null>; // keyed by dataSetUid
  constants?: Record<string, number | null>; // keyed by constantUid
  orgUnitGroupCounts?: Record<string, number | null>; // keyed by groupUid
  variables?: Record<string, number | null>; // keyed by variableName
  nestedIndicators?: Record<string, string>; // indicatorUid -> expression
}

export type ASTNode =
  | { type: 'NUMBER'; value: number }
  | { type: 'REF'; kind: 'DE' | 'D' | 'I' | 'C' | 'OUG' | 'V'; id: string }
  | { type: 'UNARY_OP'; op: '-' | '!'; expr: ASTNode }
  | { type: 'BINARY_OP'; op: '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '&&' | '||'; left: ASTNode; right: ASTNode }
  | { type: 'CALL'; fn: string; args: ASTNode[] };

const astCache = new Map<string, ASTNode>();

export class ExpressionParser {
  private pos = 0;
  private input = '';

  constructor(input: string) {
    this.input = input.trim();
  }

  static parse(expression: string): ASTNode {
    if (astCache.has(expression)) {
      return astCache.get(expression)!;
    }
    const parser = new ExpressionParser(expression);
    const ast = parser.parseExpression();
    astCache.set(expression, ast);
    return ast;
  }

  private peek(): string {
    return this.input.charAt(this.pos);
  }

  private next(): string {
    return this.input.charAt(this.pos++);
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.peek())) {
      this.pos++;
    }
  }

  private match(str: string): boolean {
    this.skipWhitespace();
    if (this.input.startsWith(str, this.pos)) {
      this.pos += str.length;
      return true;
    }
    return false;
  }

  parseExpression(): ASTNode {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): ASTNode {
    let left = this.parseLogicalAnd();
    while (this.match('||')) {
      const right = this.parseLogicalAnd();
      left = { type: 'BINARY_OP', op: '||', left, right };
    }
    return left;
  }

  private parseLogicalAnd(): ASTNode {
    let left = this.parseEquality();
    while (this.match('&&')) {
      const right = this.parseEquality();
      left = { type: 'BINARY_OP', op: '&&', left, right };
    }
    return left;
  }

  private parseEquality(): ASTNode {
    let left = this.parseRelational();
    while (true) {
      if (this.match('==')) {
        const right = this.parseRelational();
        left = { type: 'BINARY_OP', op: '==', left, right };
      } else if (this.match('!=')) {
        const right = this.parseRelational();
        left = { type: 'BINARY_OP', op: '!=', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseRelational(): ASTNode {
    let left = this.parseAddSub();
    while (true) {
      if (this.match('<=')) {
        const right = this.parseAddSub();
        left = { type: 'BINARY_OP', op: '<=', left, right };
      } else if (this.match('>=')) {
        const right = this.parseAddSub();
        left = { type: 'BINARY_OP', op: '>=', left, right };
      } else if (this.match('<')) {
        const right = this.parseAddSub();
        left = { type: 'BINARY_OP', op: '<', left, right };
      } else if (this.match('>')) {
        const right = this.parseAddSub();
        left = { type: 'BINARY_OP', op: '>', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseAddSub(): ASTNode {
    let left = this.parseMulDiv();
    while (true) {
      if (this.match('+')) {
        const right = this.parseMulDiv();
        left = { type: 'BINARY_OP', op: '+', left, right };
      } else if (this.match('-')) {
        const right = this.parseMulDiv();
        left = { type: 'BINARY_OP', op: '-', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseMulDiv(): ASTNode {
    let left = this.parseExponent();
    while (true) {
      if (this.match('*')) {
        const right = this.parseExponent();
        left = { type: 'BINARY_OP', op: '*', left, right };
      } else if (this.match('/')) {
        const right = this.parseExponent();
        left = { type: 'BINARY_OP', op: '/', left, right };
      } else if (this.match('%')) {
        const right = this.parseExponent();
        left = { type: 'BINARY_OP', op: '%', left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseExponent(): ASTNode {
    let left = this.parseUnary();
    while (this.match('^')) {
      const right = this.parseUnary();
      left = { type: 'BINARY_OP', op: '^', left, right };
    }
    return left;
  }

  private parseUnary(): ASTNode {
    this.skipWhitespace();
    if (this.match('!')) {
      return { type: 'UNARY_OP', op: '!', expr: this.parseUnary() };
    }
    if (this.match('-')) {
      return { type: 'UNARY_OP', op: '-', expr: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    this.skipWhitespace();

    // Grouping
    if (this.match('(')) {
      const expr = this.parseExpression();
      if (!this.match(')')) {
        throw new Error(`Expected ')' at position ${this.pos}`);
      }
      return expr;
    }

    // Number
    const numMatch = this.input.substring(this.pos).match(/^([0-9]+(?:\.[0-9]+)?)/);
    if (numMatch) {
      this.pos += numMatch[1].length;
      return { type: 'NUMBER', value: parseFloat(numMatch[1]) };
    }

    // References: #{id}, D{id}, I{id}, C{id}, OUG{id}, V{id}
    const refMatch = this.input.substring(this.pos).match(/^(#{|D{|I{|C{|OUG{|V{)([a-zA-Z0-9_.]+)}/);
    if (refMatch) {
      this.pos += refMatch[0].length;
      const prefix = refMatch[1].replace('{', '');
      const kind = prefix === '#' ? 'DE' : (prefix as any);
      return { type: 'REF', kind, id: refMatch[2] };
    }

    // Function calls
    const fnMatch = this.input.substring(this.pos).match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      this.pos += fnMatch[0].length;
      const args: ASTNode[] = [];
      this.skipWhitespace();
      if (!this.match(')')) {
        while (true) {
          args.push(this.parseExpression());
          this.skipWhitespace();
          if (this.match(')')) break;
          if (!this.match(',')) {
            throw new Error(`Expected ',' or ')' after argument in function ${fnName}`);
          }
        }
      }
      return { type: 'CALL', fn: fnName, args };
    }

    throw new Error(`Unexpected character '${this.peek()}' at position ${this.pos} in '${this.input}'`);
  }
}

/**
 * Evaluates an Indicator Expression AST safely with division-by-zero protection and cycle detection.
 */
export function evaluateExpression(
  expression: string | ASTNode,
  context: EvaluationContext,
  visitedIndicators: Set<string> = new Set()
): number | null {
  const ast = typeof expression === 'string' ? ExpressionParser.parse(expression) : expression;

  function evalNode(node: ASTNode): number | null {
    switch (node.type) {
      case 'NUMBER':
        return node.value;

      case 'REF': {
        if (node.kind === 'DE') {
          return context.dataValues[node.id] ?? null;
        }
        if (node.kind === 'D') {
          return context.reportingRates?.[node.id] ?? null;
        }
        if (node.kind === 'C') {
          return context.constants?.[node.id] ?? null;
        }
        if (node.kind === 'OUG') {
          return context.orgUnitGroupCounts?.[node.id] ?? null;
        }
        if (node.kind === 'V') {
          return context.variables?.[node.id] ?? null;
        }
        if (node.kind === 'I') {
          if (visitedIndicators.has(node.id)) {
            throw new Error(`Cycle detected in indicator reference: ${node.id}`);
          }
          const nestedExpr = context.nestedIndicators?.[node.id];
          if (!nestedExpr) return null;
          const nextVisited = new Set(visitedIndicators);
          nextVisited.add(node.id);
          return evaluateExpression(nestedExpr, context, nextVisited);
        }
        return null;
      }

      case 'UNARY_OP': {
        const val = evalNode(node.expr);
        if (val === null) return null;
        if (node.op === '-') return -val;
        if (node.op === '!') return val === 0 ? 1 : 0;
        return null;
      }

      case 'BINARY_OP': {
        const l = evalNode(node.left);
        const r = evalNode(node.right);

        // Logical short-circuits
        if (node.op === '&&') {
          return (l && r) ? 1 : 0;
        }
        if (node.op === '||') {
          return (l || r) ? 1 : 0;
        }

        if (l === null || r === null) return null;

        switch (node.op) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': {
            if (r === 0) return null; // Safe DHIS2 rule: division by zero returns null, never Infinity
            return l / r;
          }
          case '%': return r === 0 ? null : l % r;
          case '^': return Math.pow(l, r);
          case '==': return l === r ? 1 : 0;
          case '!=': return l !== r ? 1 : 0;
          case '<': return l < r ? 1 : 0;
          case '<=': return l <= r ? 1 : 0;
          case '>': return l > r ? 1 : 0;
          case '>=': return l >= r ? 1 : 0;
        }
      }

      case 'CALL': {
        const fn = node.fn.toLowerCase();
        if (fn === 'if') {
          const cond = evalNode(node.args[0]);
          return (cond !== null && cond !== 0) ? evalNode(node.args[1]) : evalNode(node.args[2]);
        }
        if (fn === 'isnull') {
          return evalNode(node.args[0]) === null ? 1 : 0;
        }
        if (fn === 'isnotnull') {
          return evalNode(node.args[0]) !== null ? 1 : 0;
        }
        if (fn === 'coalesce' || fn === 'firstnonnull') {
          for (const arg of node.args) {
            const v = evalNode(arg);
            if (v !== null) return v;
          }
          return null;
        }

        // Single argument math functions
        const val = evalNode(node.args[0]);
        if (val === null) return null;

        switch (fn) {
          case 'abs': return Math.abs(val);
          case 'round': return Math.round(val);
          case 'floor': return Math.floor(val);
          case 'ceil': return Math.ceil(val);
          case 'sqrt': return val >= 0 ? Math.sqrt(val) : null;
          case 'log': return val > 0 ? Math.log10(val) : null;
          case 'ln': return val > 0 ? Math.log(val) : null;
          case 'exp': return Math.exp(val);
          case 'greatest': {
            const nums = node.args.map(evalNode).filter((x): x is number => x !== null);
            return nums.length > 0 ? Math.max(...nums) : null;
          }
          case 'least': {
            const nums = node.args.map(evalNode).filter((x): x is number => x !== null);
            return nums.length > 0 ? Math.min(...nums) : null;
          }
          default:
            throw new Error(`Unknown indicator function '${node.fn}'`);
        }
      }
    }
  }

  return evalNode(ast);
}
