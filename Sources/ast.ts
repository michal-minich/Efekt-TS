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

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Exp extends Asi {

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Stm extends Asi {

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// helpers ===============================================




class ExpList extends Asi {

    public items : Exp[];

    constructor (attrs : ExpList, items : Exp[]) {
        super(attrs);
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitExpList(this);
    }
}




// statements ===============================================




class Var extends Stm {

    public ident : Ident;
    public type : Exp;
    public constraint : Exp;
    public value : Exp;

    constructor (attrs : ExpList, ident : Ident, type : Exp, constraint : Exp, value : Exp) {
        super(attrs);
        if (ident) {
            this.ident = ident;
            ident.parent = this;
        }
        if (type) {
            this.type = type;
            type.parent = this;
        }
        if (constraint) {
            this.constraint = constraint;
            constraint.parent = this;
        }
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




class Loop extends Exp {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Return extends Exp {

    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        this.value = value;
        value.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitReturn(this);
    }
}




class Throw extends Exp {

    public ex : Exp;

    constructor (attrs : ExpList, ex : Exp) {
        super(attrs);
        this.ex = ex;
        ex.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitThrow(this);
    }
}




class Try extends Exp {

    public body : Scope;
    public catches : Catch[];
    public fin : Scope;

    constructor (attrs : ExpList, fin : Scope) {
        super(attrs);
        this.fin = fin;
        fin.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTry(this);
    }
}




class Catch {
    public on : Var;
    public body : Scope;
}




// expressions ===============================================




class Scope extends Exp {

    public items : Asi[];

    constructor (attrs : ExpList, items : Asi[]) {
        super(attrs);
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitScope(this);
    }
}




class Ident extends Exp {

    public name : string;

    constructor (attrs : ExpList, name : string) {
        super(attrs);
        this.name = name;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitIdent(this);
    }
}




class Member extends Exp {

    public ident : Ident;

    constructor (attrs : ExpList, ident : Ident) {
        super(attrs);
        this.ident = ident;
        ident.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitMember(this);
    }
}




class FnApply extends Exp {

    public args : ExpList;
    public fn : Exp;

    constructor (attrs : ExpList, args : ExpList, fn : Exp) {
        super(attrs);
        this.args = args;
        this.fn = fn;
        args.parent = this;
        fn.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
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
    }

    public accept<T> (v : AstVisitor<T>) : T {
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
        this.otherwise = otherwise;
        test.parent = this;
        then.parent = this;
        otherwise.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
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

    public accept<T> (v : AstVisitor<T>) : T {
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

    public accept<T> (v : AstVisitor<T>) : T {
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

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitErr(this);
    }
}




class Void extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
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

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Exp {

    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Exp {

    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Arr extends Exp {

    public list : ExpList;

    constructor (attrs : ExpList, list : ExpList) {
        super(attrs);
        this.list = list;
        list.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
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

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitRef(this);
    }
}




// values / types ===============================================




class Fn extends Exp {

    public params : ExpList;
    public body : Scope;
    public returnType : Exp;

    constructor (attrs : ExpList, params : ExpList, body : Scope) {
        super(attrs);
        this.params = params;
        this.body = body;
        params.parent = this;
        body.parent = this;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitFn(this);
    }
}




// types (user defined) ===============================================




class Struct extends Exp {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




class Interface extends Exp {

    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitInterface(this);
    }
}




// types (built in) ===============================================




class TypeAny extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAny(this);
    }
}




class TypeAnyOf extends Exp {

    public choices : ExpList;

    constructor (attrs : ExpList, choices : ExpList) {
        super(attrs);
        this.choices = choices;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAnyOf(this);
    }
}




class TypeErr extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeErr(this);
    }
}




class TypeVoid extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVoid(this);
    }
}




class TypeBool extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeBool(this);
    }
}




class TypeInt extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInt(this);
    }
}




class TypeFloat extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFloat(this);
    }
}




class TypeArr extends Exp {

    public elementType : Exp;
    public length : Exp;

    constructor (attrs : ExpList, elementType : Exp, length : Exp) {
        super(attrs);
        this.elementType = elementType;
        this.length = length;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeArr(this);
    }
}




class TypeRef extends Exp {

    public elementType : Exp;

    constructor (attrs : ExpList, elementType : Exp) {
        super(attrs);
        this.elementType = elementType;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeRef(this);
    }
}