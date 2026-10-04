/**
 * @file parser.js
 * @copyright 2026 PlasticHeart
 */
import { Rustytalk } from './lexer.js'
import './parser.ast.js'

!(() => {
    const { TokenKind } = Rustytalk.Lexer
    const {
        AstBlock,
        AstBool,
        AstF64,
        AstI32,
        AstImplDecl,
        AstImplKeyword,
        AstImplUnary,
        AstMessageKeyword,
        AstMessageUnary,
        AstImplMethod,
        AstProgram,
        AstReturn,
        AstSend,
        AstStatement,
        AstVar,
        AstUnit,
    } = globalThis.Rustytalk.Parser

    class ParseError extends Error {

    }

    class Parser {
        #tokens
        #index

        constructor(tokens) {
            this.#tokens = tokens
            this.#index = 0
        }

        /**
         * @returns {Ast}
         */
        parse() {
            return this.parseProgram()
        }

        /**
         * @returns {Ast}
         */
        parseProgram() {
            const items = []
            while (true) {
                if (this.#is(TokenKind.IMPL)) {
                    items.push(this.parseImplDecl())
                } else if (this.#is(TokenKind.EOF)) {
                    break
                } else {
                    items.push(this.parseStatement())
                }
            }
            return new AstProgram(items)
        }

        /**
         * @returns {Ast}
         */
        parseImplDecl() {
            this.#expect(TokenKind.IMPL)
            const receiver = this.#expect(TokenKind.IDENT).value
            this.#expect(TokenKind.CURLY_BRACE_LEFT)
            const methods = []
            while (this.#is(TokenKind.IDENT) || this.#is(TokenKind.KEYWORD)) {
                const method = this.parseImplMethod()
                methods.push(method)
            }
            this.#expect(TokenKind.CURLY_BRACE_RIGHT)
            return new AstImplDecl(receiver, methods)
        }

        /**
         * @returns {Ast}
         */
        parseImplMethod() {
            const message = this.parseImplMessage()
            const statement = this.parseImplStatement()
            return new AstImplMethod(message, statement)
        }

        /**
         * @returns {Ast}
         */
        parseImplMessage() {
            if (this.#is(TokenKind.IDENT)) {
                return new AstImplUnary(this.#advance().value)
            } else if (this.#is(TokenKind.KEYWORD)) {
                const selectors = []
                const args = []
                while (this.#is(TokenKind.KEYWORD)) {
                    selectors.push(this.#advance().value)
                    args.push(this.#expect(TokenKind.IDENT).value)
                }
                return new AstImplKeyword(Symbol.for(selectors.join('')), args)
            }
            throw this.#error('a message pattern')
        }

        /**
         * @returns {Ast}
         */
        parseImplStatement() {
            const expr = [this.#isEndOfExpression() ? new AstUnit() : this.parseImplExpression()]
            while (this.#is(TokenKind.SEMICOLON)) {
                this.#advance()
                expr.push(this.#isEndOfExpression() ? new AstUnit() : this.parseImplExpression())
            }
            return new AstStatement(expr)
        }

        /**
         * @returns {Ast}
         */
        parseImplExpression() {
            if (this.#is(TokenKind.RETURN)) {
                return new AstReturn(this.parseSendKeyword())
            }
            return this.parseSendKeyword()
        }

        /**
         * @returns {Ast}
         */
        parseStatement() {
            const expr = [this.#isEndOfExpression() ? new AstUnit() : this.parseExpression()]
            while (this.#is(TokenKind.SEMICOLON)) {
                this.#advance()
                expr.push(this.#isEndOfExpression() ? new AstUnit() : this.parseExpression())
            }
            return new AstStatement(expr)
        }

        /**
         * @returns {Ast}
         */
        parseExpression() {
            return this.parseSendKeyword()
        }

        /**
         * @returns {Ast}
         */
        parseSendUnary() {
            let ast = this.parseTerm()
            while (this.#is(TokenKind.IDENT)) {
                ast = new AstSend(ast, new AstMessageUnary(this.#advance().value))
            }
            return ast
        }

        /**
         * @returns {Ast}
         */
        parseSendKeyword() {
            let ast = this.parseSendUnary()
            if (!this.#is(TokenKind.KEYWORD)) {
                return ast
            }
            const selectors = []
            const args = []
            while (this.#is(TokenKind.KEYWORD)) {
                selectors.push(this.#advance().value)
                args.push(this.parseSendUnary())
            }
            const keyword = new AstMessageKeyword(Symbol.for(selectors.join('')), args)
            return new AstSend(ast, keyword)
        }

        /**
         * @returns {Ast}
         */
        parseBlock() {
            this.#expect(TokenKind.CURLY_BRACE_LEFT)
            const params = this.#is(TokenKind.BAR) ? this.parseBlockParams() : []
            const body = this.#is(TokenKind.CURLY_BRACE_RIGHT)
                ? new AstStatement([])
                : this.parseStatement()
            this.#expect(TokenKind.CURLY_BRACE_RIGHT)
            return new AstBlock(params, body)
        }

        /**
         * @returns {[Symbol]}
         */
        parseBlockParams() {
            const params = []
            this.#expect(TokenKind.BAR)
            if (!this.#is(TokenKind.BAR)) {
                params.push(this.#expect(TokenKind.IDENT).value)
                while (this.#is(TokenKind.COMMA)) {
                    this.#advance()
                    params.push(this.#expect(TokenKind.IDENT).value)
                }
            }
            this.#expect(TokenKind.BAR)
            return params
        }

        /**
         * @returns {Ast}
         */
        parseTerm() {
            if (this.#is(TokenKind.PAREN_LEFT)) {
                this.#expect(TokenKind.PAREN_LEFT)
                const expr = this.parseExpression()
                this.#expect(TokenKind.PAREN_RIGHT)
                return expr
            } else if (this.#is(TokenKind.CURLY_BRACE_LEFT)) {
                return this.parseBlock()
            } else if (this.#is(TokenKind.IDENT)) {
                return new AstVar(this.#advance().value)
            }
            return this.parsePrimitive()
        }

        /**
         * @returns {Ast}
         */
        parsePrimitive() {
            if (this.#is(TokenKind.UNIT)) {
                this.#advance()
                return new AstUnit()
            } else if (this.#is(TokenKind.BOOL)) {
                return new AstBool(this.#advance().value)
            } else if (this.#is(TokenKind.INTEGER)) {
                const value = this.#advance().value
                if (value < -2147483648 || 2147483647 < value) {
                    throw this.#error('i32')
                }
                return new AstI32(value)
            } else if (this.#is(TokenKind.FLOAT)) {
                return new AstF64(this.#advance().value)
            }
            throw this.#error('an expression')
        }

        /**
         * @returns {Token}
         */
        #advance() {
            const token = this.#peek()
            this.#index++
            return token
        }

        /**
         * @param {TokenKind} kind
         * @returns {Token}
         */
        #expect(kind) {
            if (!this.#is(kind)) {
                throw this.#error(kind)
            }
            return this.#advance()
        }

        /**
         * @param {TokenKind | string} expected
         * @returns {ParseError}
         */
        #error(expected) {
            const token = this.#peek()
            const found = token.isOk ? token.kind : 'invalid character'
            return new ParseError(`expected ${expected} but found ${found} at ${token.position.line + 1}:${token.position.col + 1}`)
        }

        /**
         * @returns {boolean}
         */
        #isEndOfExpression() {
            return this.#is(TokenKind.SEMICOLON)
                || this.#is(TokenKind.CURLY_BRACE_RIGHT)
                || this.#is(TokenKind.EOF)
                || this.#is(TokenKind.IMPL)
        }

        /**
         * @param {TokenKind} kind
         * @returns {boolean}
         */
        #is(kind) {
            return this.#tokens[this.#index].isOkAnd((k, _) => k == kind)
        }

        /**
         * @returns {Token}
         */
        #peek() {
            return this.#tokens[this.#index]
        }
    }

    globalThis.Rustytalk = Object.assign(globalThis.Rustytalk ?? {}, {
        Parser: Object.assign(globalThis.Rustytalk?.Parser ?? {}, {
            ParseError,
            Parser,
        }),
    })
})()

export { Rustytalk }
