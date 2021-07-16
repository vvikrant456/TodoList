//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname+"/date.js");
// console.log(date());


const app = express();
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems =[];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vikas:test123@cluster0.b2s0u.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  const day = date.getDate();



  Item.find({}, function(err, foundItems){


    if(foundItems.length ===0){
Item.insertMany(defaultItems, function(err){
  if(err)
  {
    console.log(err);
  }else{
    console.log("Successfully inserted default items to DB");
  }
});
res.redirect("/");
    }else{
      res.render("list", {listTitle: day , newListItems: foundItems});
    }
    // console.log(foundItems);

  });
  });

  app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          //console.log("Doesn't exists!");

          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });

          list.save();
res.redirect("/"+customListName);
        }else{
          // console.log("Exists!");

          //show an existing list

          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });





  });

app.post("/", function(req, res){
  // console.log(req.body);
   const itemName = req.body.newItem;
const listName = req.body.list;
   const item = new Item({
     name: itemName
   });

if(listName ==="Today"){

   item.save();

   res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
const listName = req.body.listName;


if(listName ==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});


app.get("/about", function(req, res)
{
  res.render("about");
});

app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(newItem);
  res.redirect("/work");
});


app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
