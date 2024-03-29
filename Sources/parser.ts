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

    public static rightAssociativeOps =
        ["=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=", "&==", "^=", "|="];

    // \n is virtual operator that binds fn exp to braced to make fn apply
    public static opPrecedence : Precedence = {
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




    private castAsi<T extends Asi> (TConstructor : any, asi : Asi) : T {
        return <T>castAsi<T>(TConstructor, asi, this.logger);
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
            return new FnApply(<Exp[]>this.castAsi<AsiList>(AsiList, op2).items,
                               <Exp>op1);
        } else if (op === "=") {
            return new Assign(<Exp>op1, <Exp>op2);
        } else if (op === ",") {
            if (op1 instanceof /*ExpList*/AsiList) {
                const el = <AsiList>op1;
                el.add(<Exp>op2);
                return el;
            }
            return new /*ExpList*/AsiList([<Exp>op1, <Exp>op2]);
        } else {
            return new FnApply([<Exp>op1, <Exp>op2], new Ident(op));
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
                this.postProcess(item);
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
        "pragma": () => this.parseSimpleKeyword<Pragma>(Pragma, true),
        "struct": () => this.parseStruct(),
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
        var slot = <Ident>this.parseOne();
        this.skipWhite();
        var value : Exp;
        if (this.matchChar('=')) {
            value = <Exp>this.parseOne();
        }
        return new Var(slot, value);
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
            asi.setAttrs(attrs);
        return asi;
    }




    private postProcess(asi : Asi) {
        var op = Parser.getOpIfAny(asi);
        if (!op)
            return;
        if (!(asi instanceof Var))
            return;
        var opb = Parser.getBeforeOpIfAny(<Var>asi);
        if (opb) {
            for (var opp in BinOpBuilder.opPrecedence) {
                if (opp === opb.name) {
                    BinOpBuilder.opPrecedence[op.name] =
                        BinOpBuilder.opPrecedence[opp] + 1;
                }
            }
        }
    }




    private static getOpIfAny (asi : Asi) : Ident {
        if (asi instanceof Var)
            if (asi.slot instanceof Ident)
                if (asi.slot.isOp)
                    return asi.slot;
        return undefined;
    }




    private static getBeforeOpIfAny (v : Var) : Ident {
        if (!v.attrs)
            return undefined;
        for (var i = 0; i < v.attrs.length; ++i) {
            var attr = v.attrs[i];
            if (attr instanceof FnApply) {
                var fna = <FnApply>attr;
                if (fna.fn instanceof Ident) {
                    var fnai = <Ident>fna.fn;
                    if (fnai.name == "@beforeOperator") {
                        return <Ident>fna.args[0];
                    }
                }
            }
        }
        return undefined;
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

        if (this.matchChar('{')) {
            var al = this.parseAsiList(true);
            al.brace = "{";
            return al;
        }

        else if (this.matchChar('(')) {
            var al = this.parseAsiList(false);
            al.brace = "(";
            return al;
        }

        else if (this.matchChar('"'))
            return this.parseString();

        else if (this.matchChar('['))
            return this.parseArr();

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
        /*if (asi instanceof BinOpApply) {
            const op = <BinOpApply>asi;
            if (op.op.name === "->") {
                asi = op.op1;
                retType = op.op2;
            } else {
                this.logger.fatal("After fn (), only -> operator is allowed");
            }
        }*/

        if (asi instanceof AsiList) {
            var params = <Var[]>(<AsiList>asi).items;
            asi = this.parseOne();
            if (!(asi instanceof AsiList)) {
                this.spares.push(asi);
                const fn = new Fn(params, undefined);
                //if (retType)
                //    fn.returnType = retType;
                return fn;
            }
            const fn = new Fn(params, (<AsiList>asi).items);
            //if (retType)
            //    fn.returnType = retType;
            return fn;
        } else {
            this.logger.fatal("Expected braced after fn.");
            throw undefined;
        }
    }




    private parseArr () : Arr {
        const asi = this.parseMany();
        var el : Asi[];
        if (asi)
            el = asi instanceof AsiList
                ? asi.items
                : [asi];
        else
            el = [];

        return new Arr(el);
    }




    private parseString () : Exp {
        const startAt = this.index;
        var firstNewLineAt = 0;
        var isUnterminated = false;
        while (true) {
            if (this.index >= this.code.length) {
                this.logger.error("Unterminated string constant " +
                                  "at the end of the file.");
                isUnterminated = true;
                break;
            }
            const ch = this.code[this.index];
            ++this.index;
            if (ch === '"')
                break;
            if (firstNewLineAt === 0 && (ch === '\n' || ch === '\r'))
                firstNewLineAt = this.index - 1;
        }
        var to : number;
        if (isUnterminated && firstNewLineAt !== 0) {
            to = firstNewLineAt;
            this.index = firstNewLineAt;
        } else {
            to = this.index - 1;
            if (to > this.code.length)
                to = this.code.length;
        }
        const chars : Char[] = [];
        for (var i = startAt; i < to; ++i)
            chars.push(new Char(this.code[i]));
        var arr = new Arr(chars, new Char("")); // todo here should be type
        return isUnterminated ? new Err(arr) : arr;
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
        const asi = this.parseMany();

        var then : Asi[];
        if (this.matchText("then"))
            then = this.parseScopedAsi();
        else
            this.logger.error("Expected 'then'");

        this.skipWhite();
        var otherwise : Asi[];
        if (this.matchText("else"))
            otherwise = this.parseScopedAsi();
        else
            otherwise = undefined;

        return new If(this.castAsi<Exp>(Exp, asi), then, otherwise);
    }



    private parseStruct () : Struct {
        return new Struct(<Var[]>this.parseScopedAsi());
    }




    private parseLoop () : Loop {
        return new Loop(this.parseScopedAsi());
    }




    private parseScopedAsi () : Asi[] {
        const asi = this.parseOne();
        return asi instanceof AsiList ? asi.items : [asi];
    }




    private parseTry () : Try {
        const body = this.parseScopedAsi();
        var fin : Asi[];
        this.skipWhite();
        if (this.matchText("finally"))
            fin = this.parseScopedAsi();
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
        return new TConstructor(new Err(asi));
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