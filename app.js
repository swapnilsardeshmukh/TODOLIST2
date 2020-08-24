

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connectmongoDB makesure mongodb is in lowercase
mongoose.connect("mongodb+srv://admin-swapnil:s@todo.loq2u.mongodb.net/todolistDB",{useNewUrlParser :true , useUnifiedTopology: true});

//creating schema
const itemsSchema ={
  name: String
};
//creating model with singular name for table
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"This is TODOLIST"
});
const item2 = new Item({
  name:" write in text box then click on + to add item"
});
const item3 = new Item({
  name:"click on checkbox to delete"
});

const defaultItems = [item1 , item2 ,item3 ];

//schema for customListName

const listSchema ={
  name: String,
  items: [itemsSchema]
};

//customlist model
const List = mongoose.model("List", listSchema);

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

          Item.find({},function(err,foundItems){
          if(foundItems === 0)
          {

              Item.insertMany(defaultItems, function(err){
                if (err)
                {
                console.log(err);
                }
                else
                {
                  console.log("Succesfully inserted");
                  res.redirect("/");
                }
                            });
            }
            else{
                res.render("list", {listTitle: "Today", newListItems: foundItems});
                }
              });
});

app.get("/:customListName",function(req,res){

const customListName =_.capitalize(req.params.customListName);

List.findOne({name:customListName}, function(err, foundList){
  if(!err){
  //  if no list found than add otherwise show items
     if(!foundList)
     {
       const list = new List ({
         name:customListName,
         items: defaultItems
       });
       list.save();
       res.redirect("/" + customListName );
     }
     else
     {
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
     }
  }
});


//new list



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;

//
                        const submitItem = new Item({
                          name:itemName
                        });

//defaultList
                        if(listName === "Today"){
                        submitItem.save();
                        res.redirect("/");
                                }
                      else
                      {
                        List.findOne({name:listName}, function(err, foundList){
                        foundList.items.push(submitItem);
                        foundList.save("/");
                        res.redirect("/" + listName);
                      });
                      }

});


app.post("/delete", function(req, res){
//console.log(req.body) to check what is send
const checkItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkItemId, function(err){
    if (err)
    {
      console.log(err);
    }
    else
    {
      console.log("Succesfully deleted");
      res.redirect("/");
    }
  })
}
else{
  //1 is condition 2 is what uopdate 3 is callback
  List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkItemId}}}, function(err,foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
    else{
      res.redirect("/"+ listName);
    }
  })
}




});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started ");
});
