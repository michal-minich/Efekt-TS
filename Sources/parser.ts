/// <reference path="ast.ts"/>
/// <reference path="common.ts"/>

interface Precedence {
    [operator : string] : number
}



interface TextToAsiFn {
    [match : string] : () => Asi;
}



class BinOpBuilder {

    private opExp : Exp[] = [];
    private opOp : string[] = [];

    private static rightAssociativeOps =
        [":", "of", "=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=",
         "&==", "^=", "|="];

    // \n is virtual operator that binds fn exp to braced to make fn apply
    private static opPrecedence : Precedence = {
        ".": 160,
        "\n": 160,
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
        ",": 5,
        "=": 3, "*=": 3, "/=": 3, "%=": 3, "+=": 3, "-=": 3, "<<=": 3, ">>=": 3,
        "&==": 3, "^=": 3, "|=": 3
    };

    private logger : LogWritter;




    constructor (logger : LogWritter) {
        this.logger = logger;
    }




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
        this.reorderBinOpsSequence(this.opExp, this.opOp);
        var res = this.joinBinOpsSequence(this.opExp, this.opOp);
        this.opExp = [];
        this.opOp = [];
        return res;
    }




    private reorderBinOpsSequence (opExp : Exp[], opOp : string[]) : void {
        var prec = BinOpBuilder.opPrecedence;
        var right = BinOpBuilder.rightAssociativeOps;
        do {
            var numChanges = 0;
            for (var i = opOp.length - 1; i !== 0; --i) {
                var op = opOp[i];
                var opPrev = opOp[i - 1];
                if (!right.contains(opPrev) && prec[op] <= prec[opPrev])
                    continue;
                opExp[i] = this.combineExp(op, opExp[i], opExp[i + 1]);
                opExp.removeAt(i + 1);
                opOp.removeAt(i);
                ++numChanges;
                i = opOp.length;
            }
        } while (numChanges !== 0);
    }




    private joinBinOpsSequence (opExp : Exp[], opOp : string[]) : Exp {
        for (var i = 0; i < opOp.length; ++i)
            opExp[i + 1] = this.combineExp(
                opOp[i], opExp[i], opExp[i + 1]);
        return opExp.last();
    }




    private combineExp (op : string, op1 : Exp, op2 : Exp) : Exp {
        if (op === ".") {
            if (!(op2 instanceof Ident))
                this.logger.fatal("Expected identifier after '.'.");
            return new Member(undefined, op1, <Ident>op2);
        } else if (op === "\n") {
            return new FnApply(undefined, <Braced>op2, op1);
        } else if (op === "=") {
            return new Assign(undefined, op1, op2);
        } else if (op === ":") {
            return new ValueVar(undefined, op1, op2);
        } else if (op === "of") {
            return new TypeVar(undefined, op1, op2);
        } else if (op === ",") {
            if (op1 instanceof ExpList) {
                var el = <ExpList>op1;
                el.add(op2);
                return el;
            }
            return new ExpList(undefined, [op1, op2]);
        } else {
            return new BinOpApply(undefined, new Ident(undefined, op), op1,
                                  op2);
        }
    }
}




class Parser {

    private logger : LogWritter;

    private code : string;
    private index : number;
    private matched : string;
    private nextIsAttr : boolean;




    constructor (logger : LogWritter) {
        this.logger = logger;
    }




    public parse (code : string) : AsiList {
        this.code = code;
        this.index = 0;
        if (code.length === 0)
            return new AsiList(undefined, []);
        var al = this.parseAsiList();
        if (code.length !== this.index)
            this.logger.error("Not all code parsed. not parsed. " +
                                  "Remaining char count: " +
                                  (code.length - this.index));
        return al;
    }




    private parseAsiList (startsWithCurly : boolean = false) : AsiList {
        var items : Asi[] = [];
        if (this.code.length !== 0) {
            while (true) {
                var item = this.parseMany(startsWithCurly);
                if (!item)
                    break;
                items.push(item);
                if (this.code[this.index - 1] === '}')
                    break;
            }
        }
        return new AsiList(undefined, items);
    }




    private parseMany (startsWithCurly : boolean = false) : Asi {
        var b = new BinOpBuilder(this.logger);
        while (true) {
            var asi = this.parseOne();
            this.skipWhite();
            if (this.matchChar(']') || this.matchChar('}') ||
                this.matchChar(')')) {
                if (!b.isEmpty()) {
                    if (asi)
                        b.addExpToSequence(<Exp>asi);
                    asi = b.buildBinOpApplyTreeFromSequence();
                }
                if (this.code[this.index - 1] === '}' && !startsWithCurly)
                    --this.index;
                return asi;
            } else if (this.matchChar('(')) {
                --this.index;
                b.addExpAndOpToSequence(<Exp>asi, "\n");
            } else if (this.matchOp()) {
                b.addExpAndOpToSequence(<Exp>asi, this.matched);
            } else if (!b.isEmpty()) {
                b.addExpToSequence(<Exp>asi);
                asi = b.buildBinOpApplyTreeFromSequence();
                return asi;
            } else {
                return asi;
            }
        }
    }




    private matchTextToFn : TextToAsiFn = {
        "true": () => new Bool(undefined, true),
        "false": () => new Bool(undefined, false),
        "void": () => new Void(undefined),
        "var": () => this.parseVar(),
        "if": () => this.parseIf(),
        "fn": () => this.parseFn(),
        "loop": () => this.parseLoop(),
        "break": () => new Break(undefined),
        "continue": () => new Continue(undefined),
        "label": () => this.parseSimpleKeyword<Label>(Label, true),
        "goto": () => this.parseSimpleKeyword<Goto>(Goto, true),
        "import": () => this.parseSimpleKeyword<Import>(Import, true),
        "return": () => this.parseSimpleKeyword<Return>(Return, false),
        "throw": () => this.parseSimpleKeyword<Throw>(Throw, false),
        "try": () => this.parseTry(),
        "new": () => this.parseSimpleKeyword<New>(New, true),
        "typeof": () => this.parseSimpleKeyword<TypeOf>(TypeOf, true),
        "struct": () => this.parseStruct(),
        "interface": () => this.parseInterface()
    };




    private parseVar () {
        var v = this.parseSimpleKeyword<Var>(Var, true);
        if (!(v.exp instanceof Ident || v.exp instanceof Assign
            || v.exp instanceof ValueVar || v.exp instanceof TypeVar))
            this.logger.error("Expected identifier after var.");
        return v;
    }




    private parseOne () : Asi {
        var attrs : Exp[] = [];
        while (this.matchChar('@')) {
            this.nextIsAttr = true;
            var asi = this.parseMany();
            if (asi && asi instanceof Exp) {
                attrs.push(<Exp>asi);
            } else {
                throw "exp expected after @";
            }
            if (this.finished()) {
                throw "finished with attributes without exp";
            }
        }
        var asi = this.parseOneAsi();
        if (asi) {
            var el = new ExpList(undefined, attrs);
            el.parent = asi;
            asi.attrs = el;
        }
        return asi;
    }




    private parseOneAsi () : Asi {

        if (this.finished())
            return undefined;

        else if (this.matchText('--'))
            this.parseCommentLine();

        else if (this.matchText('/*'))
            this.parseCommentMulti();

        if (this.finished())
            return undefined;

        for (var m in this.matchTextToFn)
            if (this.matchText(m))
                return this.matchTextToFn[m]();

        if (this.match(Parser.isInt))
            return new Int(undefined, this.matched);

        else if (this.match(Parser.isIdent)) {
            var i = new Ident(undefined, this.matched);
            if (this.nextIsAttr) {
                i.name = "@" + i.name;
                this.nextIsAttr = false;
            }
            return i;
        }

        if (this.matchChar('{'))
            return new Scope(undefined, this.parseAsiList(true));

        else if (this.matchChar('('))
            return this.parseBracedOrArr<Braced>(Braced);

        else if (this.matchChar('"'))
            return this.parseString();

        else if (this.matchChar('['))
            return this.parseBracedOrArr<Arr>(Arr);

        return undefined;
    }




    private parseFn () : Fn {
        var asi = this.parseMany();
        if (asi instanceof Braced) {
            var bc = <Braced>asi;
            asi = this.parseOne();
            if (!(asi instanceof Scope)) {
                this.logger.fatal("Expected scope after fn (...).");
                throw undefined;
            }
            return new Fn(undefined, bc, <Scope>asi);
        } else {
            this.logger.fatal("Expected braced after fn.");
            throw undefined;
        }
    }




    private parseBracedOrArr<T extends Exp> (TConstructor : any) : T {
        var asi = this.parseMany();
        var el : ExpList;
        if (asi)
            el = asi instanceof ExpList
                ? <ExpList>asi
                : new ExpList(undefined, [asi]);
        else
            el = new ExpList(undefined, []);

        return new TConstructor(undefined, el);
    }




    private parseString () : Arr {
        var chars : Char[] = [];
        while (true) {
            var ch = this.code[this.index];
            ++this.index;
            if (ch === '"')
                return new Arr(undefined, new ExpList(undefined, chars),
                               new TypeChar(undefined));
            if (this.index >= this.code.length)
                return new Arr(undefined, new ExpList(undefined, chars),
                               new TypeChar(undefined));
            chars.push(new Char(undefined, ch));
        }
    }




    private parseCommentLine () : void {
        while (this.index < this.code.length &&
            !(this.code[this.index] === '\n' ||
                this.code[this.index] === '\r')) {
            ++this.index;
        }
        ++this.index;
    }




    private parseCommentMulti () : void {
        while (this.index < this.code.length - 1 &&
            !(this.code[this.index] === '*' &&
                this.code[this.index + 1] === '/')) {
            ++this.index;
        }
        ++this.index;
        ++this.index;
    }




    private parseIf () : If {
        var test : Exp;
        var then : Scope;
        var otherwise : Scope = undefined;
        var asi = this.parseMany();

        if (!(asi instanceof Exp))
            this.logger.fatal("Test of if statement must be expression" +
                                  ", not statement.");

        if (this.matchText("then"))
            then = this.parseScopedExp();

        this.skipWhite();
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
        var asi = this.parseOne();
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
            if (expIsRequired) {
                this.logger.fatal(getTypeName(TConstructor) +
                                      " requires expression");
                throw undefined;
            } else {
                return new TConstructor(undefined, undefined);
            }
        }
        var asi = this.parseMany();
        if (asi instanceof Exp)
            return new TConstructor(undefined, <Exp>asi);
        this.logger.fatal("Expression expected after " +
                              getTypeName(TConstructor) +
                              ", not statement");
        throw undefined;
    }




    private static isInt (ch : string) : boolean {
        return ch >= '0' && ch <= '9';
    }

    private static isOp (ch : string) : boolean {
        return ch === '.' || ch === '+' || ch === '-' || ch === '*' ||
            ch === '%' || ch === '=' || ch === ':' || ch === '!' ||
            ch === '~' /*|| ch === '@'*/ || ch === '#' || ch === '^' ||
            ch === '&' || ch === '/' || ch === '|' || ch === '<' ||
            ch === '>' || ch === '?' || ch === ',' || ch === '$' ||
            ch === '\\';
    }

    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '@';
    }




    private matchOp () : boolean {
        if (this.code.indexOf("--", this.index) === this.index
            || this.code.indexOf("/*", this.index) === this.index)
            return false;
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
        if (this.index >= this.code.length)
            return false;
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




    private matchChar (ch : string) : boolean {
        if (this.index < this.code.length && this.code[this.index] === ch) {
            ++this.index;
            return true;
        }
        return false;
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
        while (this.matchChar(' ') || this.matchChar('\t')) {
        }
        var isNewLine = this.matchChar('\n') || this.matchChar('\r');
        while (this.matchChar(' ') || this.matchChar('\t')
            || this.matchChar('\n') || this.matchChar('\r')) {
        }
        return isNewLine;
    }
}