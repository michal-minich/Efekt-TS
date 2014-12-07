/// <reference path="ast.ts"/>
/// <reference path="common.ts"/>
/// <reference path="prelude.ts"/>

interface Precedence {
    [operator : string] : number
}



interface TextToAsiFn {
    [match : string] : () => Asi;
}



class BinOpBuilder {

    private opExp : Asi[] = [];
    private opOp : string[] = [];

    private static rightAssociativeOps =
        ["=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=", "&==", "^=", "|="];

    // \n is virtual operator that binds fn exp to braced to make fn apply
    private static opPrecedence : Precedence = {
        ".": 160,
        "\n": 160,
        "of": 150,
        ":": 140,
        "*": 130, "/": 130, "%": 130,
        "+": 120, "-": 120,
        "<<": 110, ">>": 110,
        "<": 100, ">": 100, ">=": 100, "<=": 100,
        "==": 60, "!=": 60,
        "&": 50,
        "^": 40,
        "|": 30,
        "&&": 20, "and": 20,
        "||": 10, "or": 10,
        "=": 3, "*=": 3, "/=": 3, "%=": 3, "+=": 3, "-=": 3, "<<=": 3, ">>=": 3,
        "&==": 3, "^=": 3, "|=": 3,
        ",": 2
    };

    private logger : LogWriter;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    private castAsi<T extends Exp> (TConstructor : any, asi : Asi) : Exp {
        return castAsi<T>(TConstructor, asi, this.logger);
    }



    public addExpAndOpToSequence (asi : Asi, op : string) : void {
        this.opExp.push(asi);
        this.opOp.push(op);
    }




    public addAsiToSequence (asi : Asi) {
        this.opExp.push(asi);
    }




    public isEmpty () : boolean {
        return this.opExp.length === 0;
    }




    public buildBinOpApplyTreeFromSequence () : Asi {
        this.reorderBinOpsSequence(this.opExp, this.opOp);
        const res = this.joinBinOpsSequence(this.opExp, this.opOp);
        this.opExp = [];
        this.opOp = [];
        return res;
    }




    private reorderBinOpsSequence (opExp : Asi[], opOp : string[]) : void {
        const prec = BinOpBuilder.opPrecedence;
        const right = BinOpBuilder.rightAssociativeOps;
        var i = opOp.length;
        while (i !== 1) {
            --i;
            const op = opOp[i];
            const opPrev = opOp[i - 1];
            if (prec[op] <= prec[opPrev]
                && !(right.contains(opPrev) && right.contains(op)))
                continue;
            opExp[i] = this.combineExp(op, opExp[i], opExp[i + 1]);
            opExp.removeAt(i + 1);
            opOp.removeAt(i);
            i = opOp.length;
        }
    }




    private joinBinOpsSequence (opExp : Asi[], opOp : string[]) : Asi {
        for (var i = 0; i < opOp.length; ++i)
            opExp[i + 1] = this.combineExp(
                opOp[i], opExp[i], opExp[i + 1]);
        return opExp.last();
    }




    private combineExp (op : string, op1 : Asi, op2 : Asi) : Asi {
        if (op === ".") {
            //if (!(op2 instanceof Ident))
            //    this.logger.fatal("Expected identifier after '.'.");
            return new MemberAccess(<Exp>op1,
                                    this.castAsi<Ident>(Ident, op2));
        } else if (op === "\n") {
            return new FnApply(<Braced>op2, <Exp>op1);
        } else if (op === "=") {
            return new Assign(<Exp>op1, <Exp>op2);
        } else if (op === ":") {
            return new Typing(<Exp>op1, <Exp>op2);
        } else if (op === "of") {
            return new Constraining(<Exp>op1, <Exp>op2);
        } else if (op === ",") {
            if (op1 instanceof ExpList) {
                const el = <ExpList>op1;
                el.add(<Exp>op2);
                return el;
            }
            return new ExpList([<Exp>op1, <Exp>op2]);
        } else {
            return new BinOpApply(new Ident(op), <Exp>op1,
                                  <Exp>op2);
        }
    }
}




class Parser {

    private logger : LogWriter;

    private code : string;
    private index : number;
    private matched : string;
    private nextIsAttr : boolean;
    private spares : Asi[] = [];



    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    public parse (code : string) : AsiList {
        if (!prelude)
            prelude = this.parseNoPrelude(preludeStr);
        return this.parseNoPrelude(code);
    }




    public parseNoPrelude (code : string) : AsiList {
        this.code = code;
        this.index = 0;
        if (code.length === 0)
            return new AsiList([]);
        const al = this.parseAsiList();
        if (code.length !== this.index)
            this.logger.error("Not all code parsed. not parsed. " +
                              "Remaining char count: " +
                              (code.length - this.index));
        return al;
    }




    private parseAsiList (startsWithCurly : boolean = false) : AsiList {
        const items : Asi[] = [];
        if (this.code.length !== 0) {
            while (true) {
                const item = this.parseMany(startsWithCurly);
                if (!item)
                    break;
                items.push(item);
                if (this.code[this.index - 1] === '}')
                    break;
            }
        }
        return new AsiList(items);
    }




    private parseMany (startsWithCurly : boolean = false) : Asi {
        const b = new BinOpBuilder(this.logger);
        while (true) {
            var asi = this.parseOne();
            this.skipWhite();
            if (this.matchChar(']') || this.matchChar('}') ||
                this.matchChar(')')) {
                if (!b.isEmpty()) {
                    if (asi)
                        b.addAsiToSequence(asi);
                    asi = b.buildBinOpApplyTreeFromSequence();
                }
                if (this.code[this.index - 1] === '}' && !startsWithCurly)
                    --this.index;
                return asi;
            } else if (this.matchChar('(')) {
                --this.index;
                b.addExpAndOpToSequence(asi, "\n");
            } else if (this.matchOp()) {
                b.addExpAndOpToSequence(asi, this.matched);
            } else if (!b.isEmpty()) {
                b.addAsiToSequence(asi);
                asi = b.buildBinOpApplyTreeFromSequence();
                return asi;
            } else {
                return asi;
            }
        }
    }




    private matchTextToFn : TextToAsiFn = {
        "true": () => new Bool(true),
        "false": () => new Bool(false),
        "void": () => new Void(),
        "var": () => this.parseVar(),
        "if": () => this.parseIf(),
        "fn": () => this.parseFn(),
        "op": () => this.parseOp(),
        "loop": () => this.parseLoop(),
        "break": () => new Break(),
        "continue": () => new Continue(),
        "label": () => this.parseLabel(),
        "goto": () => this.parseGoto(),
        "import": () => this.parseSimpleKeyword<Import>(Import, true),
        "return": () => this.parseSimpleKeyword<Return>(Return, false),
        "throw": () => this.parseSimpleKeyword<Throw>(Throw, false),
        "try": () => this.parseTry(),
        "new": () => this.parseSimpleKeyword<New>(New, true),
        "typeof": () => this.parseSimpleKeyword<TypeOf>(TypeOf, true),
        "pragma": () => this.parseSimpleKeyword<Pragma>(Pragma, true),
        "struct": () => this.parseStruct(),
        "interface": () => this.parseInterface()
    };




    private parseOp () : Ident {
        if (this.match(Parser.isOp)) {
            const i = new Ident(this.matched);
            i.isOp = true;
            return i;
        }
        throw "expected operator after 'op'.";
    }




    private parseVar () : Var {
        const v = this.parseSimpleKeyword<Var>(Var, true);
        /*if (!(v.exp instanceof Ident || v.exp instanceof Assign
            || v.exp instanceof ValueVar || v.exp instanceof TypeVar))
            this.logger.error("Expected identifier after var.");*/
        return v;
    }




    private parseOne () : Asi {
        const attrs : Exp[] = [];
        this.skipWhite();
        while (this.matchChar('@')) {
            this.nextIsAttr = true;
            const asi = this.parseMany();
            if (asi && asi instanceof Exp) {
                attrs.push(asi);
            } else {
                throw "exp expected after @";
            }
            if (this.finished()) {
                throw "finished with attributes without exp";
            }
        }
        if (this.spares.length !== 0)
            return this.spares.pop();

        const asi = this.parseOneAsi();
        if (asi && attrs.length !== 0)
            asi.setAttr(new ExpList(attrs));
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
            return new Int(this.matched);

        else if (this.matchIdent()) {
            const i = new Ident(this.matched);
            if (this.nextIsAttr) {
                i.name = "@" + i.name;
                this.nextIsAttr = false;
            }
            return i;
        }

        if (this.matchChar('{'))
            return new Scope(this.parseAsiList(true));

        else if (this.matchChar('('))
            return this.parseBracedOrArr<Braced>(Braced);

        else if (this.matchChar('"'))
            return this.parseString();

        else if (this.matchChar('['))
            return this.parseBracedOrArr<Arr>(Arr);

        return undefined;
    }




    private matchIdent () : boolean {
        if (this.index >= this.code.length)
            return false;
        const start = this.index;
        const ch = this.code[this.index];
        if (ch === '@' || ch === '_' || this.match(Parser.isIdent)) {
            this.match(function (ch) {
                return Parser.isInt(ch) || Parser.isIdent(ch) || ch === '_';
            });
            this.matched = this.code.substr(start, this.index - start);
            return true;
        }
        return false;
    }




    private static isIdent (ch : string) : boolean {
        return (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') || ch === '_';
    }




    private parseFn () : Fn {
        var asi = this.parseMany();
        var retType : Exp;
        if (asi instanceof BinOpApply) {
            const op = <BinOpApply>asi;
            if (op.op.name === "->") {
                asi = op.op1;
                retType = op.op2;
            } else {
                this.logger.fatal("After fn (), only -> operator is allowed");
            }
        }

        if (asi instanceof Braced) {
            const bc = <Braced>asi;
            asi = this.parseOne();
            if (!(asi instanceof Scope)) {
                this.spares.push(asi);
                const fn = new Fn(bc, undefined);
                if (retType)
                    fn.returnType = retType;
                return fn;
            }
            const fn = new Fn(bc, <Scope>asi);
            if (retType)
                fn.returnType = retType;
            return fn;
        } else {
            this.logger.fatal("Expected braced after fn.");
            throw undefined;
        }
    }




    private parseBracedOrArr<T extends Exp> (TConstructor : any) : T {
        const asi = this.parseMany();
        var el : ExpList;
        if (asi)
            el = asi instanceof ExpList
                ? <ExpList>asi
                : new ExpList([this.castAsi<Exp>(Exp, asi)]);
        else
            el = new ExpList([]);

        return new TConstructor(el);
    }




    private parseString () : Arr {
        const chars : Char[] = [];
        while (true) {
            const ch = this.code[this.index];
            ++this.index;
            if (ch === '"')
                return new Arr(new ExpList(chars),
                               new TypeChar());
            if (this.index >= this.code.length)
                return new Arr(new ExpList(chars),
                               new TypeChar());
            chars.push(new Char(ch));
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
            ++this.index
        }
        ++this.index;
        ++this.index;
    }




    private parseIf () : If {
        var test : Exp;
        var then : Scope;
        var otherwise : Scope = undefined;
        const asi = this.parseMany();

        if (!(asi instanceof Exp))
            this.logger.fatal("Test of if statement must be expression" +
                              ", not statement.");

        if (this.matchText("then"))
            then = this.parseScopedExp();

        this.skipWhite();
        if (this.matchText("else"))
            otherwise = this.parseScopedExp();

        return new If(<Exp>asi, then, otherwise);
    }




    private parseInterface () : Interface {
        return new Interface(this.parseScopedExp());
    }



    private parseStruct () : Struct {
        return new Struct(this.parseScopedExp());
    }




    private parseLoop () : Loop {
        return new Loop(this.parseScopedExp());
    }




    private parseScopedExp () : Scope {
        const asi = this.parseOne();
        if (asi instanceof Scope)
            return <Scope>asi;
        return new Scope(new AsiList([asi]));
    }




    private parseTry () : Try {
        const body = this.parseScopedExp();
        var fin : Scope = undefined;
        this.skipWhite();
        if (this.matchText("finally"))
            fin = this.parseScopedExp();
        return new Try(body, fin);
    }




    private parseLabel () : Label {
        this.skipWhite();
        if (this.matchIdent()) {
            return new Label(this.matched);
        } else {
            this.logger.error("expected name after label");
            throw undefined;
        }
    }




    private parseGoto () : Goto {
        this.skipWhite();
        if (this.matchIdent()) {
            return new Goto(this.matched);
        } else {
            this.logger.error("expected name after goto");
            throw undefined;
        }
    }




    private parseSimpleKeyword<T extends Asi> (TConstructor : any,
                                               expIsRequired : boolean) : T {
        if (this.skipWhite()) {
            if (expIsRequired) {
                this.logger.fatal(getTypeName(TConstructor) +
                                  " requires expression");
                throw undefined;
            } else {
                return new TConstructor(undefined);
            }
        }
        const asi = this.parseMany();
        if (asi instanceof Exp)
            return new TConstructor(<Exp>asi);
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
        const isMatch = this.index + text.length <= this.code.length
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
        const isNewLine = this.matchChar('\n') || this.matchChar('\r');
        while (this.matchChar(' ') || this.matchChar('\t')
        || this.matchChar('\n') || this.matchChar('\r')) {
        }
        return isNewLine;
    }




    private castAsi<T extends Exp> (TConstructor : any, asi : Asi) : Exp {
        return castAsi<T>(TConstructor, asi, this.logger);
    }
}