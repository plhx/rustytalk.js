/**
 * @file primitives.js
 * @copyright 2026 PlasticHeart
 */

!(() => {
    function $clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }

    function $panic(message) {
        throw new PanicError(message)
    }

    class Struct {

    }

    class Unit extends Struct {
        displayString() {
            return '()'
        }
    }

    class Bool extends Struct {
        constructor(value) {
            super()
            this.value = !!value
        }

        and_(other) {
            return new Bool(this.value && other.value)
        }

        ifTrue_ifFalse_(ifTrue, ifFalse) {
            return this.value ? ifTrue.value() : ifFalse.value()
        }

        or_(other) {
            return new Bool(this.value || other.value)
        }

        displayString() {
            return new String(this.value.toString())
        }
    }

    class I32 extends Struct {
        static MAX = 2147483647
        static MIN = -2147483648

        constructor(value) {
            super()
            if (!Number.isInteger(value) || value < I32.MIN || I32.MAX < value) {
                $panic(`${value} is not a valid I32 (expected an integer from ${I32.MIN} to ${I32.MAX})`)
            }
            this.value = value
        }

        saturatingAdd_(other) {
            return new I32($clamp(this.value + other.value, I32.MIN, I32.MAX))
        }

        saturatingSub_(other) {
            return new I32($clamp(this.value - other.value, I32.MIN, I32.MAX))
        }

        saturatingMul_(other) {
            return new I32($clamp(this.value * other.value, I32.MIN, I32.MAX))
        }

        saturatingNeg() {
            return new I32($clamp(-this.value, I32.MIN, I32.MAX))
        }

        displayString() {
            return new String(this.value.toString())
        }
    }

    class String extends Struct {
        constructor(value) {
            super()
            this.value = value
        }

        displayString() {
            return this
        }
    }

    class BlockClosure extends Struct {
        constructor(params, body, env) {
            super()
            this.params = params
            this.body = body
            this.env = env
        }

        value() {
            return this.valueWithArgs_()
        }

        value_(value) {
            return this.valueWithArgs_(value)
        }

        valueWithArgs_(...values) {
            if (this.params.length != arguments.length) {
                $panic(`block expects ${this.params.length} argument(s)`)
            }
            return this.env.execute(this.body)
        }
    }

    class Message extends Struct {
        constructor(selector, args) {
            super()
            this.selector = selector
            this.args = args
        }
    }

    class Transcript extends Struct {
        show_(value) {
            return console.log(value.displayString().value)
        }
    }

    class PanicError extends Error {

    }

    globalThis.Rustytalk = Object.assign(globalThis.Rustytalk ?? {}, {
        $clamp,
        $panic,
        BlockClosure,
        Bool,
        I32,
        Message,
        PanicError,
        String,
        Struct,
        Transcript,
        Unit,
    })
})()

export const Rustytalk = globalThis.Rustytalk
