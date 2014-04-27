/// <reference path="visitor.ts"/>


// base ===============================================


class Asi {

    public parent : Asi;
    public attrs : ExpList;

    constructor (attrs : ExpList) {
        if (attrs) {
            this.attrs = attrs;
            attrs.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Exp extends Asi {

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Stm extends Asi {

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// helpers ===============================================




class AsiList extends Asi {

    public items : Asi[];

    constructor (attrs : ExpList, items : Asi[]) {
        super(attrs);
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }
}




class ExpList extends Asi {

    public items : Exp[];

    constructor (attrs : ExpList, items : Exp[]) {
        super(attrs);
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitExpList(this);
    }

    add (item : Exp) : void {
        this.items.push(item);
        item.parent = this;
    }
}




class Braced extends Exp {

    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBraced(this);
    }
}




// statements ===============================================




class Loop extends Stm {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Stm {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Stm {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Return extends Stm {

    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitReturn(this);
    }
}




class Throw extends Stm {

    public ex : Exp;

    constructor (attrs : ExpList, ex : Exp) {
        super(attrs);
        if (ex) {
            this.ex = ex;
            ex.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitThrow(this);
    }
}




class Try extends Stm {

    public body : Scope;
    public catches : Catch[];
    public fin : Scope;

    constructor (attrs : ExpList, body : Scope, fin : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
        if (fin) {
            this.fin = fin;
            fin.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTry(this);
    }
}




class Catch {
    public on : Var;
    public body : Scope;
}




// expressions ===============================================




class Var extends Exp {

    public exp : Exp;

    constructor (attrs : ExpList, exp : Exp) {
        super(attrs);
        this.exp = exp;
        exp.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




class ValueVar extends Exp {

    public ident : Exp;
    public type : Exp;

    constructor (attrs : ExpList, ident : Exp, type : Exp) {
        super(attrs);
        this.ident = ident;
        this.type = type;
        ident.parent = this;
        type.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitValueVar(this);
    }
}




class TypeVar extends Exp {

    public type : Exp;
    public constraint : Exp;

    constructor (attrs : ExpList, type : Exp, constraint : Exp) {
        super(attrs);
        this.type = type;
        this.constraint = constraint;
        type.parent = this;
        constraint.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVar(this);
    }
}




class Assign extends Exp {

    public slot : Exp;
    public value : Exp;

    constructor (attrs : ExpList, slot : Exp, value : Exp) {
        super(attrs);
        this.slot = slot;
        this.value = value;
        slot.parent = this;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAssign(this);
    }
}




interface Vars {
    [name : string] : Exp
}




class Scope extends Exp {

    public list : AsiList;
    public vars : Vars = {};
    public currentAsiIx = -1;

    constructor (attrs : ExpList, list : AsiList) {
        super(attrs);
        this.list = list;
        list.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitScope(this);
    }

    get parentScope () : Scope {
        var asi = this.parent;
        while (asi) {
            if (asi instanceof Scope)
                return <Scope>asi;
            asi = asi.parent;
        }
        return undefined;
    }
}




class Ident extends Exp {

    public name : string;
    public isOp : boolean = false;
    public isKey : boolean = false;

    constructor (attrs : ExpList, name : string) {
        super(attrs);
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitIdent(this);
    }

    get isType () : boolean {
        return this.name[0] >= 'A' && this.name[0] <= 'Z';
    }
}




class Member extends Exp {

    public bag : Exp;
    public ident : Ident;

    constructor (attrs : ExpList, bag : Exp, ident : Ident) {
        super(attrs);
        this.bag = bag;
        this.ident = ident;
        bag.parent = this;
        ident.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitMember(this);
    }
}




class FnApply extends Exp {

    public args : Braced;
    public fn : Exp;

    constructor (attrs : ExpList, args : Braced, fn : Exp) {
        super(attrs);
        this.args = args;
        this.fn = fn;
        args.parent = this;
        fn.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFnApply(this);
    }
}




class BinOpApply extends Exp {

    public op : Ident;
    public op1 : Exp;
    public op2 : Exp;

    constructor (attrs : ExpList, op : Ident, op1 : Exp, op2 : Exp) {
        super(attrs);
        this.op = op;
        this.op1 = op1;
        this.op2 = op2;
        op.parent = this;
        op1.parent = this;
        op2.parent = this;
        op.isKey = op.name[0] >= 'a' && op.name[0] <= 'z';
        op.isOp = !op.isKey;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBinOpApply(this);
    }
}




class If extends Exp {

    public test : Exp;
    public then : Scope;
    public otherwise : Scope;

    constructor (attrs : ExpList, test : Exp, then : Scope, otherwise : Scope) {
        super(attrs);
        this.test = test;
        this.then = then;
        test.parent = this;
        then.parent = this;
        if (otherwise) {
            this.otherwise = otherwise;
            otherwise.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitIf(this);
    }
}




class New extends Exp {

    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitNew(this);
    }
}




class TypeOf extends Exp {

    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeOf(this);
    }
}




// values ===============================================




class Err extends Exp {

    public item : Asi;

    constructor (attrs : ExpList, item : Asi) {
        super(attrs);
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitErr(this);
    }
}




class Void extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVoid(this);
    }

    public static instance = new Void(undefined);
}




class Bool extends Exp {

    public value : boolean;

    constructor (attrs : ExpList, value : boolean) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Exp {

    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Exp {

    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Char extends Exp {

    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitChar(this);
    }
}




class Arr extends Exp {

    public list : ExpList;
    public itemType : Exp = null;

    constructor (attrs : ExpList, list : ExpList) {
        super(attrs);
        this.list = list;
        list.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitArr(this);
    }
}




class Ref extends Exp {

    public item : Exp;

    constructor (attrs : ExpList, item : Exp) {
        super(attrs);
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitRef(this);
    }
}




// values / types ===============================================




class Fn extends Exp {

    public params : Braced;
    public body : Scope;
    public returnType : Exp;

    constructor (attrs : ExpList, params : Braced, body : Scope) {
        super(attrs);
        this.params = params;
        this.body = body;
        params.parent = this;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFn(this);
    }
}




// types (user defined) ===============================================




class Struct extends Exp {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




class Interface extends Exp {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInterface(this);
    }
}




// types (built in) ===============================================




class TypeAny extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAny(this);
    }
}




class TypeAnyOf extends Exp {

    public choices : ExpList;

    constructor (attrs : ExpList, choices : ExpList) {
        super(attrs);
        this.choices = choices;
        choices.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAnyOf(this);
    }
}




class TypeErr extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeErr(this);
    }
}




class TypeVoid extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVoid(this);
    }
}




class TypeBool extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeBool(this);
    }
}




class TypeInt extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInt(this);
    }
}




class TypeFloat extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFloat(this);
    }
}




class TypeChar extends Exp {

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeChar(this);
    }
}




class TypeArr extends Exp {

    public elementType : Exp;
    public length : Exp;

    constructor (attrs : ExpList, elementType : Exp, length : Exp) {
        super(attrs);
        this.elementType = elementType;
        this.length = length;
        elementType.parent = this;
        length.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeArr(this);
    }
}




class TypeRef extends Exp {

    public elementType : Exp;

    constructor (attrs : ExpList, elementType : Exp) {
        super(attrs);
        this.elementType = elementType;
        elementType.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeRef(this);
    }
}