/**
 * @file lexer.token.js
 * @copyright 2026 PlasticHeart
 */

!(() => {
    class UnimplementedError extends Error {

    }

    class TokenKind {
        static ASSIGN = new TokenKind('assign')
        static BAR = new TokenKind('bar')
        static BOOL = new TokenKind('bool')
        static BRACKET_LEFT = new TokenKind('bracket_left')
        static BRACKET_RIGHT = new TokenKind('bracket_right')
        static CURLY_BRACE_LEFT = new TokenKind('curly_brace_left')
        static CURLY_BRACE_RIGHT = new TokenKind('curly_brace_right')
        static EOF = new TokenKind('eof')
        static FLOAT = new TokenKind('float')
        static IDENT = new TokenKind('ident')
        static IMPL = new TokenKind('impl')
        static INTEGER = new TokenKind('integer')
        static KEYWORD = new TokenKind('keyword')
        static NUMBER = new TokenKind('number')
        static PAREN_LEFT = new TokenKind('paren_left')
        static PAREN_RIGHT = new TokenKind('paren_right')
        static RETURN = new TokenKind('return')
        static SEMICOLON = new TokenKind('semicolon')
        static SYMBOL = new TokenKind('symbol')
        static UNIT = new TokenKind('unit')
        static UNLABELLED = new TokenKind('unlabelled')
        static WHITESPACE = new TokenKind('whitespace')

        #name

        /**
         * @param {string} name
         */
        constructor(name) {
            this.#name = name
        }

        /**
         * @returns {string}
         */
        get name() {
            return this.#name
        }

        /**
         * @returns {boolean}
         */
        get isWhitespace() {
            return this == TokenKind.WHITESPACE
        }

        /**
         * @returns {string}
         */
        toString() {
            return this.#name
        }
    }

    class Position {
        /**
         * @param {number} start
         * @param {number} end
         * @param {number} line
         * @param {number} col
         */
        constructor(start, end, line, col) {
            this.start = start
            this.end = end
            this.line = line
            this.col = col
        }

        /**
         * @param {Object} [options]
         * @param {number} options.start
         * @param {number} options.end
         * @param {number} options.line
         * @param {number} options.col
         * @returns {Position}
         */
        clone({ start, end, line, col } = {}) {
            return new Position(
                start ?? this.start,
                end ?? this.end,
                line ?? this.line,
                col ?? this.col
            )
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.line}:${this.col}`
        }
    }

    class Token {
        #position

        /**
         * @param {Object} [options]
         * @param {Position} options.position
         */
        constructor({ position } = {}) {
            this.#position = position ?? null
        }

        /**
         * @returns {?Position}
         */
        get position() {
            return this.#position
        }

        /**
         * @returns {boolean}
         */
        get isOk() {
            throw new UnimplementedError()
        }

        /**
         * @returns {boolean}
         */
        get isErr() {
            throw new UnimplementedError()
        }

        /**
         * @param {function(TokenKind, any, Token): Token} ifOk
         * @returns {Token}
         */
        andThen(ifOk) {
            throw new UnimplementedError()
        }

        /**
         * @param {function(TokenKind, any): boolean} fn
         * @returns {boolean}
         */
        isOkAnd(fn) {
            throw new UnimplementedError()
        }

        /**
         * @param {Token} token
         * @returns {Token}
         */
        or(token) {
            throw new UnimplementedError()
        }
    }

    class OkToken extends Token {
        #kind
        #value

        /**
         * @param {TokenKind} kind
         * @param {any} value
         * @param {Object} [options]
         * @param {Position} options.position
         */
        constructor(kind, value, { position } = {}) {
            super({ position })
            this.#kind = kind
            this.#value = value
        }

        /**
         * @returns {TokenKind}
         */
        get kind() {
            return this.#kind
        }

        /**
         * @returns {any}
         */
        get value() {
            return this.#value
        }

        /**
         * @returns {boolean}
         */
        get isOk() {
            return true
        }

        /**
         * @returns {boolean}
         */
        get isErr() {
            return false
        }

        /**
         * @param {function(TokenKind, any, Object): Token} ifOk
         * @returns {Token}
         */
        andThen(ifOk) {
            return ifOk(this.#kind, this.#value, { position: this.position })
        }

        /**
         * @param {function(TokenKind, any): boolean} fn
         * @returns {boolean}
         */
        isOkAnd(fn) {
            return fn(this.#kind, this.#value)
        }

        /**
         * @param {Token} token
         * @returns {Token}
         */
        or(token) {
            return this
        }

        /**
         * @returns {string}
         */
        toString() {
            return `OkToken(${this.#kind}, ${this.#value})`
        }
    }

    class ErrToken extends Token {
        /**
         * @param {Object} [options]
         * @param {Position} options.position
         */
        constructor({ position } = {}) {
            super({ position })
        }

        /**
         * @returns {boolean}
         */
        get isOk() {
            return false
        }

        /**
         * @returns {boolean}
         */
        get isErr() {
            return true
        }

        /**
         * @param {function(TokenKind, any, Object): Token} ifOk
         * @returns {Token}
         */
        andThen(ifOk) {
            return this
        }

        /**
         * @param {function(TokenKind, any): boolean} fn
         * @returns {boolean}
         */
        isOkAnd(fn) {
            return false
        }

        /**
         * @param {Token} token
         * @returns {Token}
         */
        or(token) {
            return token
        }

        /**
         * @returns {string}
         */
        toString() {
            return `ErrToken(${this.position?.line}, ${this.position?.col})`
        }
    }

    globalThis.Rustytalk = Object.assign(globalThis.Rustytalk ?? {}, {
        Lexer: Object.assign(globalThis.Rustytalk?.Lexer ?? {}, {
            ErrToken,
            OkToken,
            Position,
            Token,
            TokenKind,
            UnimplementedError,
        }),
    })
})()

export const Rustytalk = globalThis.Rustytalk
