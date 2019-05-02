class mvvm{
    constructor(options){
        this.init(options)
        observe(this.data)
        this.compile()
    }
    init(options){
        this.$el= document.querySelector(options.el)
        this.data= options.data
    }
    compile(){
        this.traverse(this.$el)
    }
    traverse(node){
         if(node.nodeType === 1){
             node.childNodes.forEach((childNode)=>{
                 this.traverse(childNode)
             })
         }else if(node.nodeType === 3){
             this.renderText(node)
         }
    }
    renderText(node){
         let reg = /{{(.+?)}}/g
         let match
         while(match = reg.exec(node.nodeValue)){
             let raw = match[0]
             let key = match[1].trim()
             node.nodeValue = node.nodeValue.replace(raw,this.data[key])
             new Observer(this,key,function(value,oldValue){
                 node.nodeValue = node.nodeValue.replace(oldValue,value)
             })

         }
    }

}

function observe(data){
    if(!data||typeof data !== 'object') return
    for(let key in data){
        let value = data[key]
        let subject = new Subject()
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get:function(){
                if(currentObserver){
                    currentObserver.subscribeTo(subject)
                }
                return value
            },
            set:function(newValue){
                 value=newValue
                 subject.notify()
            }
        })
        if(typeof value === 'object'){
            observe(value)
        }
    }
}



class Observer{
    constructor(vm,key,cb){
        this.subjects={}
        this.vm = vm
        this.key = key
        this.cb = cb
        this.value = this.getValue()
    }
    update(){
        let oldValue = this.value
        let value = rhis.getValue()
        if(oldValue !== value){
            this.value = value
            this.cb.bind(this.vm)(value,oldValue)
        }
    }
    subscribeTo(subject){
        subject.addObserver(this)
    }
    getValue(){
        currentObserver = this
        let value = this.vm.data[this.key]
        currentObserver = null
        return value
    }
}
class Subject{
   constructor(){
      this.observers=[]
   }
   addObserver(observer){
      this.observers.push(observer)
   }
   removeObserver(observer){
     let index = this.obeservers.indexOf(observer)
     if(index > -1){
         this.observers.splice(index,1)
     }
   }
   notify(){
       this.observers.forEach((observer)=>{
           observer.update()
       })
   }
   
}


let currentObserver = null
let vm = new mvvm({
    el:'#app',
    data:{
        name:'frank',
        age:13
    }
})