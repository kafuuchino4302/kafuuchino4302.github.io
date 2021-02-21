$('<img/>').attr('src', '/assets/images/background-1.jpg').on('load', function() {
   $(this).remove();
   bgimgok();
});
$('<img/>').attr('src', '/assets/images/background-2.jpg').on('load', function() {
   $(this).remove();
   bgimgok();
});
$('<img/>').attr('src', '/assets/images/background-7.jpg').on('load', function() {
   $(this).remove();
   bgimgok();
});
$('<img/>').attr('src', '/assets/images/background-3.jpg').on('load', function() {
   $(this).remove();
   bgimgok();
});
$('<img/>').attr('src', '/assets/images/background-4.jpg').on('load', function() {
   $(this).remove();
   bgimgok();
});
$("#inloading").show();
var bgoknum = 0;
function bgimgok()
{
  bgoknum++;
  if(bgoknum == 5)
  {
    $("#inloading").hide();
    $(document).ready(function () {
      index_int();
    });
  }
}

var delay=2000;
var i=0;
var player;
var _prog;
var music_i = 0;
var songlist = [
  "assets/file/1.mp3",
  "assets/file/7.mp3",
  "assets/file/2.mp3",
  "assets/file/3.mp3",
  "assets/file/4.mp3"
];
var songname = [
  "梶浦由記 - Never leave you alone",
  "梶浦由記 - 魔法少女のテーマ",
  "梶浦由記 - Sagitta luminis",
  "Kalafina - 君の銀の庭",
  "梶浦由記 - Decretum(宿命)"
];
var bginfo = [
  "Background by <a href='https://www.pixiv.net/member_illust.php?mode=medium&illust_id=48824021' target='_blank'>lyiet</a>",
  "Background by <a href='https://www.pixiv.net/artworks/39874924' target='_blank'>Panciii</a>",
  "Background by <a href='https://www.pixiv.net/member_illust.php?mode=medium&illust_id=61105326' target='_blank'>saihate▽月曜南セ22a</a>",
  "Background by <a href='https://www.pixiv.net/member_illust.php?mode=medium&illust_id=61330061' target='_blank'>霜葉</a>",
  "Background by <a href='https://www.pixiv.net/member_illust.php?mode=medium&illust_id=44413046' target='_blank'>ぱち＠お仕事募集中</a>"
];
var music_duration;


function scrollit(){
  i=i+1;
  $('#txt'+i).fadeIn(4000);
  if(i==6){
    return;
  }
  else {
    setTimeout("scrollit()",delay);
  }
}

function playMusic() {
    if (player.paused){
        player.play();
    }else {
        player.pause();
    }
}
function set_music_progress(){
    _prog = (Number(player.currentTime).toFixed(2) / music_duration * 100).toFixed(2);
    $(".progress-bar").attr("aria-valuenow",_prog);
    $(".progress-bar").css("width",_prog+"%");
}

function change_music(){
    $('.swiper-pagination span');
}

function load_music(a){
  $('#music_name').html(songname[a]);
  $('#bginfo').html(bginfo[a]);
  player.src = songlist[a];
  player.load();
  player.play();
}

function index_int(){
  player = $("#audio")[0];
  $('#music_btn_play').click(function(){
    playMusic();
  });

  $(".progress").click(function(e){
    var x=$(this).offset().left;
    var _x=e.clientX;
    var _wh = $(".progress").width();
    var __i = (_x - x) / _wh;
    player.currentTime = music_duration * __i;
  });

  $('audio').bind('timeupdate', function(){
    set_music_progress();
  });
  $('audio').bind('pause', function(){
    $(".music_progress").fadeOut(500);
    $("#music_btn_play").addClass("icon-play-circle");
    $("#music_btn_play").removeClass("icon-pause-circle");
  });
  $('audio').bind('ended',function(){
    var i = Number(music_i)+1;
    if(i == songlist.length)
    {
      $('.swiper-pagination-bullet').eq(0).trigger("click");
    }
    else{
      $('.swiper-pagination-bullet').eq(i).trigger("click");
    }
  });
  $('audio').bind('durationchange',function(){
    music_duration = player.duration;
  });
  $('audio').bind('play', function(){
    music_duration = player.duration;
    $(".music_progress").fadeIn(500);
    $("#music_btn_play").addClass("icon-pause-circle");
    $("#music_btn_play").removeClass("icon-play-circle");
  });
  $('.swiper-pagination-bullet').each(function(i,b){
    $(b).attr("tid",i);
  });


  var ul = document.querySelector(".swiper-pagination");
  var Observer = new MutationObserver(function (mutations, instance) {
    mutations.forEach(function (mutation) {
      mutation.target.childNodes.forEach(function(d){
        var cname = d.className.toString();
        if(cname.indexOf("active") > -1)
        {
          music_i = d.getAttribute("tid");
          console.log(music_i);
          load_music(d.getAttribute("tid"));
        }
      });
    });
  });

  Observer.observe(ul, {
    attributes: true
  });
  scrollit();
  load_music(0);
}




/*function git_login(){
location.href = ;
$.post("m.php?type=login",{page:num}, function(data) {
  location.href = $url+$data;
});
}
*/
