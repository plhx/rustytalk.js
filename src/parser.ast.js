/**
 * @file parser.ast.js
 * @copyright 2026 PlasticHeart
 */

!(() => {
    class Ast {
        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} {}`
        }
    }

    class AstProgram extends Ast {
        /**
         * @param {[Ast]} items
         */
        constructor(items) {
            super()
            this.items = items
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { items: ${this.items.map(x => x.toString()).join(', ')} }`
        }
    }

    class AstImplDecl extends Ast {
        /**
         * @param {Symbol} receiver
         * @param {Ast} methods
         */
        constructor(receiver, methods) {
            super()
            this.receiver = receiver
            this.methods = methods
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { receiver: ${this.receiver.description}, methods: ${this.methods.map(x => x.toString()).join(', ')} }`
        }
    }

    class AstImplMethod extends Ast {
        /**
         * @param {Ast} message
         * @param {Ast} statement
         */
        constructor(message, statement) {
            super()
            this.message = message
            this.statement = statement
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { message: ${this.message}, statement: ${this.statement} }`
        }
    }

    class AstImplStatement extends Ast {
        /**
         * @param {[Ast]} exprs
         */
        constructor(expr) {
            super()
            this.exprs = exprs
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { exprs: ${this.exprs.map(x => x.toString()).join(', ')} }`
        }
    }

    class AstImplUnary extends Ast {
        /**
         * @param {Symbol} selector
         */
        constructor(selector) {
            super()
            this.selector = selector
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { selector: ${this.selector.description} }`
        }
    }

    class AstImplKeyword extends Ast {
        /**
         * @param {Symbol} selector
         * @param {[Symbol]} args
         */
        constructor(selector, args) {
            super()
            this.selector = selector
            this.args = args
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { selector: ${this.selector.description}, args: ${this.args.map(x => x.description).join(', ')} }`
        }
    }

    class AstStatement extends Ast {
        /**
         * @param {[Ast]} exprs
         */
        constructor(exprs) {
            super()
            this.exprs = exprs
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { exprs: ${this.exprs.map(x => x.toString()).join(', ')} }`
        }
    }

    class AstSend extends Ast {
        /**
         * @param {Ast} receiver
         * @param {Ast} message
         */
        constructor(receiver, message) {
            super()
            this.receiver = receiver
            this.message = message
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { receiver: ${this.receiver}, message: ${this.message} }`
        }
    }

    class AstMessageUnary extends Ast {
        /**
         * @param {Symbol} selector
         */
        constructor(selector) {
            super()
            this.selector = selector
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { selector: ${this.selector.description} }`
        }
    }

    class AstMessageKeyword extends Ast {
        /**
         * @param {Symbol} selector
         * @param {[Ast]} args
         */
        constructor(selector, args) {
            super()
            this.selector = selector
            this.args = args
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} { selector: ${this.selector.description}, args: ${this.args.map(x => x.toString()).join(', ')} }`
        }
    }

    class AstBlock extends Ast {
        /**
         * @param {[Symbol]} params
         * @param {Ast} body
         */
        constructor(params, body) {
            super()
            this.params = params
            this.body = body
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name} {}`
        }
    }

    class AstReturn extends Ast {
        /**
         * @param {Ast} expr
         */
        constructor(expr) {
            super()
            this.expr = expr
        }
    }

    class AstVar extends Ast {
        /**
         * @returns {Symbol} name
         */
        constructor(name) {
            super()
            this.name = name
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name}(${this.name.description})`
        }
    }

    class AstUnit extends Ast {
        /**
         * @returns {string}
         */
        toString() {
            return '()'
        }
    }

    class AstBool extends Ast {
        /**
         * @param {boolean} value
         */
        constructor(value) {
            super()
            this.value = value
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name}(${this.value})`
        }
    }

    class AstI32 extends Ast {
        /**
         * @param {number} value
         */
        constructor(value) {
            super()
            this.value = value
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name}(${this.value})`
        }
    }

    class AstF64 extends Ast {
        /**
         * @param {number} value
         */
        constructor(value) {
            super()
            this.value = value
        }

        /**
         * @returns {string}
         */
        toString() {
            return `${this.constructor.name}(${this.value})`
        }
    }

    globalThis.Rustytalk = Object.assign(globalThis.Rustytalk ?? {}, {
        Parser: Object.assign(globalThis.Rustytalk?.Parser ?? {}, {
            Ast,
            AstBlock,
            AstBool,
            AstF64,
            AstI32,
            AstImplDecl,
            AstImplKeyword,
            AstImplMethod,
            AstImplStatement,
            AstImplUnary,
            AstMessageKeyword,
            AstMessageUnary,
            AstImplMethod,
            AstReturn,
            AstSend,
            AstStatement,
            AstProgram,
            AstUnit,
            AstVar,
        }),
    })
})()

export const Rustytalk = globalThis.Rustytalk
