const arithmetic = ohm.grammar(`
  Arithmetic {
    Exp = AddExp

    AddExp = AddExp "+" MulExp  -- plus
           | AddExp "-" MulExp  -- minus
           | MulExp

    MulExp = MulExp "*" number  -- times
           | MulExp "/" number  -- div
           | number
    
    number = "-"? digit* "." digit+ -- float
           | "-"? digit+            -- int
  }
`)

const arithmeticSemantics = arithmetic.createSemantics()

arithmeticSemantics.addOperation('eval', {
    AddExp_plus(a, _, b) {
        return a.eval() + b.eval()
    },
    AddExp_minus(a, _, b) {
        return a.eval() - b.eval()
    },
    MulExp_times(a, _, b) {
        return a.eval() * b.eval()
    },
    MulExp_div(a, _, b) {
        return a.eval() / b.eval()
    },
    number_float(_sign, _a, _, _b) {
        return parseFloat(this.sourceString)
    },
    number_int(_sign, _) {
        return parseInt(this.sourceString)
    },
})
