const express=require('express');
const bodyparser=require('body-parser');
const nodemailer=require('nodemailer');
const path=require('path');
const exphbs=require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const app=express();

// view engine setup
app.engine('handlebars',exphbs({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));
app.set('view engine','handlebars');

// body parser middleware
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());

//static folder
app.use('/public',express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
    res.render('contact');
});




var email;

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    
    auth: {
      user: 'interndemo123@gmail.com',
      pass: 'Password123#',
    }
    
});



var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

app.post('/send',function(req,res){
    email=req.body.email;

     // send mail with defined transport object
    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
        res.render('otp');
    });
});

app.post('/resend',function(req,res){
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('otp',{msg:"otp has been sent"});
    });

});

app.post('/verify',function(req,res){

    if(req.body.otp==otp){
        
        res.render('signup',{msg : 'Resume regidtration'});
    }
    else{
        res.render('otp',{msg : 'otp is incorrect'});
    }
});  

app.post('/save',function(req,res){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = [
          { f_name: req.body.firstname,l_name: req.body.lastname, email: req.body.email, address: req.body.address, phone: req.body.phone}
        ];
        dbo.collection("customers").insertMany(myobj, function(err, res) {
          if (err) throw err;
          console.log("Number of documents inserted: " + res.insertedCount);
          db.close();
        });
      });
      res.send('Registered Successfully!')
}); 

//defining port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})