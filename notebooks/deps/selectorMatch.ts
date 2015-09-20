/// <reference path="./typings/tsd.d.ts" />

import hl=require('./highLevelAST')
import _=require("underscore")
import sel=require('./ramlselector')

export class Selector{

    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        return context;
    }

    apply(h:hl.IHighLevelNode):hl.IHighLevelNode[]{
        return this.candidates([h]);
    }
}

export class OrMatch extends Selector{

    constructor(private left:Selector,
    private right:Selector){super()}

    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var l=this.left.candidates(context);
        l=l.concat(this.right.candidates(context));
        return _.unique(l);
    }
}

export class DotMatch extends Selector{

    constructor(private left:Selector,
                private right:Selector){super()}

    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var l=this.left.candidates(context);
        if (this.left instanceof AnyParentMatch){
            l=this.right.candidates(new AnyChildMatch().candidates(l));
            return _.unique(l);
        }
        if (this.left instanceof ParentMatch){
            l=this.right.candidates(new AnyChildMatch().candidates(l));
            return _.unique(l);
        }
        l=this.right.candidates(l);
        return _.unique(l);
    }
}
interface SelectorElement{
    type:string
}
interface BinaryElement extends SelectorElement{
    left: SelectorElement
    right: SelectorElement
}
interface LiteralSelectorElement extends SelectorElement{
    name:string
}

export function resolveSelector(s:SelectorElement,n:hl.IHighLevelNode):Selector{
    if (s.type=="or"){
        var b=<BinaryElement>s;
        var l=resolveSelector(b.left,n);
        var r=resolveSelector(b.right,n)
        return new OrMatch(l,r);
    }
    if (s.type=="dot"){
        var b=<BinaryElement>s;
        var l=resolveSelector(b.left,n);
        var r=resolveSelector(b.right,n)
        return new DotMatch(l,r);
    }
    if (s.type=='classLiteral'){
        var literal=<LiteralSelectorElement>s;
        var tp=n.definition().universe().getType(literal.name);
        if (tp==null||tp.isValueType()){
            throw new Error("Referencing unknown type:"+literal.name)
        }
        return new IdMatch(literal.name);
    }
    if (s.type=='parent'){
        return new ParentMatch();
    }
    if (s.type=='ancestor'){
        return new AnyParentMatch();
    }
    if (s.type=='descendant'){
        return new AnyChildMatch();
    }
    if (s.type=='child'){
        return new ChildMatch();
    }

}
export class IdMatch extends Selector{

    constructor(private name:string){
        super()
    }
    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        return context.filter(x=>{
            if (!x){
                return false;
            }
            if (x.definition().name()==this.name){
                return true;
            }
           var superTypes=x.definition().allSuperTypes();
            if (_.find(superTypes,x=>x.name()==this.name)){
                return true;
            }
            return false;
        });
    }
}

export class AnyParentMatch extends Selector{
    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var res:hl.IHighLevelNode[]=[];
        context.forEach(x=>{
            if (x){
                var z=x.parent();
                while (z){
                    res.push(z);
                    z=z.parent()
                }
            }
        })
        return _.unique(res);
    }
}
function addChildren(x:hl.IHighLevelNode,r:hl.IHighLevelNode[]){
    r.push(x);
    x.elements().forEach(y=>addChildren(y,r));
}
export class AnyChildMatch extends Selector{
    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var res:hl.IHighLevelNode[]=[];
        context.forEach(x=>{
            if (x){
                addChildren(x,res)
            }
        })
        return _.unique(res);
    }
}
export class ParentMatch extends Selector{
    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        return context.map(x=>x.parent());
    }
}
export class ChildMatch extends Selector{
    candidates(context:hl.IHighLevelNode[]):hl.IHighLevelNode[]{
        var res:hl.IHighLevelNode[]=[];
        context.forEach(x=>{
            if (x){
                res=res.concat(x.elements());
            }
        })
        return res;
    }
}

export function parse(h:hl.IHighLevelNode,path:string):Selector{
    return resolveSelector(sel.parse(path),h);
}