const program = `
draw_line(p0: Point, p1: Point, color: Color) do
    y(x: Int) = (p1.y - p0.y)*x + (p0.y * p1.x - p0.x * p1.y)
    for x = p0.x to p1.x do
        put_pixel(x, y(x), color)
    end
end

3 + 5y + x
`

const graphixGrammar = ohm.grammar(`
    Graphix {
        Exp
            = 
            | AddExp
            | Function
            | FunctionCallExp
            | access_exp

        FunctionBodyExp
            = Exp
            | ForExp
            | InlineFunction

        ForExp
            = "for" ident "=" Exp "to" Exp "do" Exp* "end"

        InlineFunction
            = ident "(" ListOf<FunctionParam, ","> ")" "=" Exp+ \n

        Function
            = ident "(" ListOf<FunctionParam, ","> ")" FunctionReturnType? "do" FunctionBodyExp* "end"

        FunctionReturnType
            = ":" FunctionType

        FunctionParam
            = ident ":" FunctionType

        FunctionArgument
            = PriExp

        FunctionType
            = upper alnum*

        FunctionCallExp (a function call)
            = ident "(" ListOf<FunctionArgument, ","> ")"

        access_exp
            = ident "." ident

        // Recurses down through all basic arithmetic to primitive expressions.
        AddExp
            = AddExp "+" MulExp  -- plus
            | AddExp "-" MulExp  -- minus
            | MulExp

        MulExp
            = MulExp "*" ExpExp  -- times
            | MulExp "/" ExpExp  -- divide
            | ExpExp

        ExpExp
            = PriExp "^" ExpExp  -- power
            | PriExp

        // A primitive expression, forming the building blocks of the language.
        PriExp
            = "(" Exp ")"  -- paren
            | "+" PriExp   -- pos
            | "-" PriExp   -- neg
            | ident
            | number

        ident (an identifier)
            = (letter | "_") (alnum | "_")*

        number (a number)
            = digit* "." digit+  -- fract
            | digit+             -- whole
    }
`)

const graphixSemantics = graphixGrammar.createSemantics()
const constants = { Pi: Math.PI, E: Math.E };
graphixSemantics.addOperation('eval', {
    FunctionCallExp(ident, _l, args, _r) {
        let fname = ident.sourceString
        args = args.asIteration().eval()
        if (fname == 'twice') {
            return args.map(x => x * 2)
        } else {
            throw new Error(`function not defined`)
        }
    },
    // NonemptyListOf(a, b, c) {
    //     console.log(a?.sourceString)
    //     console.log(b?.sourceString)
    //     console.log(c?.sourceString)
    //     console.log(a?.eval())
    //     console.log(b?.eval())
    //     // console.log(c?.eval())
    // },
    AddExp_plus(a, _, b) {
        return a.eval() + b.eval()
    },
    AddExp_minus(a, _, b) {
        return a.eval() - b.eval()
    },
    MulExp_times(a, _, b) {
        return a.eval() * b.eval()
    },
    MulExp_divide(a, _, b) {
        return a.eval() / b.eval()
    },
    ExpExp_power(a, _, b) {
        return Math.pow(a.eval(), b.eval())
    },
    PriExp_paren(_l, e, _r) {
        return e.eval()
    },
    PriExp_pos(_, e) {
        return e.eval()
    },
    PriExp_neg(_, e) {
        return e.eval()
    },
    ident(_first_letter, _rest) {
        // Look up the value of a named constant, e.g., 'Pi'.
        return constants[this.sourceString] || 0;
    },
    number(_) {
        // Use `parseFloat` to convert (e.g.) the string '123' to the number 123.
        return parseFloat(this.sourceString);
    },
})

const result = graphixGrammar.match('twice(x: Int): Int do x * 2 end')
result.message && console.log(result.message)
const node = graphixSemantics(result)
result.succeeded() && console.log(node.eval())

window.grammar = graphixGrammar
window.program = program