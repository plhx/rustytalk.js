/**
 * @file interp.js
 * @copyright 2026 PlasticHeart
 */
import { Rustytalk } from './parser.js'
import './primitives.js'

!(() => {
    const {
        $panic,
        BlockClosure,
        Bool,
        I32,
        Message,
        Transcript,
        Unit,
    } = Rustytalk
    const { Tokenizer } = Rustytalk.Lexer
    const {
        AstBlock,
        AstBool,
        AstF64,
        AstI32,
        AstImplDecl,
        AstImplExpression,
        AstImplMethod,
        AstImplKeyword,
        AstImplStatement,
        AstImplUnary,
        AstMessageKeyword,
        AstMessageUnary,
        AstReturn,
        AstProgram,
        AstSend,
        AstStatement,
        AstUnit,
        AstVar,
        Parser,
    } = Rustytalk.Parser

    class Interpreter {
        constructor() {
            this.globals = { Transcript: new Transcript() }
        }

        /**
         *
         * @param {Ast} ast
         */
        execute(ast) {
            if (ast instanceof AstBlock) {
                return new BlockClosure(ast.params, ast.body, this)
            } else if (ast instanceof AstBool) {
                return new Bool(ast.value)
            } else if (ast instanceof AstF64) {
                $panic('F64 is not supported yet')
            } else if (ast instanceof AstI32) {
                return new I32(ast.value)
            } else if (ast instanceof AstImplDecl) {
                // TODO
                return new Unit()
            } else if (ast instanceof AstMessageKeyword) {
                return new Message(ast.selector, ast.args)
            } else if (ast instanceof AstMessageUnary) {
                return new Message(ast.selector, [])
            } else if (ast instanceof AstProgram) {
                return ast.items.reduce((_, x) => this.execute(x), new Unit())
            } else if (ast instanceof AstSend) {
                const receiver = this.execute(ast.receiver)
                const message = this.execute(ast.message)
                const name = message.selector.description.replaceAll(':', '_')
                if (typeof receiver[name] != 'function') {
                    $panic(`${receiver.constructor.name} does not understand #${message.selector.description}`)
                }
                return receiver[name](...message.args.map(x => this.execute(x)))
            } else if (ast instanceof AstStatement) {
                return ast.exprs.reduce((_, x) => this.execute(x), new Unit())
            } else if (ast instanceof AstUnit) {
                return new Unit()
            } else if (ast instanceof AstVar) {
                const value = this.globals[ast.name.description]
                if (value === undefined) {
                    $panic(`undefined variable ${ast.name.description}`)
                }
                return value
            }
            $panic(`cannot execute ${ast.constructor.name}`)
        }
    }

    const input = `
Transcript show: 20;
Transcript show: (20 saturatingAdd: (true ifTrue: {1} ifFalse: {2}));

impl I32 {
    double {self saturatingAdd: self}
}
    `
    const tokenizer = new Tokenizer(input)
    const parser = new Parser(tokenizer.tokenizeAll())
    const ast = parser.parse()
    console.log(`>>> ${input}`)
    console.log(`${ast.toString()}`)
    const interpreter = new Interpreter().execute(ast)
})()

export { Rustytalk }
