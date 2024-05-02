import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
const app = express();
const port = 3000;
const apiurl="http://localhost:4000";
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
    // console.log(result.rows);
    res.render("allcomplaints.ejs",{result:result.rows});
});
app.post ("/updatecomplaints",async (req,res)=>{
    try{
        console.log("In updatecomplaints page ",req.body);
        const result=await db.query("select * from complaint");
        result.rows.forEach(e => {
            if(req.body[e.id]=="on")
            db.query("update complaint set solved='Solved' where id=$1",[e.id]);
        });
        res.redirect("/allcomplaints");
    }catch(error){
        res.redirect("/allcomplaints");
    }
});
app.get("/studentpassword",async(req,res)=>{
    res.render("studentpassword.ejs");
});
app.post("/studentpassword",async(req,res)=>{
    console.log(req.body,rollno);
    const result=await db.query("select password from student where rollno=$1",[rollno]);
    console.log(result.rows[0]);
    if(result.rows[0].password==req.body.oldpassword){
        if(req.body.newpassword==req.body.cpassword){
            await db.query("update student set password=$1 where rollno=$2",[req.body.cpassword,rollno])
        res.render("studentpassword.ejs",{succ:"Password Updated Successfully"});
        } else{
            res.render("changepassword.ejs",{error:"Enter correct Confirm Password"});
        }
    }else{
        res.render("studentpassword.ejs",{error:"Enter correct old password"});
    }
});
app.get("/changepassword",async(req,res)=>{
    res.render("changepassword.ejs");
});
app.post("/changepassword",async(req,res)=>{
    console.log(req.body,admin);
    const result=await db.query("select password from admin where fname=$1",[admin]);
    console.log(result.rows[0]);
    if(result.rows[0].password==req.body.oldpassword){
        if(req.body.newpassword==req.body.cpassword){
            await db.query("update admin set password=$1 where fname=$2",[req.body.cpassword,admin]);
            res.render("changepassword.ejs",{succ:"Password Updated Successfully"});
        } else{
            res.render("changepassword.ejs",{error:"Enter correct Confirm Password"});
        }
    }else{
        res.render("changepassword.ejs",{error:"Enter correct old password"});
    }
});
app.get("/messtransactions",async (req,res)=>{
    console.log("mess transactions of ",rollno);
    try{
        const result=await db.query("select * from transaction where rollno=$1",[rollno]);
        console.log(result.rows);
        res.render("messtransactions.ejs",{rollno:rollno,result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.get("/admintransactions",async (req,res)=>{
    console.log("all students all mess trasanctions");
    try{
        const result=await db.query("select * from transaction");
        console.log(result.rows);
        res.render("admintransactions.ejs",{result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.get("/allmonthsbills",async (req,res)=>{
    console.log("all month bills");
    try{
        const result=await db.query("select * from monthlymess");
        console.log(result.rows);
        res.render("allmonthsbills.ejs",{result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.get("/uploadmess",async(req,res)=>{
    res.render("uploadmess.ejs");
});
app.post("/uploadmess",async(req,res)=>{
    console.log("Post uploadmess");
    console.log(req.body);
    try{
        const y=req.body.year;
        const m=req.body.mon;
        const v=req.body.veg;
        const n=req.body.nonveg;
        const result=await(db.query("insert into monthlymess values($1,$2,$3,$4)",[y,m,v,n]));
        res.redirect("/uploadmess");
    }catch(error){
        console.log(error);
    }
});
app.get("/adminfeedbacks",async(req,res)=>{
    console.log("admin feedback");
    try{
        const result=await db.query("select * from feedback");
        console.log(result.rows);
        res.render("adminfeedbacks.ejs",{result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.get("/mealfeedback",async(req,res)=>{
    console.log("Get meal feedback",rollno);
    try{
        const result=await db.query("select * from feedback");
        console.log(result.rows);
        res.render("mealfeedback.ejs",{rollno:rollno,result:result.rows});
    }catch(error){
        console.log(error);
    }
    res.render("mealfeedback.ejs");
});
app.post("/mealfeedback",async(req,res)=>{
    console.log("meal feedback");
    console.log(req.body);
    try{
        const b=req.body.bf;
        const l=req.body.lf;
        const d=req.body.df;
        const o=req.body.of;
        await db.query("insert into feedback values(now(),$1,$2,$3,$4)",[b,l,d,o]);
        res.redirect("/mealfeedback");
    }catch(error){
        console.log(error);
    }
});
app.get("/adminnotifications",async (req,res)=>{
    console.log("admin notifications");
    try{
        const result=await db.query("select * from notifications");
        console.log(result.rows);
        res.render("adminnotifications.ejs",{result:result.rows});
    }catch(error){
        console.log(error);
    }
});
app.post("/adminnotifications",async(req,res)=>{
    console.log("post admin notifications");
    console.log(req.body);
    try{
        const mes=req.body.mes;
        const result=await(db.query("insert into notifications(ndate,mes) values(now(),$1)",[mes]));
        res.redirect("/adminnotifications");
    }catch(error){
        console.log(error);
    }
});
app.get("/notifications",async (req,res)=>{
    console.log("Notifications in students ");
    try{
        const result=await db.query("select * from notifications");
        console.log(result.rows);
        res.render("notifications.ejs",{result:result.rows});
    }catch(error){
        console.log(error);
    }
});


//interacting with bank API
app.get("/bank",async(req,res)=>{
    const response=await axios.get(`${apiurl}/hello`);
    console.log(response);
    res.json(response.data);
});
app.get("/paymess",async(req,res)=>{
    res.render("paymess.ejs");
});
app.post("/paymess",async(req,res)=>{
    console.log("In paymess page",req.body);
    const response=await axios.post(`${apiurl}/payment`,req.body);
    console.log(response.data,rollno);
    try{
        await db.query("insert into transaction(tid,rollno,accountno,tdate,amount) values ($1,$2,$3,$4,$5)",[response.data.tid,rollno,req.body.accno,response.data.tdate,req.body.amount]);
    }
    catch(error){
        console.log(error);
    }
    res.render("paymess.ejs",response.data);
});
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});