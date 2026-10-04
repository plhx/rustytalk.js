/**
 * @file lexer.js
 * @copyright 2026 PlasticHeart
 */

import './lexer.token.js'

!(() => {
    const { ErrToken, OkToken, Position, Token, TokenKind } = globalThis.Rustytalk.Lexer

    class Tokenizer {
        static #RULES = [
            [TokenKind.EOF, /$/y, null],
            [TokenKind.WHITESPACE, /\s+/y, null],
            [TokenKind.RETURN, /\^/y, null],
            [TokenKind.UNIT, /\(\)/y, null],
            [TokenKind.BAR, /\|/y, null],
            [TokenKind.BRACKET_LEFT, /\[/y, null],
            [TokenKind.BRACKET_RIGHT, /\]/y, null],
            [TokenKind.CURLY_BRACE_LEFT, /\{/y, null],
            [TokenKind.CURLY_BRACE_RIGHT, /\}/y, null],
            [TokenKind.PAREN_LEFT, /\(/y, null],
            [TokenKind.PAREN_RIGHT, /\)/y, null],
            [TokenKind.SEMICOLON, /\;/y, null],
            [TokenKind.ASSIGN, /=(?![-+*\/\\<>=~@%&?,|])/y, null],
            [TokenKind.KEYWORD, /[A-Za-z_][A-Za-z_0-9]*:/y, null],
            [TokenKind.SYMBOL, /#(?:(?:[A-Za-z_][A-Za-z_0-9]*:)+|[A-Za-z_][A-Za-z_0-9]*)/y, null],
            [TokenKind.NUMBER, /(?:0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*|0[oO][0-7]+(?:_[0-7]+)*|0[bB][01]+(?:_[01]+)*|(?:0|[1-9][0-9]*(?:_[0-9]+)*)(?:\.[0-9]+(?:_[0-9]+)*)?(?:[eE][+-]?[0-9]+(?:_[0-9]+)*)?)(?![A-Za-z0-9_])/y, (x, options) => {
                const digits = x.replaceAll('_', '')
                if (/^0[xXoObB]/.test(digits) || !/[.eE]/.test(digits)) {
                    return new OkToken(TokenKind.INTEGER, Number(digits), options)
                }
                return new OkToken(TokenKind.FLOAT, Number(digits), options)
            }],
            [TokenKind.IDENT, /[A-Za-z_][A-Za-z_0-9]*/y, (x, options) => {
                if (x == 'true' || x == 'false') {
                    return new OkToken(TokenKind.BOOL, x == 'true', options)
                } else if (x == 'impl') {
                    return new OkToken(TokenKind.IMPL, x, options)
                }
                return new OkToken(TokenKind.IDENT, Symbol.for(x), options)
            }],
        ]

        #buffer
        #position

        /**
         * @param {string} buffer
         */
        constructor(buffer) {
            this.#buffer = buffer
            this.#position = new Position(0, 0, 0, 0)
        }

        /**
         * @returns {Token}
         */
        tokenize() {
            let result = new ErrToken({ position: this.#position })
            for (const [kind, regex, fn] of Tokenizer.#RULES) {
                const scanned = this.scan(regex, { isWhitespace: kind.isWhitespace })
                const token = scanned.andThen((_, v, o) => fn?.(v, o) ?? new OkToken(kind, v, o))
                if ((result = result.or(token)).isOk || scanned.isOk) {
                    break
                }
            }
            return result
        }

        /**
         * @returns {Token[]}
         */
        tokenizeAll() {
            const result = []
            while (true) {
                const token = this.tokenize()
                if (token.isErr || token.isOkAnd((k, _) => !k.isWhitespace)) {
                    result.push(token)
                }
                if (token.isOkAnd((k, _) => k == TokenKind.EOF) || token.isErr) {
                    break
                }
            }
            return result
        }

        /**
         * @param {RegExp} regex
         * @param {Object} [options]
         * @param {boolean} options.isWhitespace
         * @returns {Token}
         */
        scan(regex, { isWhitespace } = {}) {
            if (this.#position.start >= this.#buffer.length) {
                return new OkToken(TokenKind.EOF, null, { position: this.#position })
            }
            regex.lastIndex = this.#position.start
            const match = regex.exec(this.#buffer)
            if (match) {
                const s = match[0]
                const position = this.#updatePosition(s, { isWhitespace })
                return new OkToken(TokenKind.UNLABELLED, s, { position })
            }
            return new ErrToken({ position: this.#position })
        }

        /**
         * @param {Object} [options]
         * @param {boolean} options.isWhitespace
         * @returns {Position}
         */
        #updatePosition(s, { isWhitespace } = {}) {
            const position = this.#position.clone({ end: this.#position.start + s.length })
            let line = position.line
            let col = position.col
            for (const c of s) {
                if ((isWhitespace ?? false) && c == '\n') {
                    col = 0
                    line += 1
                } else {
                    col += c.length
                }
            }
            this.#position = position.clone({ start: position.end, line, col })
            return position
        }
    }

    globalThis.Rustytalk = Object.assign(globalThis.Rustytalk ?? {}, {
        Lexer: Object.assign(globalThis.Rustytalk?.Lexer ?? {}, {
            Tokenizer,
        }),
    })
})()

export const Rustytalk = globalThis.Rustytalk
