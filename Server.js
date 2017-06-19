//Requires
var express    = require('express');
var bodyparser = require('body-parser');
var session    = require('express-session');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var mpromise   = require('mpromise');
//-----------------------------------


//Configurations
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8000 ;
app.use( express.static( __dirname + "/static" ));
app.use( bodyparser.json() );
app.use( bodyparser.urlencoded ( { extended:true } ) );
app.use(morgan('common'));
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}));
//------------------


function inArray(val, arr)
{
    var length = arr.length;
    for (var i = 0; i < length; i++)
    {
        if (arr[i] == val)
            return true;
    }
    return false;
}


//Sockets
io.on('connection', function(socket)
{
     console.log("a user connected");
     socket.on('disconnect',function () {
         console.log("user disconnected");
     });

    socket.on('chatmessage',function (msg) {
      io.emit('chatmessage',{message:msg.msg,username:msg.username});
    });

    socket.on('typing',function (user) {
        if(!inArray(user.username,istypings))
        {
            istypings.push(user.username);
            io.emit('typing', istypings);
        }
        else{}
    });

    socket.on('useronline',function (user) {
        io.emit('useronline',onlines);
    });

    socket.on('logout',function (user) {
        delete onlines[user.username];
        io.emit('useronline',onlines);
    });

    socket.on('cleartyping',function () {
        istypings=[];
    });

});

//-----------------------------

//Variables
var onlines = {

};

var istypings = [

]
//--------------



//MongoDB
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/nodejs");
var db = mongoose.connection;

    //Schemas
var userSchema=new mongoose.Schema({
    username: String,
    password:String
});
var commentSchema= new mongoose.Schema({
    username:String,
    comment:String
});
    //----

    //Models
var userModel= mongoose.model("User",userSchema);
var commentModel=mongoose.model("Comment",commentSchema);
    //------

    //DbHandle
db.on('error',function () {
    console.log("Mongo  Connection Faild! ");
});
db.once("connected",function () {
    console.log("Mongo Connected");
});
    //------
//---



//Wiers
app.get("/",function (req,resp,next)
{
	console.log("hi");
    if(req.session.auth)
    {
        resp.sendFile(__dirname+"/static/done.html");
    }
    else
    {
        resp.sendFile(__dirname + "/static/Home.html");
    }
});

app.post( "/" , function ( req , resp , next ) { } );

app.post("/login",function (req,resp,next) {
    userModel.findOne({ username:req.body.username },function (err,user)
    {
        if(err){throw err;}
        if(user)
        {
            if(user.password==req.body.password)
            {
                req.session.auth = {username: req.body['username']};
                onlines[user.username]=user.username;
                resp.json({status: "true" , redirect : "/" ,msq:"با موفقیت وارد شدید"});
            }
            else
            {
                resp.json({status: false , msg: "رمز عبور اشتباه است"});
            }
        }
        else
        {
            resp.json({status : false , msg: "نام کاربری اشتباه است"});
        }
    })
});

app.get( "/logout" , function (req , resp , next )
{
    req.session.auth=null;
    resp.json( { status: true , redirect : "/" } );
});

app.post("/getinfo",function (req,resp,next)
{
    resp.json(req.session);
});

app.post("/sub-comment",function (req,resp,next)
{
    commentModel.create({
       username : req.session.auth.username.toString(),
       comment : req.body.comment
    },function (err,comment) {
        if(err){throw  err}
        else
        {
            resp.json({status : true , msg : "نظر ثبت شد" });
        }
    });
});

app.post("/getcomments",function (req,resp,next)
{
    commentModel.find({},function (err, comments)
    {
        if(err){throw err}
        else
        {
            resp.json(comments)
        }
    });
});

app.post("/logup",function (req,resp,next)
{
    var formData = req.body;
    if(formData.username.length && formData.password.length)
    {
        if(formData.password.length>=4)
        {
            userModel.find({username:formData.username},function (err,users)
            {
                if (err)
                {
                    throw err;
                }
                else if (users.length)
                {
                    resp.json({status: false, msg: "نام کاربری تکراری است"})
                }
                else
                {
                    var newUser = new userModel({
                        username:formData.username,
                        password:formData.password
                    });
                    newUser.save();
                    resp.json({status:true ,
                        msg: " ثبت نام انجام شد."+
                        "نام کاربری:" + formData.username +
                        "رمز عبور:"+ formData.password
                    });
                }
            });
        }
        else
        {
            resp.json({status:false, msg:"رمز عبور باید بیشتر از 4 رقم باشد"})
        }

    }
    else
    {
        resp.json( { status : false , msg : "نام کاربری یا رمز عبور باید وارد شود"});
    }
});
//-------

//ListenPort
http.listen(port, function () {
    console.log('Server listening at port %d', port);
});
//--------------
