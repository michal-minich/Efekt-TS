/// <reference path="ast.ts"/>


class Parser {

    private code : string;
    private index : number;
    private matched : string;
    private lineCrossed : boolean;




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
        while (isMatch && asi && this.index !== this.code.length) {
            isMatch = false;
            this.skipWhite();
            if (this.index !== this.code.length) {
                var ch = this.code[this.index];
                if (ch == '(') {

                } else if (this.matchOp()) {
                    asi = this.parseBinOpApply(asi);
                    isMatch = true;
                }
            }
        }

        return asi;
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

        if (this.matchText("loop"))
            return this.parseLoop();

        if (this.matchText("break"))
            return new Break(undefined);

        if (this.matchText("continue"))
            return new Continue(undefined);

        if (this.matchText("return"))
            return this.parseReturn();

        if (this.match(Parser.isIdent))
            return new Ident(undefined, this.matched);

        if (this.code[this.index] == '{') {
            ++this.index;
            return new Scope(undefined, this.parseAsiArray());
        }

        if (this.code[this.index] == '}') {
            ++this.index;
            return undefined;
        }

        return undefined;
    }




    private parseReturn () : Return {
        this.skipWhite();
        if (this.lineCrossed)
            return new Return(undefined, undefined);
        var asi = this.parseMany();
        if (asi instanceof Exp)
            return new Return (undefined, <Exp>asi);
        throw "expression expected after return, not statement";
    }




    private parseLoop () : Loop {
        var asi = this.parseOne();
        if (asi instanceof Scope)
            return new Loop(undefined, <Scope>asi);
        throw "scope expected after loop";
    }



    private parseVar () : Var {
        var ident : Ident = undefined;
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




    private parseBinOpApply (op1 : Asi) : BinOpApply {
        var op = new Ident(undefined, this.matched);
        var op2 = this.parseMany();
        return new BinOpApply(undefined, op, <Exp>op1, op2);
    }




    private static isInt (ch : string) : boolean {
        return ch >= '0' && ch <= '9';
    }

    public static isOp (ch : string) : boolean {
        return ch == '+' || ch == '-' || ch == '*' || ch == '\\' || ch == '%' || ch == '='
            || ch == ':';
    }

    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_';
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