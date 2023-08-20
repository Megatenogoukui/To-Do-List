import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import _ from "lodash"

const app = express();
const port = 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));

//Connecting Mongoose
mongoose.connect("mongodb://localhost:27017/toDoListDB " , {useNewUrlParser : true , family : 4});

//Creating a schema
const itemSchema = new mongoose.Schema({
    name : String
})

//Creating new mongoose model
const Item = mongoose.model("items" , itemSchema);

//Creating new items
const item1 = new Item({
    name : "Homework"
})
const item2 =new Item( {
    name : "Gym"
})
const item3 = new Item({
    name : "Coding"
})

// Creating an array for these default item
const defaultItem = [item1, item2 ,item3]


//Creating a new schema for list
const listSchema = new mongoose.Schema({
    name : String,
    items: [itemSchema]
});

//Creating a model for the list schema
const List = mongoose.model("list" , listSchema);






app.get("/", async (req, res, next) => {
    
    try {
        // As we know that .find() method returns an array with the items stored in the database so we are storing this array in logged items
        const loggedItems = await Item.find({});
        
        //Now if the Loggeditems has an empty array then that means we have to insert the default items and then again rendering the website  
        if (loggedItems.length === 0){
            //Inserting default items to the collection
            Item.insertMany(defaultItem);
            res.redirect("/")
        }
        //Now the logged items doesnt have an empty array that means we will directly reender the website with the default items
        else{
            res.render("today.ejs", {
                NewListItems: loggedItems,
                listName1 : "Today"
            });
        }
        //So basically in the above code when we restart the website the array will be empty so it would go into the if block and insert the default items and the render the page again , Now this time the arrray is not empty so it will go in the else block and render the page with the default items on it Now again if we refresh our website as our array is not empty it wont go in the if block it will directly run the else block 
        
    } catch (err) {
        next(err); // Pass the error to the next error-handling middleware
    }
    
});

// This is an error handling middle ware if an error is sent by the catch err it will show the error
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});


app.post('/' ,(req,res) => {
    //storing the name of the tasks which are enterd by the user
    const itemName = req.body.Add;
    const listName = req.body.list;
    //Making a document based on our previosly specified model
    const item = new Item({
        name : itemName
    }) ;
    if (listName === "Today"){
        //Inserting this document to the database
        item.save();

        //Rendering the page again
        res.redirect("/")
    }
    else{
        List.findOne({name : listName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
       
    }
    
})

//to delete an item from the list we first put the list items into a form and as soon as the checkbox is clicked it will post to /delete route the name and value . We set the value ,to id of the list item and send it through the post route , Once we get the id we use the delete method of mongoose to delete the items from the database and again render the website
app.post("/delete" ,async (req,res) => { 

        //Getting the id of the element we want to delete
        const deleteId = req.body.checkbox;
        //Getting the name of the list we want to delete
        const listName = req.body.listName;

        //If the listName is Today then we wiill simply delete the items
        if(listName === "Today"){
            //Using the findByIdAndRemove method of model
            Item.findByIdAndRemove(deleteId).then(() =>{
                //Redirecting to the website
                res.redirect("/")
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error adding item to the database.");
            });
        }
        //We will find the list and search for the item we want to delete from the array
        else{
            List.findOneAndUpdate({name: listName}, {$pull : {items : {_id : deleteId}}}).then(() => {
                res.redirect("/" + listName );
            })
            }
        
        
   
})

//Making a get request to all the paths provided by the user
app.get("/:customListName" , (req, res) => {
    //storing the path name
    const listName =  _.capitalize(req.params.customListName);
    
    //Searchhing for the name provided by user
    List.findOne({name: listName}).then((foundList)=>{
        //If the list is found then rendering the list with heading as the linstname
        if (foundList){
            res.render("today.ejs" ,{
                NewListItems: foundList.items,
                listName1 : foundList.name
            } )
        }
        //Else creating a new list  and inserting it to the collections and then redirecting it to the name
        else{
            const list = new List({
                name : listName,
                items : defaultItem
            })
            list.save();
            res.redirect("/" + listName)
        
        }
    }) .catch((err) => {
        console.error(err);
        res.status(500).send("Error adding item to the database.");
    });
    
});


app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
})

