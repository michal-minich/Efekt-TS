/// <reference path="ast.ts"/>


class Parser {

    private code : string;
    private index : number;
    private matched : string;
    private lineCrossed : boolean;
    private opExp : Exp[] = [];
    private opOp : string[] = [];
    private opPrecedence = {

        "." : 150,

        ":" : 140,

        "*" : 130,
        "/" : 130,
        "%" : 130,

        "+" : 120,
        "-" : 120,

        "<<" : 110,
        ">>" : 110,

        "<" : 100,
        ">" : 90,
        ">=" : 80,
        "<=" : 70,

        "==" : 60,
        "!=" : 60,

        "&" : 50,

        "^" : 40,

        "|" : 30,

        "&&" : 20,
        "and" : 20,

        "||" : 10,
        "or" : 10,

        "=" : 0,
        "*=" : 0,
        "/=" : 0,
        "%=" : 0,
        "+=" : 0,
        "-=" : 0,
        "<<=" : 0,
        ">>=" : 0,
        "&==" : 0,
        "^=" : 0,
        "|=" : 0
    };


    public parse (code : string) : Scope {

        this.code = code;
        this.index = 0;
        var items = this.parseAsiArray();

        if (code.length !== this.index)
            throw "not all code parsed. non parsed char coutn: " + (code.length - this.index);

        return new Scope(null, items);
    }




    private parseAsiArray () : Asi[] {
        var items : Asi[] = [];
        while (true) {
            var item = this.parseMany();
            if (!item)
                break;
            items.push(item);
        }
        return items;
    }




    private parseMany () : Asi {
        var asi = this.parseOne();
        var isMatch = true;
        while (isMatch && asi) {
            isMatch = false;

            if (asi instanceof BinOpApply) {
                var o = <BinOpApply>asi;
                if (o.op.name === ".") {
                    isMatch = true;
                    if (o.op2 instanceof Ident)
                        asi = new Member(undefined, o.op1, <Ident>o.op2);
                    else
                        throw "exptexcted identifier after dot";
                }
            }

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

                    asi = this.parseBinOpApply(asi, this.opExp, this.opOp);
                    this.opExp = [];
                    this.opOp = [];
                }
            }
        }

        return asi;
    }




    private parseBinOpApply (asi : Asi, opExp: Exp[], opOp : string[]) {
        if (opOp.length === 0)
            return asi;
        opExp.push(<Exp>asi);
        var prec = this.opPrecedence;
        for (var i = 0; i < opExp.length - 1; i++) {
            var op = opOp[i];
            if (i < opOp.length - 1) {
                var opNext = opOp[i + 1];
                while (prec[op] < prec[opNext]) {
                    opExp[i + 1] = new BinOpApply(
                        undefined,
                        new Ident(undefined, opNext),
                        opExp[i + 1],
                        opExp[i + 2]);
                    opExp.splice(i + 2, 1);
                    opOp.splice(i + 1, 1);
                    if (i >= opOp.length - 1)
                        break;
                    opNext = opOp[i + 1];
                }
            }
            opExp[i + 1] = new BinOpApply(
                undefined,
                new Ident(undefined, op),
                opExp[i],
                opExp[i + 1]);
        }
        return opExp[opExp.length - 1];
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
            return new Scope(undefined, this.parseAsiArray());
        }

        if (ch === '}') {
            ++this.index;
            return undefined;
        }
        // end parse scope

        return undefined;
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
        return new Scope(undefined, [asi]);
    }



    private parseTry () : Try {
        var body = this.parseScopedExp();
        var fin : Scope = undefined;
        this.skipWhite();
        if (this.matchText("finally"))
            fin = this.parseScopedExp();
        return new Try(undefined, body, fin);
    }




    private parseSimpleKeyword<T extends Exp> (TType : any, expIsRequired : boolean) : T {
        this.skipWhite();
        if (this.lineCrossed) {
            if (expIsRequired)
                throw TType.getTypeName() + " requires expression";
            else
                return new TType(undefined, undefined);
        }
        var asi = this.parseMany();
        if (asi instanceof Exp)
            return new TType(undefined, <Exp>asi);
        throw "expression expected after " + TType.getTypeName() + ", not statement";
    }




    private parseVar () : Var {
        var ident : Ident;
        var type : Exp = undefined;
        var constraint : Exp = undefined;
        var value : Exp = undefined;
        var asi = this.parseMany();
        if (asi instanceof Ident) {
            ident = <Ident>asi;
        } else if (asi instanceof BinOpApply) {
            var o = <BinOpApply>asi;
            ident = <Ident>o.op1;
            if (o.op2 instanceof BinOpApply) {
                var o2 = <BinOpApply>o.op2;
                if (o.op.name === ":")
                    type = o2.op1;
                else if (o.op.name === "of")
                    constraint = o2.op1;
                else
                    throw "invalid var x";

                if (o2.op2 instanceof BinOpApply) {
                    var o3 = <BinOpApply>o2.op2;
                    constraint = o3.op1;
                    if (o3.op.name === "=") {
                        value = o3.op2;
                    } else {
                        throw "invalid after of"
                    }
                } else {
                    if (o2.op.name === "of") {
                        constraint = o2.op2;
                    } else if (o2.op.name === "=") {
                        value = o2.op2;
                    } else {
                        throw "invalid after :";
                    }
                }
            } else {
                if (o.op.name === ":") {
                    type = o.op2;
                } else if (o.op.name === "of") {
                    constraint = o.op2;
                } else if (o.op.name === "=") {
                    value = o.op2;
                } else {
                    throw "invalid after ident"
                }
            }
        } else {
            throw "invalid after var"
        }
        return new Var(undefined, ident, type, constraint, value);
    }



    private static isInt (ch : string) : boolean {
        return ch >= '0' && ch <= '9';
    }

    public static isOp (ch : string) : boolean {
        return ch === '.' || ch === '+' || ch === '-' || ch === '*' || ch === '\\' ||
            ch === '%' || ch === '=' || ch === ':' || ch === '!' || ch === '~' || ch === '@' ||
            ch === '#' || ch === '^' || ch === '&' || ch === '/' || ch === '|' || ch === '<' ||
            ch === '>' || ch === '?' || ch === ',' || ch === '$';
    }

    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
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