//alert("hi");
$(document).ready(function ()
{



    setTimeout(function () {
        $('#messages').animate({scrollTop: $('#messages').get(0).scrollHeight
        }, 500);
    },1000);


    $("#login").click(function ()
    {
        $.post("/login",{username:$("#username").val(),password:$("#password").val()},function (data)
        {
            if(data.status=="true")
            {
                $("#info").text(data['msg']);
                window.location=data.redirect;
            }
            else
            {
                $("#info").text(data['msg']);
            }
        })
    });

    $("#logup").click(function ()
    {
        $.post("/logup",{username:$("#username2").val(),password:$("#password2").val()},function (data)
        {
            $("#info2").text(data['msg']);
            if(data['status']===true)
            {
                alert(data['msg']);
                setTimeout(ok,4000);
            }

        })
    });

    $.post("/getinfo", function (data)
    {
        if (data.auth)
        {
            $("#user").html(data['auth']['username']);
        }
    });


    $("#logout").click(function ()
    {

        $.get("/logout",{username:$("#user").val()},function (data)
        {
            if(data.status)
            {
                socket.emit('logout',{username:$("#user").text()});
                window.location=data.redirect;
            }
        })
    });

    $("#sub-comment").click(function ()
    {
        if($("#comment").val()!=="")
        {
            socket.emit('chatmessage', {msg: $("#comment").val(), username: $("#user").text()});
            $.post("/sub-comment", {comment: $("#comment").val()}, function (data) {
                if (data.status) {
                    $("#comment").val("");
                    $(document).ready(function(){
                        $('#messages').animate({scrollTop: $('#messages').get(0).scrollHeight}, 500);
                    });

                }
            });
        }
    });

    //Soocket
    var socket = io();

    $("#comment").keypress(function()
    {
        socket.emit('typing',{username:$("#user").text()});
    });

    socket.on('typing',function (users)
    {
        var a="";
        users.forEach(function (user,index) {
            a=a+user+" , ";
        });
       $("#typing").html( a + " is Tyyping...");

       setTimeout( function()
       {
           ($("#typing").html(""));
           socket.emit('cleartyping',{});
       } ,3000);
    });

    socket.emit('useronline',{username:$("#user").text()});

    socket.on('useronline',function (onlines) {
        $("#users").html("");
        for(var u in onlines)
        {
            $("#users").append(
                '<div class="user-status">' +
                '<p class="user-status-text">' + u+ '</p>' +
                '</div>'
            );
        }
    });

    socket.on('chatmessage',function (msg) {
            if(msg.username===$( "#user").text())
            {
                $("#messages").append(
                    '<div class="msg">'+
                    '<div class="selfmsg">'+
                    '<div class="msg-user">'+
                    '<p class="msg-user-text">'+msg.username+':</p>'+
                    '</div>'+
                    '<p class="msg-text">'+msg.message +'</p>'+
                    '</div>'+
                    '</div>'
                );
            }
            else
            {
                $("#messages").append(
                    '<div class="msg">'+
                    '<div class="notselfmsg">'+
                    '<div class="nsmsg-user">'+
                    '<p class="nsmsg-user-text">'+msg.username+':</p>'+
                    '</div>'+
                    '<p class="msg-text">'+msg.message +'</p>'+
                    '</div>'+
                    '</div>'
                );
            }
    });

    function getComments()
    {
        $.post("/getcomments",{},function (data)
        {
            $("#messages").html("");
            data.forEach(function (comment,index)
            {

                if(comment.username===$( "#user").text())
                {
                    $("#messages").append(
                        '<div class="msg">'+
                        '<div class="selfmsg">'+
                        '<div class="msg-user">'+
                        '<p class="msg-user-text">'+comment.username+':</p>'+
                        '</div>'+
                        '<p class="msg-text">'+comment.comment +'</p>'+
                        '</div>'+
                        '</div>');
                }
                else
                {
                    $("#messages").append(
                        '<div class="msg">'+
                        '<div class="notselfmsg">'+
                        '<div class="nsmsg-user">'+
                        '<p class="nsmsg-user-text">'+comment.username+':</p>'+
                        '</div>'+
                        '<p class="msg-text">'+comment.comment +'</p>'+
                        '</div>'+
                        '</div>');
                }

            });
        });
    }

    $("#users-tgl").click(function () {
        $("#users").toggle("slow","swing",function () {

        });

    });
    getComments();
});




