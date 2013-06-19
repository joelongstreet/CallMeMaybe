$(document).ready(function(){
    function deleteTags(){
        $('#thoughts').find('li').on('click', function(){
            var clickedEl = $(this);
            var hookID = $(clickedEl).attr('id');
            $.ajax({
                url: "/hook/delete/" + hookID
            }).success(function(){
                $(clickedEl).remove();
            });
        });
    }

    /*
    $('#loginForm').on('submit', function(e){
        e.preventDefault();
        var userID = $('#email').val();
        console.log( $('#loginForm').serializeArray() );
        $.ajax({
            url: '/loginAction',
            data: $(this).serialize()
        }).success(function(data){
            console.log('ya');
            window.location = '/home';
        }).error(function(){
            console.log('ruh-oh', arguments);
        });

        return false;
    });
    */

    $('#submit-contact').on('click', function(){
        var url = "/hook/create?filter_from=";
        var email = 0;
        if($('#contact').val().length > 0){
            email = $('#contact').val();
            email = email.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
        }
        url += email;
        $.ajax({
          url: url
        }).success(function(data){
            console.log('success', data);
            $('#contact').val('');
            $('#thoughts ul').append('<li id='+ data.hookId +'>'+ email + '&nbsp; <a class="btn btn-danger btn-mini"><i class="icon-minus-sign icon-white"></i></a></li>');
            $('#helper').animate({
                bottom: 0
            }, 300, function(){
                $('#thoughts').fadeIn(500);
                deleteTags();
            });
        });
    });

    $('#submit-subject').on('click', function(){
        var url = "/hook/create?filter_subject=";
        var subject = 0;
        if($('#subject').val().length > 0){
            subject = $('#subject').val();
            subject = subject.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
        };
        var url = url + subject;
        $.ajax({
          url: url
        }).success(function() {
            $('#subject').val('');
            $('#thoughts ul').append('<li>'+ subject + '</li>');
            $('#helper').animate({
                bottom: 0
            }, 300, function(){
                $('#thoughts').fadeIn(500);
                deleteTags();
            });
        });
     });

    $('#delete').on('click', function(){
        $('#helper').animate({
            bottom: 0
        }, 300, function(){
            $('#thoughts').fadeIn(500);
        });        
    });    

    $('#callme').on('click', function(){
        $.ajax({
          url: "/call"
        }).success(function() {
          $('#helper').animate({
                bottom: 0
            }, 300, function(){
                $('#thoughts').html("<h3>We're calling you, no maybe!</h3>").fadeIn(500);
            });
        });
    });
    $('#thoughts').on('click', function(){
        $('#thoughts').fadeOut(500, function(){
            $('#helper').animate({
                bottom: -250
            }, 700);
        });
    });

    //CARLY MODE BECAUSE I AM LAZY AND BOOTSTRAP IS A WHORE
   

    $('#carly-mode').on('click', function(){
        if($(this).hasClass('btn-success')){
            $('#helper').removeClass('carly');
            $('body').css({'background': '#fff', 'font-family' : 'Raleway'});
            $('.well, .header').css({'background': '#f5f5f5', 'border-bottom': '#fff'});
            $('.logo').css('background-position', '0px 0px');
            $(this).removeClass('btn-success').text('off');
        }
        else{
            $('#helper').addClass('carly');
            $('body').css({'background': '#fbdce5', 'font-family' : 'Clicker Script'});
            $('.well, .header').css({'background': '#e3869b', 'border-bottom': '#c58d9e'});
            $('.logo').css('background-position', '0px -75px');
            $(this).addClass('btn-success').text('on');
        }
    });

    $('#active-mode').on('click', function(){
        if($(this).hasClass('btn-success')){
            $(this).removeClass('btn-success').text('off');
        }
        else{
            $(this).addClass('btn-success').text('on');
        }
    });

});