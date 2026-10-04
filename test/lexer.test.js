/**
 * @file lexer.test.js
 * @copyright 2026 PlasticHeart
 */

import assert from 'node:assert/strict'
import { Rustytalk } from '../src/lexer.js'

const { TokenKind, OkToken, ErrToken, Position, Tokenizer } = Rustytalk.Lexer

const tokens = src => new Tokenizer(src).tokenizeAll()
const kinds = src => tokens(src).map(t => t.isOk ? t.kind.name : 'err')
const span = p => [p.start, p.end, p.line, p.col]
const values = src => tokens(src).map(t => t.isOk ? t.value : null)

assert.deepEqual(kinds('true isTrue'), ['bool', 'ident', 'eof'])
assert.deepEqual(values('true isTrue'), [true, Symbol.for('isTrue'), null])
assert.deepEqual(kinds('a at: b put: c'), ['ident', 'keyword', 'ident', 'keyword', 'ident', 'eof'])
assert.deepEqual(kinds('( [ { } ] )'), ['paren_left', 'bracket_left', 'curly_brace_left', 'curly_brace_right', 'bracket_right', 'paren_right', 'eof'])

assert.deepEqual(kinds('x = y'), ['ident', 'assign', 'ident', 'eof'])
assert.deepEqual(kinds('x=y'), ['ident', 'assign', 'ident', 'eof'])
assert.deepEqual(kinds('x: y'), ['keyword', 'ident', 'eof'])
assert.deepEqual(values('x = y'), [Symbol.for('x'), '=', Symbol.for('y'), null])

assert.ok(tokens('a == b').some(t => t.isErr))
assert.ok(tokens('a >= b').some(t => t.isErr))

assert.deepEqual(values('#foo'), ['#foo', null])
assert.deepEqual(values('#at:put:'), ['#at:put:', null])
assert.deepEqual(kinds('#at:put:'), ['symbol', 'eof'])

const [t0, t1, eof] = tokens('true isTrue')
assert.deepEqual(span(t0.position), [0, 4, 0, 0])
assert.deepEqual(span(t1.position), [5, 11, 0, 5])
assert.deepEqual(span(eof.position), [11, 11, 0, 11])
assert.equal(t1.position.start, 5)
assert.equal(t1.position.end, 11)

const [a, b] = tokens('a\n  b')
assert.deepEqual(span(a.position), [0, 1, 0, 0])
assert.deepEqual(span(b.position), [4, 5, 1, 2])

const bad = tokens('a @')
assert.equal(bad.length, 2)
assert.ok(bad[1].isErr)
assert.deepEqual(span(bad[1].position), [2, 2, 0, 2])
assert.equal(bad[1].position.line, 0)
assert.equal(bad[1].position.col, 2)
assert.equal(new ErrToken().position, null)

const plain = new OkToken(TokenKind.IDENT, 'x')
assert.equal(plain.position, null)
assert.deepEqual(span(new OkToken(TokenKind.IDENT, 'x', { position: new Position(1, 2, 0, 1) }).position), [1, 2, 0, 1])

const base = new Position(1, 3, 0, 1)
assert.deepEqual(span(base.clone()), [1, 3, 0, 1])
assert.notEqual(base.clone(), base)
assert.deepEqual(span(base.clone({ end: 5 })), [1, 5, 0, 1])
assert.deepEqual(span(base.clone({ line: 2, col: 0 })), [1, 3, 2, 0])
assert.deepEqual(span(base), [1, 3, 0, 1])
assert.equal(String(TokenKind.EOF), 'eof')
assert.equal(TokenKind.EOF, TokenKind.EOF)

assert.deepEqual(kinds('42 0xFF 0b101 0o17 1_000'), ['integer', 'integer', 'integer', 'integer', 'integer', 'eof'])
assert.deepEqual(values('42 0xFF 0b101 0o17 1_000'), [42, 255, 5, 15, 1000, null])
assert.deepEqual(kinds('3.14 1e3 1E-3 1.5e+3'), ['float', 'float', 'float', 'float', 'eof'])
assert.deepEqual(values('3.14 1e3 1E-3 1.5e+3'), [3.14, 1000, 0.001, 1500, null])
assert.deepEqual(kinds('0xE 0 0.5'), ['integer', 'integer', 'float', 'eof'])
assert.deepEqual(values('0xE'), [14, null])
assert.deepEqual(kinds('x foo: 3'), ['ident', 'keyword', 'integer', 'eof'])
for (const bad of ['3x', '010', '0x', '1_', '1__0', '0_1', '1e', '1.5e', '1n', '.5']) {
    assert.ok(tokens(bad).some(t => t.isErr), bad)
}
assert.ok(tokens('3.').some(t => t.isErr))
assert.equal(tokens('3.')[0].value, 3)

assert.deepEqual(values('2147483648 99999999999999999999'), [2147483648, 99999999999999999999, null])

console.log('lexer.test.js: ok')
