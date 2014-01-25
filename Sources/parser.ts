/// <reference path="ast.ts"/>


class Parser {

    private code : string;
    private index : number;
    private length : number;




    public parse (code : string) : Exp {

        this.code = code;
        this.index = 0;

        var items : Exp[] = [];

        while (true) {
            var item = this.parseLong();
            if (!item)
                break;

            items.push(item);
        }

        var sc = new Scope(null, items);

        return sc;
    }




    private parseLong () : Exp {

        if (this.index === this.code.length)
            return undefined;

        while (true) {
            var exp : Exp = null;
            if (this.match(Parser.isInt)) {
                var str = this.code.substr(this.index, this.length);
                exp = new Int(undefined, str);
            }

            this.index += this.length;

            if (!exp || this.index === this.code.length)
                return exp;
        }
    }



    private static isWhite (ch : string) : boolean { return ch == ' ' || ch == '\t'; }

    private static isInt (ch : string) : boolean { return ch >= '0' && ch <= '9'; }

    private static isIdent (ch : string) : boolean { return ch >= 'a' && ch <= 'z'; }



    private match (isMatch : (ch : string) => boolean) : boolean {
        var i  = this.index;
        do
        {
            if (!isMatch(this.code[i]))
            {
                if (i > 0)
                    break;
                else
                    return false;
            }
            ++i;
        } while (this.code.length > i);

        this.length = i;
        return true;
    }
}