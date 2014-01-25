/// <reference path="ast.ts"/>


class Parser {

    private code : string;
    private index : number;
    private matched : string;




    public parse (code : string) : Exp {

        this.code = code;
        this.index = 0;
        var items : Asi[] = [];
        while (true) {
            var item = this.parseMany();
            if (!item)
                break;
            items.push(item);
        }

        if (code.length !== this.index)
            throw "not all code parsed";

        return new Scope(null, items);
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

                } else if (this.match(Parser.isOp)) {
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

        if (this.match(Parser.isIdent))
            return new Ident(undefined, this.matched);

        return undefined;
    }




    private parseVar () : Var {
        var o = <BinOpApply>this.parseMany();
        return new Var(undefined, <Ident>o.op1, o.op2);
    }




    private parseBinOpApply (op1 : Asi) : BinOpApply {
        var op = new Ident(undefined, this.matched);
        var op2 = this.parseMany();
        return new BinOpApply(undefined, op, <Exp>op1, op2);
    }




    private static isWhite (ch : string) : boolean {
        return ch === ' ' || ch === '\t';
    }

    private static isInt (ch : string) : boolean {
        return ch >= '0' && ch <= '9';
    }

    private static isOp (ch : string) : boolean {
        return ch == '+' || ch == '-' || ch == '*' || ch == '\\' || ch == '%' || ch == '='
            || ch == ':';
    }

    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_';
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
        while (this.index !== this.code.length) {
            if (Parser.isWhite(this.code[this.index]))
                ++this.index;
            else
                return;
        }
    }
}