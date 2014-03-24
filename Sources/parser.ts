/// <reference path="ast.ts"/>


interface Precedence {
    [operator : string] : number
}




class BinOpBuilder {

    private opExp : Exp[] = [];
    private opOp : string[] = [];

    private static rightAssociativeOps = ["=", ":", "of"];
    private static opPrecedence : Precedence = {
        ".": 160,
        "of": 150,
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




    public addExpAndOpToSequence (asi : Exp, op : string) : void {
        this.opExp.push(asi);
        this.opOp.push(op);
    }




    public addExpToSequence (asi : Exp) {
        this.opExp.push(asi);
    }




    public isEmpty () : boolean {
        return this.opExp.length === 0;
    }




    public buildBinOpApplyTreeFromSequence () : Exp {
        BinOpBuilder.reorderBinOpsSequence(this.opExp, this.opOp);
        var res = BinOpBuilder.joinBinOpsSequence(this.opExp, this.opOp);
        this.opExp = [];
        this.opOp = [];
        return res;
    }




    private static reorderBinOpsSequence (opExp : Exp[],
                                          opOp : string[]) : void {
        var prec = BinOpBuilder.opPrecedence;
        var right = BinOpBuilder.rightAssociativeOps;
        do {
            var numChanges = 0;
            for (var i = opOp.length - 1; i !== 0; --i) {
                var op = opOp[i];
                var opPrev = opOp[i - 1];
                if (!(op === opPrev && right.contains(op)) &&
                    prec[op] <= prec[opPrev])
                    continue;
                opExp[i] = new BinOpApply(undefined,
                                          new Ident(undefined, op),
                                          opExp[i],
                                          opExp[i + 1]);
                opExp.removeAt(i + 1);
                opOp.removeAt(i);
                ++numChanges;
            }
        } while (numChanges !== 0);
    }




    private static joinBinOpsSequence (opExp : Exp[], opOp : string[]) : Exp {
        for (var i = 0; i < opOp.length; ++i) {
            var op = opOp[i];
            var op2 = opExp[i + 1];
            if (op === ".") {
                if (!(op2 instanceof Ident))
                    throw "expected identifier after dot.";
                opExp[i + 1] = new Member(undefined, opExp[i], <Ident>op2);
            } else {
                opExp[i + 1] = new BinOpApply(
                    undefined, new Ident(undefined, op), opExp[i], op2);
            }
        }
        return opExp.last();
    }
}




class Parser {

    private code : string;
    private index : number;
    private matched : string;

    private useVarKeyword : boolean;
    private binOpBuilder = new BinOpBuilder();


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
        var item : Asi;
        //noinspection AssignmentResultUsedJS
        while (item = this.parseMany())
            items.push(item);
        return new AsiList(undefined, items);
    }




    private parseMany () : Asi {
        while (true) {
            var asi = this.parseOne();

            if (!asi)
                return undefined;

            this.skipWhite();

            if (this.matchOp()) {
                this.binOpBuilder.addExpAndOpToSequence(<Exp>asi, this.matched);
            } else if (!this.binOpBuilder.isEmpty()) {
                this.binOpBuilder.addExpToSequence(<Exp>asi);
                return this.binOpBuilder.buildBinOpApplyTreeFromSequence();
            } else {
                return asi;
            }
        }
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




    private parseOne () : Asi {

        if (this.finished())
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

        var ch = this.code[this.index];

        if (ch === '{')
            return this.parseScopeStart();
        else if (ch === '}')
            ++this.index;

        return undefined;
    }




    private parseScopeStart () : Scope {
        ++this.index;
        return new Scope(undefined, this.parseAsiList());
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

        if (!(asi instanceof Exp))
            throw "test of if stastement msut be expression not statement";

        if (this.matchText("then"))
            then = this.parseScopedExp();

        if (this.matchText("else"))
            otherwise = this.parseScopedExp();

        return new If(undefined, <Exp>asi, then, otherwise);
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
        if (this.skipWhite()) {
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




    private finished () : boolean {
        this.skipWhite();
        return this.index === this.code.length;
    }




    // Return value identifies if white space skipped contained a new line
    private skipWhite () : boolean {
        while (this.index !== this.code.length) {
            var ch = this.code[this.index];
            if (ch === ' ' || ch === '\t') {
                ++this.index;
            } else if (ch === '\n' || ch === '\r') {
                ++this.index;
                return true
            } else {
                return false;
            }
        }
    }
}