import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app=express();
const port =4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const db=new pg.Client({
  user:"postgres",
  password:"vagdevi",
  host:"localhost",
  port:5432,
  database:"bank"
});
db.connect();
app.get("/hello",(req,res)=>{
  const hii={hello:"world"};
  res.json(hii);
});
app.post("/payment",async(req,res)=>{
  console.log("In bank payment",req.body.accno);
  let a=0;
  try{
    const x=await db.query("select * from users where accno=$1",[req.body.accno]);
    let result;
    if(x.rows[0].password==req.body.password){
      if(parseInt(req.body.amount)<=parseInt(x.rows[0].balance)) {
        result=await db.query("insert into transactions (tdate,amount,fromacc,toacc) values (now(),$1,$2,'VIVI999999') returning *",[req.body.amount,x.rows[0].accno]);
        let newbal=parseInt(x.rows[0].balance)-parseInt(req.body.amount);
        await db.query("update users set balance=$1 where accno=$2",[newbal,req.body.accno]);
        const res=await db.query("select balance from users where accno='VIVI999999' ");
        await db.query("update users set balance=$1 where accno='VIVI999999' ",[parseInt(res.rows[0].balance)+parseInt(req.body.amount)]);
        a=1;
      }
      else{
        res.json({error:"Insufficient funds"});
      }
    }
    else{
      res.json({error:"Incorrect Password"});
    }
    if(a==1) {
      res.json({mes:"Transaction successfully completed ,Transaction id=",tid:result.rows[0].tid,tdate:result.rows[0].tdate});
    }
  }catch(error){
    console.log(error);
    res.json({error:"Account number doesnt exits"});
  }
});
app.listen(port,()=>{
  console.log(`API is running on port ${port}`);
});