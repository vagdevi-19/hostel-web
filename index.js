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
let rollno;
let admin="";
app.get("/", (req, res) => {
    res.render("login.ejs");
});
app.get("/registration", (req, res) => {
    res.render("registration.ejs");
});
app.get("/admin", (req, res) => {
    admin="";
    res.render("admin.ejs");
});
app.get("/login",async (req, res) => {
    rollno="";
    res.render("login.ejs");
});
app.get("/myprofile",async(req,res)=>{
    try{
        const result=await db.query("select * from student where rollno=$1",[rollno]);
        console.log("in myprofile ",rollno);
        res.render("myprofile.ejs",{result:result.rows[0]});
    }
    catch(error){
        res.redirect("/login");
    }
});
app.post("/login",async(req,res)=>{
    try{
        rollno="";
        // console.log(req.body);
        const result=await db.query("select * from student");
        const student=(result.rows.find((x)=>x.email==req.body.email));
        rollno=student.rollno;
        if(student.password==req.body.password)
        res.redirect("/myprofile");
    }catch(error){
        console.log(error);
    }
    res.render("login.ejs",{error:"Enter correct email and password"});
});
app.get("/adminprofile",async(req,res)=>{
    try{
        console.log(admin);
        const result=await db.query("select * from admin where fname=$1",[admin]);
        res.render("adminprofile.ejs",{result:result.rows[0]});
    }
    catch(error){
        res.redirect("/admin");
    }
});
app.post("/admin",async(req,res)=>{
    try{
        admin="";
        console.log(req.body);
        const result=await db.query("select * from admin where email= $1 ",[req.body.email]);
        const ad=result.rows[0];
        admin=ad.fname;
        if(ad.password==req.body.password)
        res.redirect("/adminprofile");
    }catch(error){
        console.log(error);
    }
    res.render("admin.ejs",{error:"Enter correct email and password"});
});
app.post("/updateadmin",async(req,res)=>{
    console.log("in undateadmin")
    try{
        const f=req.body.fname;
        const l=req.body.lname;
        const c=req.body.contact;
        const e=req.body.email;
        const a=req.body.address;
        const result=await db.query("update admin set fname=$1,lname=$2,contact=$3,email=$4,address=$5 where fname=$6",[f,l,c,e,a,admin]);
        admin=f;
        res.redirect("/adminprofile");
    }catch(error){
        console.log(error);
    }
    res.render("admin.ejs",{error:"Enter correct email and password"});
});
app.post("/updatemy",async(req,res)=>{
    console.log("in undatemy")
    try{
        console.log(req.body);
        console.log("student",rollno);
        const f=req.body.fname;
        const l=req.body.lname;
        const g=req.body.gender;
        const c=req.body.contact;
        const e=req.body.email;
        const b=req.body.branch;
        const v=req.body.veg;
        const a=req.body.address;
        const result=await db.query("update student set fname=$1,lname=$2,gender=$3,contact=$4,email=$5,branch=$6,veg=$7,address=$8 where rollno=$9",[f,l,g,c,e,b,v,a,rollno]);
        res.redirect("/myprofile");
    }catch(error){
        console.log(error);
    }
    res.render("myprofile.ejs",{error:"Enter correct email and password"});
});
app.post("/registration",async(req,res)=>{
    // console.log(req.body);
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
app.get("/complaint",async (req,res)=>{
    console.log("Entered complaint of ",rollno);
    try{
        const result=await db.query("select * from complaint where rollno=$1",[rollno]);
        console.log(result.rows);
        res.render("complaint.ejs",{rollno:rollno,result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.post("/complaint",async(req,res)=>{
    console.log("In post compaint");
    console.log(req.body);
    try{
        const r=req.body.rollno;
        const c=req.body.complaint;
        rollno=r;
        const result=await(db.query("insert into complaint(rollno,com) values($1,$2)",[r,c]));
        res.redirect("/complaint");
    }catch(error){
        console.log(error);
    }
});
app.get("/allcomplaints",async(req,res)=>{
    console.log("in all complaints");
    const result=await(db.query("select * from complaint order by solved"));
    console.log(result.rows);
    res.render("allcomplaints.ejs",{result:result.rows});
});
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});