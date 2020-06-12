module.exports = {

    entry: class
    {
        constructor(name) {
            this.name = name;
            this.parent = null;
            this.children = [];
        }
    
        addChild(name) {
            var e = new module.exports.entry(name);
            e.parent = this;
            this.children.push(e);
            return e;
        }
    
        isCircular(name) {
    
            if (name == this.name) return true;
    
            var originalParent = this.parent;
            var that = this;
            var circular = false;
    
            while (that.parent != null) {
                if (that.parent.name == name) circular = true;
                that.parent = that.parent.parent;
            }
            
            that.parent = originalParent;
    
            return circular;
    
        }
    }
}