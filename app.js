const express=require('express');
const app=express();
const _ = require('lodash');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.listen(3000,()=>{
  console.log('server started');
})

const mongoose=require('mongoose');
mongoose.connect("mongodb+srv://admin-arihant-09:Test-123@cluster0.rfjnp.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true , useUnifiedTopology: true});

const itemsSchema=mongoose.Schema({
  name:String
})
const Item=mongoose.model('Item',itemsSchema);
const item1=new Item({
  name:"Welcome to todo list"
})
const item2=new Item({
  name:"Hit the + button to add a new item"
})
const item3=new Item({
  name:"<-- Hit to delete an item"
})
const defaultItems=[item1,item2,item3];

app.get('/',(req,res)=>{

  Item.find({},(err,items)=>{
    if(err){console.log(err);}
    else{
      if(items.length===0){
        Item.insertMany(defaultItems,(err)=>{
          if(err){console.log(err);}
          else{console.log("Successfully inserted");}
        })
        res.redirect('/');
      }
      else{
        res.render("list",{listItem:"today",newitem:items})
      }
    }
  })
})
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})
const List=mongoose.model("List",listSchema);
app.get('/:topicId',(req,res)=>{

  let topicname=_.capitalize(req.params.topicId);
  console.log(topicname);
  List.findOne({name:topicname},(err,items)=>{
    if(err){console.log(err)}
    else{
      if(!items){
        const list=new List({
          name:topicname,
          items:defaultItems
        })
        list.save();
        res.redirect('/'+topicname)
      }
      else{
        res.render("list",{listItem:topicname,newitem:items.items})
      }
    }
  })
})


app.post('/delete',(req,res)=>{
  console.log(req.body.checkbox);
  if(req.body.listName=='today'){
    Item.deleteOne({_id:req.body.checkbox},(err)=>{
      if(err){console.log(err)}
      else{
        res.redirect('/');
        console.log('Successfully deleted')}
    })
  }
  else{
    List.findOneAndUpdate({name:req.body.listName},{$pull:{items:{_id:req.body.checkbox}}},(err,results)=>{
      if(err){console.log(err)}
      else{
          res.redirect('/'+req.body.listName);
        console.log(results)
      }
    })
  }

})

app.post('/',(req,res)=>{
  const item=new Item({
    name:req.body.val,
  })
  if(req.body.list=='today'){
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name:req.body.list},(err,items)=>{
      items.items.push(item);
      items.save();
      res.redirect('/'+req.body.list);
    })

  }
})
