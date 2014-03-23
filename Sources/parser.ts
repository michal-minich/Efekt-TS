/// <reference path="ast.ts"/>


interface Precedence {
    [operator : string] : number
}




class Parser {

    private code : string;
    private index : number;
    private matched : string;
    private lineCrossed : boolean;
    private useVarKeyword : boolean;
    private opExp : Exp[] = [];
    private opOp : string[] = [];
    private rightAssociativeOps = ["=", ":", "of"];
    private opPrecedence : Precedence = {
        ".": 150,
        "of": 145,
        ":": 140,
        "*": 130, "/": 130, "%": 130,
        "+": 120, "-": 120,
        "<<": 110, ">>": 110,
        "<": 100, ">": 90, ">=": 80, "<=": 70,
        "==": 60, "!=": 60,
        "&": 50,
        "^": 40,
        "|": 30,
        "&&": 20, "and": 20,
        "||": 10, "or": 10,
        "=": 0, "*=": 0, "/=": 0, "%=": 0, "+=": 0, "-=": 0, "<<=": 0, ">>=": 0,
        "&==": 0, "^=": 0, "|=": 0
    };




    public parse (code : string) : AsiList {

        this.code = code;
        this.index = 0;
        var al = this.parseAsiList();

        if (code.length !== this.index)
            console.log("not all code parsed. not parsed char count: " +
                            (code.length - this.index));
        return al;
    }




    private parseAsiList () : AsiList {
        var items : Asi[] = [];
        while (true) {
            var item = this.parseMany();
            if (!item)
                break;
            items.push(item);
        }
        return new AsiList(undefined, items);
    }




    private static getMember (asi : Asi) : Asi {
        if (asi instanceof BinOpApply) {
            var o = <BinOpApply>asi;
            if (o.op.name === ".") {
                if (o.op2 instanceof Ident)
                    asi = new Member(undefined,
                                     Parser.getMember(o.op1),
                                     <Ident>o.op2);
                else
                    throw "expected identifier after dot.";
            }
        }

        return asi;
    }




    private parseMany () : Asi {
        var asi = this.parseOne();
        var isMatch = true;
        while (isMatch && asi) {
            isMatch = false;
            asi = Parser.getMember(asi);
            if (asi instanceof Member)
                isMatch = true;
            this.skipWhite();
            if (this.index === this.code.length)
                return asi;
            var ch = this.code[this.index];

            if (ch == '(') {

            } else {
                if (this.opOp.length === 0) {
                    while (this.matchOp()) {
                        this.opExp.push(<Exp>asi);
                        this.opOp.push(this.matched);
                        asi = this.parseMany();
                        isMatch = true;
                        this.skipWhite();
                        if (this.index === this.code.length)
                            break;
                    }
                    if (this.opOp.length !== 0)
                        asi = this.buildBinOpApply(asi, this.opExp, this.opOp);
                    this.opExp = [];
                    this.opOp = [];
                }
            }

            asi = this.buildVar(asi);
        }

        return asi;
    }




    private buildVar (asi : Asi) : any /* Asi|Var */ {
        if (!(asi instanceof BinOpApply))
            return asi;
        asi = this.buildOneVar(<BinOpApply>asi);
        if (!(asi instanceof BinOpApply))
            return asi;
        var opa = <BinOpApply>asi;
        opa.op1 = this.buildVar(opa.op1);
        opa.op2 = this.buildVar(opa.op2);
        return opa;
    }




    private buildOneVar (opa : BinOpApply) : any /* BinOpApply|Var */ {
        var ident : Ident = undefined;
        var type : Exp = undefined;
        var constraint : Exp = undefined;
        var value : Exp = undefined;
        if (opa.op.name === "=") {
            value = opa.op2;
            if (opa.op1 instanceof BinOpApply)
                opa = <BinOpApply>opa.op1;
            else if (opa.op1 instanceof Ident)
                ident = <Ident>opa.op1;
            else
                throw "expected ident before '='";
        }

        if (opa.op.name === ":") {
            if (opa.op1 instanceof Ident)
                ident = <Ident>opa.op1;
            else
                throw "expected ident before ':'";

            if (opa.op2 instanceof BinOpApply)
                opa = <BinOpApply>opa.op2;
            else
                type = opa.op2;
        }

        if (opa.op.name == "of") {
            if (ident)
                type = opa.op1;
            else if (opa.op1 instanceof Ident) {
                var i = <Ident>opa.op1;
                if (i.name[0] >= 'a' && i.name[0] <= 'z')
                    ident = i;
                else
                    type = i;
            } else
                throw "type before 'of' must be Ident if var ident is not specified";

            constraint = opa.op2;
        }

        if (ident || type || constraint || value) {
            var v = new Var(undefined, ident, type, constraint, value);
            v.useVarKeyword = this.useVarKeyword;
            this.useVarKeyword = false;
            return v;
        }

        return opa;
    }




    private buildBinOpApply (asi : Asi,
                             opExp : Exp[],
                             opOp : string[]) : BinOpApply {
        opExp.push(<Exp>asi);
        var numChanges = 0;
        do {
            numChanges = 0;
            for (var i = opOp.length - 1; i !== 0; --i) {
                var op = opOp[i];
                var opPrev = opOp[i - 1];
                if (this.opPrecedence[op] <= this.opPrecedence[opPrev]
                    && !(op === opPrev &&
                        this.rightAssociativeOps.indexOf(op) !== -1))
                    continue;
                var ident = new Ident(undefined, op);
                opExp[i] = new BinOpApply(undefined, ident, opExp[i],
                                          opExp[i + 1]);
                opExp.splice(i + 1, 1);
                opOp.splice(i, 1);
                ++numChanges;
            }
        } while (numChanges !== 0);

        for (var i = 0; i < opOp.length; ++i) {
            var ident = new Ident(undefined, opOp[i]);
            opExp[i + 1] = new BinOpApply(undefined, ident, opExp[i],
                                          opExp[i + 1]);
        }
        return <BinOpApply>opExp[opExp.length - 1];
    }




    private parseOne () : Asi {

        this.skipWhite();

        if (this.index === this.code.length)
            return undefined;

        if (this.match(Parser.isInt))
            return new Int(undefined, this.matched);

        if (this.matchText("true"))
            return new Bool(undefined, true);

        if (this.matchText("false"))
            return new Bool(undefined, false);

        if (this.matchText("var"))
            return this.parseVar();

        if (this.matchText("if"))
            return this.parseIf();

        if (this.matchText("loop"))
            return this.parseLoop();

        if (this.matchText("break"))
            return new Break(undefined);

        if (this.matchText("continue"))
            return new Continue(undefined);

        if (this.matchText("return"))
            return this.parseSimpleKeyword<Return>(Return, false);

        if (this.matchText("throw"))
            return this.parseSimpleKeyword<Throw>(Throw, false);

        if (this.matchText("try"))
            return this.parseTry();

        if (this.matchText("new"))
            return this.parseSimpleKeyword<New>(New, true);

        if (this.matchText("typeof"))
            return this.parseSimpleKeyword<TypeOf>(TypeOf, true);

        if (this.matchText("struct"))
            return this.parseStruct();

        if (this.matchText("interface"))
            return this.parseInterface();

        if (this.matchText("interface"))
            return this.parseInterface();

        if (this.matchText("interface"))
            return this.parseInterface();

        if (this.match(Parser.isIdent))
            return new Ident(undefined, this.matched);

        // parse scope
        var ch = this.code[this.index];
        if (ch === '{') {
            ++this.index;
            return new Scope(undefined, this.parseAsiList());
        }

        if (ch === '}') {
            ++this.index;
            return undefined;
        }
        // end parse scope

        return undefined;
    }




    private parseVar () : Asi {
        this.useVarKeyword = true;
        var asi = this.parseMany();
        if (this.useVarKeyword && asi instanceof Ident) {
            var v = new Var(undefined, <Ident>asi, undefined, undefined,
                            undefined);
            v.useVarKeyword = true;
            return v;
        } else {
            return this.buildVar(asi);
        }
    }




    private parseIf () : If {
        var test : Exp;
        var then : Scope;
        var otherwise : Scope = undefined;
        var asi = this.parseMany();

        if (asi instanceof Exp)
            test = <Exp>asi;
        else
            throw "test of if stastement msut be expression not statement";

        this.skipWhite();
        if (this.matchText("then"))
            then = this.parseScopedExp();
        if (this.matchText("else"))
            otherwise = this.parseScopedExp();

        return new If(undefined, test, then, otherwise);
    }




    private parseInterface () : Interface {
        return new Interface(undefined, this.parseScopedExp());
    }



    private parseStruct () : Struct {
        return new Struct(undefined, this.parseScopedExp());
    }




    private parseLoop () : Loop {
        return new Loop(undefined, this.parseScopedExp());
    }




    private parseScopedExp () : Scope {
        var asi = this.parseMany();
        if (asi instanceof Scope)
            return <Scope>asi;
        return new Scope(undefined, new AsiList(undefined, [asi]));
    }



    private parseTry () : Try {
        var body = this.parseScopedExp();
        var fin : Scope = undefined;
        this.skipWhite();
        if (this.matchText("finally"))
            fin = this.parseScopedExp();
        return new Try(undefined, body, fin);
    }




    private parseSimpleKeyword<T extends Exp> (TConstructor : any,
                                               expIsRequired : boolean) : T {
        this.skipWhite();
        if (this.lineCrossed) {
            if (expIsRequired)
                throw TConstructor.getTypeName() + " requires expression";
            else
                return new TConstructor(undefined, undefined);
        }
        var asi = this.parseMany();
        if (asi instanceof Exp)
            return new TConstructor(undefined, <Exp>asi);
        throw "expression expected after " + TConstructor.getTypeName() +
            ", not statement";
    }



    private static isInt (ch : string) : boolean {
        return ch >= '0' && ch <= '9';
    }

    private static isOp (ch : string) : boolean {
        return ch === '.' || ch === '+' || ch === '-' || ch === '*' ||
            ch === '%' || ch === '=' || ch === ':' || ch === '!' ||
            ch === '~' || ch === '@' || ch === '#' || ch === '^' ||
            ch === '&' || ch === '/' || ch === '|' || ch === '<' ||
            ch === '>' || ch === '?' || ch === ',' || ch === '$' ||
            ch === '\\';
    }

    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') || ch === '_';
    }




    private matchOp () : boolean {
        var m = this.match(Parser.isOp);
        if (m)
            return true;
        if (this.index + 1 < this.code.length) {
            m = this.code.indexOf("of", this.index) === this.index;
            if (m) {
                this.index += 2;
                this.matched = "of";
                return true;
            }
        }
        return false;
    }




    private match (isMatch : (ch : string) => boolean) : boolean {
        this.matched = undefined;
        var i = this.index;
        do
        {
            if (!isMatch(this.code[i])) {
                if (i > this.index)
                    break;
                else
                    return false;
            }
            ++i;
        } while (this.code.length > i);

        this.matched = this.code.substr(this.index, i - this.index);
        this.index = i;
        return true;
    }




    private matchText (text : string) : boolean {
        var isMatch = this.index + text.length <= this.code.length
            && this.code.indexOf(text, this.index) === this.index;
        if (isMatch)
            this.index += text.length;
        return isMatch;
    }




    private skipWhite () : void {
        this.lineCrossed = false;
        while (this.index !== this.code.length) {
            var ch = this.code[this.index];
            if (ch === ' ' || ch === '\t') {
                ++this.index;
            } else if (ch === '\n' || ch === '\r') {
                ++this.index;
                this.lineCrossed = true;
            } else {
                return;
            }
        }
    }
}