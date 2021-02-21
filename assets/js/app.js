var itoken = localStorage.getItem("token");
$("#header").load("/header.html");
$("#footer").load("/footer.html");
if(window.location.href == "https://kami.im/" || window.location.href.indexOf("index.html"))
{
  $("#header").removeClass("header-dark");
}

function getuserinfo(){
  var s0='<a href="/portal.html"><i class="icon-login"></i>Sign in</a>';
  var s1='<div class="row align-items-center"><div class="col-sm"><a href="me.html"><div class="avatar"></div><span class="name"></span></a></div></div>';
  $.post("/m.php",{'token':itoken},function(data) {
    data = JSON.parse(data);
    if(data.uid==0)
    {
      $('.login').html(s0);
      localStorage.setItem('token','');
      //$('.git_login_btn').attr("href","https://github.com/login/oauth/authorize?client_id=9aa2e7a13313ac0971b3&state="+data.sid);
    }
    else {
      $('.login').html(s1);
      $('.login .avatar').css("background-image","url(/getavatar.php?uid="+data.uid+")");
      $('.login .name').html(data.user);
      if(data.newtoken !="")
      {
        localStorage.setItem('token', data.newtoken);
      }
      if(window.location.href.indexOf("portal.html"))
      {
        $('.vh-md-100').html('<div class="col isloginon"><h5>hello, <b>'+data.user+'</b> are you OK? <a href="/login.php?type=loginout">login out?</a></h5></div>');
      }
    }
    if(data.hmnum !="0")
    {
      $('.soul').html("today <b>"+data.hmnum+"</b> Soul Point");
    }
    else {
      $('.soul').html("today No Soul Point");
    }
  });
}
function getartlist(num){
  $.post("get.php",{page:num}, function(data) {
    data = $.parseJSON(data);
    $("#artlist").html(Base64.decode(data['artdata']));
    $(".pagination").html(Base64.decode(data['pagedata']));
  });
}

(function ($) {
  "use strict";

  var fn = {

    // Launch Functions
    Launch: function () {
      fn.Header();
      fn.OwlCarousel();
      fn.ImageView();
      fn.Swiper();
      fn.Masonry();
      fn.Apps();
    },


    // header
    Header: function (){
      $(document.body).headroom({
        tolerance : 10
      });
    },

    // owlcarousel
    OwlCarousel: function() {

      $('.owl-carousel').each(function() {
        var a = $(this),
          items = a.data('items') || [1,1,1,1],
          margin = a.data('margin'),
          loop = a.data('loop'),
          nav = a.data('nav'),
          dots = a.data('dots'),
          center = a.data('center'),
          speed = a.data('speed'),
          autoplay = a.data('autoplay'),
          autoplayTimeout = a.data('autoplaytimeout'),
          autoplaySpeed = a.data('autoplayspeed'),
          rtl = a.data('rtl'),
          autoheight = a.data('autoheight'),
          thumbs = a.data('thumbs');

        var options = {
          nav: nav || false,
          loop: loop || false,
          dots: dots || false,
          center: center || false,
          autoplay: autoplay || false,
          autoHeight: autoheight || false,
          rtl: rtl || false,
          margin: margin || 0,
          navSpeed: speed || 400,
          dotsSpeed: speed || 400,
          autoplayTimeout: autoplayTimeout || 3000,
          autoplaySpeed: autoplaySpeed || 400,
          autoplayHoverPause: true,
          thumbs: thumbs || false,
          thumbsPrerendered: thumbs || false,
          responsive: {
            0: { items: items[3] || 1 },
            992: { items: items[2] || 1 },
            1200: { items: items[1] || 1 },
            1600: { items: items[0] || 1}
          }
        };

        a.owlCarousel(options);
      });
    },


    // image view
    ImageView: function() {
      $('.lightbox').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
        image: {
          verticalFit: true
        }
      });

      $('.gallery').each(function() { // the containers for all your galleries
          $(this).magnificPopup({
              delegate: 'figure > a', // the selector for gallery item
              type: 'image',
              mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
              gallery: {
                enabled:true
              }
          });
      });
    },


    // swiper
    Swiper: function() {

      $('.swiper-container').each(function(index, element){
        var $this = $(this);

        $this.find(".swiper-pagination").addClass("swiper-pagination-" + index);

        var options = {
          parallax: true,
          speed: 1500,
          loop: true,
          simulateTouch: false,
          effect: 'fade',

          //pagination
          pagination: {
            el: '.swiper-pagination-' + index,
            clickable: true
          }

        };

        var slider = $(this);

        if ($(this).hasClass('swiper-container-carousel')) {
          options.spaceBetween = 10;
          options.effect = 'slide';
          options.simulateTouch = true;
          options.slideToClickedSlide = true;
        }

        new Swiper ( slider, options );
      });



      if ( $( ".gallery-container" ).length ) {
        var galleryTop = new Swiper('.gallery-container', {
          effect: 'fade',
          speed: 1500,
          simulateTouch: false
        });
        var galleryThumbs = new Swiper('.gallery-thumbs', {
          centeredSlides: true,
          slidesPerView: 6,
          speed: 1500,
          breakpoints: {
            1600: { slidesPerView: 5 },
            1200: { slidesPerView: 3 },
            768: { slidesPerView: 2 },
            576: { slidesPerView: 2 }
          },
          slideToClickedSlide: true
        });
        galleryTop.controller.control = galleryThumbs;
        galleryThumbs.controller.control = galleryTop;
      }

    },


    // masonry
    Masonry: function() {
      var $grid = $('.masonry').masonry({
        itemSelector: '.masonry > *',
      });

      $grid.imagesLoaded().progress( function() {
        $grid.masonry('layout');
      });
    },


    // sidebar
    Sidebar: function() {
      var sidebar_open = $(".sidebar-open");
      var sidebar = $(".sidebar")
      var sidebar_close = $(".sidebar-close");
      sidebar_open.click( function () {
          if( $(this).hasClass("open") ) {
             $(this).removeClass("open");
          }
          else {
              speaker.removeClass("open");
              $(this).addClass("open");
          }
      });
    },


    // apps
    Apps: function () {
      // lavalamp
      $('.lavalamp').lavalamp({
        setOnClick: true,
        enableHover: false,
        margins: false,
        autoUpdate: true,
        duration: 200
      });


      // steps
      $('.next-step').click(function(){
        $('.nav-steps > .active').next('.nav-link').trigger('click');
      });

      $('.prev-step').click(function(){
        $('.nav-steps > .active').prev('.nav-link').trigger('click');
      });


      // range slider
      $('.rangeslider').each(function() {
        var a = $(this),
          min = a.data('min'),
          max = a.data('max'),
          from = a.data('from'),
          to = a.data('to')

        var options = {
          type: "double",
          min: min || 0,
          max: max || 1000,
          from: from || 200,
          to: to || 800,
          prefix: "$"
        };

        a.ionRangeSlider(options);
      });

      // counter
      $(document).ready(function(){

          $('.counter-plus').click(function(){

              var fieldID = $(this).attr('field'),
                  fieldVal = parseInt($('input[name='+fieldID+']').val());

              if (!isNaN(fieldVal)) {
                  $('input[name='+fieldID+']').val(fieldVal + 1);
              } else {
                  $('input[name='+fieldID+']').val(0);
              }
          });

          $(".counter-minus").click(function() {

              var fieldID = $(this).attr('field'),
                  fieldVal = parseInt($('input[name='+fieldID+']').val());

              if (!isNaN(fieldVal) && fieldVal > 0) {
                  $('input[name='+fieldID+']').val(fieldVal - 1);
              } else {
                  $('input[name='+fieldID+']').val(0);
              }
          });
      });




      //  accordion with radio buttons
      $(".accordion-radio").on('click', function(){
          $(this).next('input').prop("checked", true);
      });

      // accordion active class
      $('.collapse').on('show.bs.collapse', function () {
        $(this).parent().addClass('active');
      });

      $('.collapse').on('hide.bs.collapse', function () {
        $(this).parent().removeClass('active');
      });


      // skrollr
      skrollr.init({
          forceHeight: false,
          mobileCheck: function() {
              //hack - forces mobile version to be off
              return false;
          }
      });



      // tooltips
      $('[data-toggle="tooltip"]').tooltip();


      // timer
      $('#timer').countdown('2020/01/01', function(event) {
          var $this = $(this).html(event.strftime(''
              + '<div>%D <span>days</span></div> '
              + '<div>%H <span>hours</span></div> '
              + '<div>%M <span>min</span></div> '
              + '<div>%S <span>sec</span></div>'));
      });


      // smooth scroll
      $(function () {
        var scroll = new SmoothScroll('[data-scroll]');
      });


      // mobile menu open state
      $(document).ready(function(){
        $('.navbar-toggler').click(function(){
          $('body').toggleClass('overlay-active');
        });
      });


      // zoom
      $('.zoom').zoom();
      // $('.zoom-click').zoom({ on:'click' });


      // sub menu
      $('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
          $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');


        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
          $('.dropdown-submenu .show').removeClass("show");
        });
        return false;
      });
    }
  };


  $(document).ready(function () {
    getuserinfo();
    fn.Launch();
  });

})(jQuery);
/*if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", orientationHandler, false);
}
function orientationHandler(event) {
  $(".image-overlay").css("background-position-x",event.beta+"px");
  $(".image-overlay").css("background-position-y",event.gamma+"px");
}*/
