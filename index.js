import express from "express"
import bodyParser from "body-parser"



const app = express();
const port = 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));

let todayItems = [];
let workItems = [];

app.get("/" , (req, res) => {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date();
    var date = today.toLocaleDateString("en-US", options);
    res.render("today.ejs" ,{
        KindOfDate : date,
        NewListItems : todayItems
    });
})

app.post('/' ,(req,res) => {
    let todayItem = {
        text : req.body["Add"],
        completed : false
    }
    todayItems.push(todayItem);
    res.redirect("/");
})
app.get("/work" , (req,res) => {
    res.render("work.ejs" , {NewListItems : workItems} )
})
app.post('/work' ,(req,res) => {
    let workItem = {
        text : req.body["Add"],
        completed : false
    }
    workItems.push(workItem);
    res.redirect("/work");
});

app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
})

