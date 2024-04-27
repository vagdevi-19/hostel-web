import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const db=new pg.Client({
    user:"postgres",
    password:"vagdevi",
    host:"localhost",
    port:5432,
    database:"hostel"
  });
db.connect();
let rollno="";
app.get("/", (req, res) => {
    res.render("login.ejs");
});
app.get("/registration", (req, res) => {
    res.render("registration.ejs");
});
app.get("/admin", (req, res) => {
    res.render("admin.ejs");
});
app.get("/login",async (req, res) => {
    res.render("login.ejs");
});
app.get("/myprofile",async(req,res)=>{
    try{
        console.log(rollno);
        const result=await db.query("select * from student where rollno=$1",[rollno]);
        console.log(result.rows[0]);
        res.render("myprofile.ejs",{result:result.rows[0]});
    }
    catch(error){
        res.redirect("/login");
    }
});
app.post("/login",async(req,res)=>{
    try{
        rollno="";
        console.log(req.body);
        const result=await db.query("select * from student");
        const student=(result.rows.find((x)=>x.email==req.body.email));
        rollno=student.rollno;
        console.log(req.body.password);
        console.log(student.password);
        if(student.password==req.body.password)
        res.redirect("/myprofile");
    }catch(error){
        console.log(error);
    }
    res.render("login.ejs",{error:"Enter correct email and password"});
});
app.post("/registration",async(req,res)=>{
    console.log(req.body);
    const r=req.body.rollno;
    const f=req.body.fname;
    const l=req.body.lname;
    const g=req.body.gender;
    const c=req.body.contact;
    const e=req.body.email;
    const b=req.body.branch;
    const v=req.body.veg;
    const a=req.body.address;
    const p=req.body.password;
    await db.query("insert into student values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[r,f,l,g,c,e,b,v,a,p]);

    res.redirect("/login.ejs");
});
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});