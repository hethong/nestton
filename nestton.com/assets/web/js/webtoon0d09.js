;(function($) {
    var dataC = getCookie('dataC'); // 코인사용내역 페이지에서 회차리스트 클릭시 클릭한 회차 값
    var scroll_target = $('a[name="continue"]');
    var scroll_space = 123;
    if (dataC && $(".normal_ep a").length > 0) {
        $.each($(".normal_ep a"), function (i, v) {
            if ($(v).attr('data-c') == dataC) {
                scroll_target = $(v);
                scroll_space = 240;
                return false;
            }
        });
        deleteCookie('dataC');
    }
    if ($(".episode-contents") && location.href.indexOf('/webtoon/episode/') !== -1) {
        var w = $(window), oSidebar = $(".glo_sidebar"), oContentBody = $(".episode-contents"), height = 0,
            delta = $('<div class="delta"></div>').css({height: 0, transition: 'height 0.2s ease'}).prependTo('.ep-sidebar');
        var iMaxTop = oContentBody.offset().top, iMaxHeight = oContentBody.height() - oSidebar.height();
        w.on('scroll', function () {
            var y = $(this).scrollTop();

            if (SITE_TYPE == 'F') {
                y += 110;
            }

            if (oSidebar.offset().top < y) {
                if (y + w.height() > oSidebar.offset().top + oSidebar.height()) {
                    if (w.height() > oSidebar.height()) {
                        height = y - iMaxTop;
                    } else {
                        height = (y + w.height()) - (iMaxTop + oSidebar.height());
                    }
                    height = height < 0 ? 0 : height > iMaxHeight ? iMaxHeight : height;
                    delta.height(height);
                }
            } else {
                height = y - iMaxTop;
                height = height < 0 ? 0 : height;
                delta.height(height);
            }
        });
        if (scroll_target.length > 0 && document.referrer != window.location.href) {
            window.scrollTo(0, scroll_target.offset().top - scroll_space);
        }
    }
})(jQuery);

$(document).ready(function() {
    Webtoon.init();

    var sUrl = location.href;
    if (sUrl.indexOf('/webtoon/free_webtoon') !== -1) {
        FreeWebtoon.init();
    }
    if (sUrl.indexOf('/webtoon/detail') !== -1) {
        // $('body').addClass('bg-white');
        if($('#comment_list').length > 0) Review.get_comment('0','1','V');
    }
    if (sUrl.indexOf('/webtoon/episode') !== -1) {
        if($('#comment_list').length > 0) Review.get_comment('0','1','L');
        if($('#all-step2').length > 0) {
            //전체소장
            $("#ep-remote").draggable();
            Webtoon.get_chk_episode();

            if($(".ep-body .list-ep").find(".cell-check").length) {
                $(".ep-body .list-ep").find('.cell-check').parent('a').each(function(){
                    $(this).click(function(e){
                        e.preventDefault();
                        $(this).find("input[type='checkbox']").prop("checked",function(){
                            return !$(this).prop('checked');
                        });
                        Webtoon.get_chk_episode();
                    });
                    $(this).find("input[type='checkbox']").click(function(e){
                        e.stopPropagation();
                        Webtoon.get_chk_episode();
                    });
                });
            }
        }
    }
    if($('.prettydate').length > 0){
        $(".prettydate").prettydate();
    }
});
var Webtoon = {
    toon_list_page : 1,
    toon_status : 'N',
    toggle_favorite_btn : false,
    init: function() {
        $("#toggle-like").click(function(e) {
            e.preventDefault();
            if(Webtoon.toggle_favorite_btn){
                return false;
            }else{
                Webtoon.toggle_favorite_btn = true;
            }
            var url = LANG_PREFIX + '/webtoon/set_favorite';
            var favorite = 'I';
            if($(this).hasClass('check')) {
                favorite = 'D';
            }
            var req = {
                'toon_idx': $('#toggle-like').data('option'),
                'favorite': favorite
            };
            $.post(url, req, function (data) {
                if(typeof data == 'string'){
                    data = $.parseJSON(data);
                }
                if (data.code == 200) {
                    if (favorite == 'I') {
                        $("._add_favorites").show();
                        $("._remove_favorites").hide();
                        Webtoon.hideLayer();
                    } else {
                        $("._add_favorites").hide();
                        $("._remove_favorites").show();
                        Webtoon.hideLayer();
                    }
                    $("#toggle-like").toggleClass("check");
                    Webtoon.toggle_favorite_btn = false;
                } else {
                    //alert(data.value);
                    if (data.code == 201) {
                        Base.popup('modal-login', 'login', '');
                        Webtoon.toggle_favorite_btn = false;
                    }
                    return false;
                }

            });
        });

        //코믹스 슬라이드
        $(".comics-slick").on('init',function(event,slick){
            $(this).css({
                "display":"block",
                "visibility":"visible"
            });
        }).slick({
            infinite: true,
            zIndex:10,
            dots:true,
            arrows:false,
            autoplay: true,
            autoplaySpeed: 2000,
            centerMode: true,
            slidesToShow: 5
        });

        //이 작가의 다른작품 보기 스크롤
        if($(".author-content").length) {

            var cah = $(".author-content").clone().css({
                "visibility":"hidden",
                "display":"block",
                "position":"absolute"
            });
            $("body").append(cah);
            var ah = cah.height();
            cah.remove();

            if (ah >= 560) {
                $('.author-content').slimScroll({
                    height: '560px',
                    railVisible: true,
                        alwaysVisible: false
                });
            }
        }

        //뷰어 작품소장하기
        $("#toggle-vown").click(function(e) {
            $(".vown-detail").toggleClass("active");
        });
        $('.vown-scroll').slimScroll({
            height: '150px',
            railVisible: true,
            alwaysVisible: false
        });

        // 에피소드 리스트 사이드 장르 추천 작품이 4개 이하면 인기 작풍 추천이 기본 노출
        if($('#sidebar1').data('sidebar1') <= 4){
           Webtoon.sidebar('sidebar2');
        }
        Webtoon.setLazyLoader($('img.list_lazy'), 700);
        Webtoon.setFirstNoti();

        Webtoon.trimMargin();
    },
    /**
     * 처음 상세 페이지 열면 나오는 알림
     */
    setFirstNoti: function() {
        var cook_first_noti = getCookie('first_open_episode');
        var firstNoti = $('#first_open_episode');
        var notiClass = firstNoti.attr('class');

        if ((cook_first_noti === '' || cook_first_noti !== notiClass) && firstNoti.length > 0) {
            setCookie('first_open_episode', notiClass, 10 * 365);
            firstNoti.addClass('loading_bg_on');
            firstNoti.find('.loading_v').addClass('loading_v_on');
            var timer = setInterval(
                function () {
                    firstNoti.find('.loading_v').toggleClass('loading_v_on');
                },
                500
            );
            setTimeout(function () {
                firstNoti.removeClass('loading_bg_on');
                clearInterval(timer);
            }, 3500)
        }
    },
    /**
     * 일정 시간 지난 후 layer 제거
     * @param el
     */
    hideLayer: function() {
        var toastLayer = $(".toast_popup").first();
        toastLayer.show();
        setTimeout(function() {
            toastLayer.fadeOut(100)
        }, 1000)
    },
    /**
     * lazyloader 세팅
     * @param o [jquery selecter]
     * @param t threshold
     */
    setLazyLoader: function(o, t) {
        var list_lazy = o;
        if (list_lazy.length > 0) {
            list_lazy.lazyload({threshold : t, failure_limit: 1000});
        }
    },
    getToonListMore: function(option) {
        if (Webtoon.toon_status == 'N') {
            Webtoon.toon_status = 'Y';
            // 다음 페이지
            Webtoon.toon_list_page++;

            $.post(option, {
                    'page': Webtoon.toon_list_page,
                    'load_contents': 'Y'
                },
                function (data) {
                    if (parseInt(data) == 0) {
                        Webtoon.toon_status = 'N';
                        Webtoon.toon_list_page = 'end';
                    } else {
                        Webtoon.toon_status = 'N';
                        if (option.indexOf('/webtoon/completed') !== -1) {
                            $('#toon_add').append(data);
                        } else {
                            $('#toon_list').append(data);
                        }
                        // testAddImg 삭제
                        //Webtoon.testAddImg();
                    }
                }
            );
        }
    },
    freeWebtoonPopup: function(id, url, keyword)
    {
        if (keyword =='last') {
            $('#freelink').text(lang.webtoon_3);
            $('#' + id +' .modal-title').text(lang.webtoon_4);
            $('#' + id +' H5.t1').text(lang.webtoon_5)
        }

        if(keyword == 'list') {
            $('#freelink').text(lang.webtoon_6);
            $('#' + id +' .modal-title').text(lang.webtoon_7);
        }

        if(keyword == 'fixed') {
            $('#freelink').text(lang.webtoon_7);
            $('#' + id +' .modal-title').text(lang.webtoon_8);
        }

        if(keyword == 'fixed_last') {
            $('#freelink').text(lang.webtoon_9);
            $('#' + id +' .modal-title').text(lang.webtoon_8);
        }

        $('#' + id).modal();
        $('#freelink').attr('href',url);

    },

    fixed_amount_confirm : function (sUrl)
    {
        if(confirm(lang.webtoon_10)){
            location.href = LANG_PREFIX + '/webtoon/episode/toon/4569';
        }else{
            if(sUrl != null){
                location.href = sUrl;
            }else{
                Base.popup('nomore-last');
            }
        }
    },

    /**
     * 코인 사용 안내 팝업
     * @param {string} id
     * @param {string} sUrl
     * @param {int} coin
     * @param {string} mode coin_use, cross_coin_use, free_in_app
     */
    coinUsePopupEpisode: function (id, sUrl, coin, mode) {
        if (typeof mode === 'undefined') {
            mode = 'coin_use';
        }
        //if(getCookie('ZZAMTOONuse_coin_popup')=='1') {
        var popupValue;
        if (mode == 'free_in_app') {
            popupValue = Base.FreeInAppCoinPopupGetValue();
        } else if (mode == 'coin_use') {
            popupValue = Base.coinPopupGetValue();
        } else if (mode == 'cross_coin_use') {
            popupValue = Base.crossCoinPopupGetValue();
        }
        if (popupValue == 'Y') {
            location.href=sUrl;
        } else {
            $('#use_coin_price, #use_cross_coin_price').text(coin);
            $('#use_coin_move, #use_cross_coin_move').data('url', sUrl);
            (mode == 'free_in_app') ? $("#free_in_app_link").show() : $("#free_in_app_link").hide();
            Base.popup(id);
        }
    },
    coinUsePopupEpisodeMove : function()
    {
        $('#use_coin_move').data('url');
        if($("#use_coin_save").prop("checked")) {
            //setCookie('ZZAMTOONuse_coin_popup', '1', 7);
            if($("#free_in_app_link:visible").length > 0) {
                // free_in_app use coin pop
                Base.FreeInAppcoinPopupSetValue('Y');
            } else {
                Base.coinPopupSetValue('Y');
            }
        }
        $('#ep-own').modal('hide');
        location.href=$('#use_coin_move').data('url');
    },
    crossCoinUsePopupEpisodeMove: function () {
        if ($("#use_cross_coin_save").prop("checked")) {
            Base.crossCoinPopupSetValue('Y');
        }
        $('#ep-own-cross').modal('hide');
        location.href = $('#use_cross_coin_move').data('url');
    },
    coinUsePopupDetail : function(id, sUrl, turn_order, coin)
    {
        //if(getCookie('ZZAMTOONuse_coin_popup')=='1') {
        if(Base.coinPopupGetValue()=='Y') {
            location.href=sUrl;
        } else {
            $('#move_turn_order').text(turn_order);
            $('#move_art_coin').text(coin);

            $('#use_coin_move').data('url',sUrl);
            $('#frmAllBuy').attr('action',sUrl);
            Base.popup(id);
        }
    },
    coinUsePopupDetailMove : function()
    {

        var moveType=$('input[name=move_type]:checked').val();

        if($("#use_coin_save").prop("checked")) {
            //setCookie('ZZAMTOONuse_coin_popup', '1', 7);
            Base.coinPopupSetValue('Y');
        }

        $('#viewer-own').modal('hide');

        if(moveType=='2') {
            if(parseInt($('#all_buy_coin').val()) > parseInt($('#all_buy_user_coin').val())) {
                alert(lang.webtoon_11);
                return;
            }
            $('#frmAllBuy').submit();
        } else {
            location.href=$('#use_coin_move').data('url');
        }
    },
    sidebar: function(sSide)
    {
        $('#sidebar2-menu').removeClass('active');
        $('#sidebar2').css('display', 'none');

        $('#sidebar1-menu').removeClass('active');
        $('#sidebar1').css('display', 'none');

        $('#'+sSide+'-menu').addClass('active');
        $('#'+sSide).css('display', 'block');
    },
    get_chk_episode: function() {
        var cnt=0;
        var total_coin=0;

        if($('.art_chk_box').length=='0') {
            $('#all-btn').hide();
            return;
        }

        $('.art_chk_box').each(function () {
            if($(this).prop('checked')==true){
                cnt++;
                total_coin=total_coin+parseInt($(this).attr('_data-coin'));
            }
        });
        $('.sel_ep_cnt').html(cnt);
        $('.sel_ep_coin').html(total_coin);

        if($('input[name=all_chk]').attr('_data-user-coin') < total_coin) {
            $('.btn_coin_enough').hide();
            $('.btn_coin_lack').show();
        } else {
            $('.btn_coin_enough').show();
            $('.btn_coin_lack').hide();
        }



    },
    allBtnClick: function() {
        $("#all-step1").hide();
        $("#all-step2").show();
        $("#ep-remote").show();
        $('.chk_ep').show();
        $('.normal_ep').hide();
    },
    allBtnCancel: function() {
        $("#all-step2").hide();
        $("#all-step1").show();
        $("#ep-remote").hide();
        $('.chk_ep').hide();
        $('.normal_ep').show();
    },

    coinSelUsePopup : function(id)
    {
        var cnt=0;
        var total_coin=0;
        var art_arr=new Array();
        $('.art_chk_box').each(function () {
            if($(this).prop('checked')==true) {
                art_arr[cnt]=$(this).val();
                cnt++;
                total_coin=total_coin+parseInt($(this).attr('_data-coin'));
            }
        });

        if(cnt == 0) {
            alert(lang.webtoon_12);
            return;
        }

        $('#buy_idx').val(art_arr.join(','));
        $('#all_buy_coin').val(total_coin);

        centerModal.init();
        Base.popup(id);
    },
    coinSelUsePopupMove : function(toon_idx) {

        var cnt=0;
        var total_coin=0;
        var turn_order='';
        var move_idx='';
        var move_url='';

        $('.art_chk_box').each(function () {
            if($(this).prop('checked')==true){
                if(cnt==0) {
                    turn_order=$(this).attr('_data-turn-order');
                    move_idx=$(this).val();
                }
                cnt++;
                total_coin=total_coin+parseInt($(this).attr('_data-coin'));
            }
        });

        if(cnt == 0) {
            alert(lang.webtoon_12);
            return;
        }

        move_url = LANG_PREFIX + '/webtoon/detail/code/' + move_idx + '/ep/' + turn_order + '/toon/' + toon_idx;
        $('#frmAllBuy').attr('action',move_url);
        $('#frmAllBuy').submit();
    },
    chkec: function (obj, key) {
        if (!key) {
            key = $(obj).attr('data-e') + "|" + $(obj).attr('data-c') + "|" + $(obj).attr('data-v');
        }
        setCookie('ecc', key)
    },
    trimMargin: function () {
        // 웹툰 하단 여백 조정
        let $viewer = $('#viewer-img');
        let vbm = $viewer.data('bottomMargin');

        if ($viewer.length && typeof vbm !== 'undefined' && vbm > 0) {
            $(window).on('load scroll', function () {
                let vh = 0;

                // 뷰어 안쪽의 이미지들 높이 계산
                $('img[id^=set_image_]').each(function (index, element) {
                    vh += $(element).height();
                });

                // 뷰어 높이를 상단 여백과 하단 여백 계산해서 줄인값으로 변경
                if (200 - vbm < 0) { // 줄이기만 동작
                    $viewer.css('height', vh + 200 - vbm);
                    $viewer.css('overflow', 'hidden');
                }
            });
        }
    },
    toggleUseCoinMessage: function () {
        var $checkbox = $('#use_coin_save');

        if ($checkbox.prop('checked')) {
            $checkbox.prop('checked', false);
            $checkbox.parent('button').removeClass('check');
        } else {
            $checkbox.prop('checked', true);
            $checkbox.parent('button').addClass('check');
        }
    },
    end: function() {}
};


var FreeWebtoon = {
    init : function()
    {
        // 전체 리스트
        var weekToonCnt = $('#weekly_tab .wbox li').length;

        $(window).scroll(function() {
            // 화면의스크롤을 구합니다
            var windowTop = $(window).scrollTop();
            var windowBottom = $(window).height() + windowTop;
            var wboxBottom = $('#freeweektoon .wbox').offset().top + $('#freeweektoon .wbox').height();
            var weekToonDisplay = $('#freeweektoon .wbox li:visible').length;
            var weekToonHidden = $('#freeweektoon .wbox li:hidden');

            if (weekToonCnt != weekToonDisplay && windowBottom > wboxBottom ) {
                weekToonHidden.each(function(k,v) {
                    if(k < 11){
                        var imgSrc = $(this).find("div.thumb img").attr("data-img-src");
                        $(this).find( "div.thumb img").attr("src",imgSrc);
                        $(this).fadeIn('fast');
                    }
                });
            }
        });

    }
};

var Review = {
    init: function () {

    },
    star_minus : function() {
        var star_point=$('#grade_score').val();
        star_point=parseInt(star_point)-1;
        if(star_point < 1) star_point=1;
        $('#grade_score').val(star_point);
        $('#star_score_img').attr('style','width:'+(star_point*10)+'%');
        $('#star_score_set').html(star_point)
    },

    star_plus : function() {
        var star_point=$('#grade_score').val();
        star_point=parseInt(star_point)+1;
        if(star_point > 10) star_point=10;
        $('#grade_score').val(star_point);
        $('#star_score_img').attr('style','width:'+(star_point*10)+'%');
        $('#star_score_set').html(star_point)
    },

    set_star : function() {
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + '/webtoon/set_score',
            dataType: 'json',
            async : false,
            data: {
                'score' : $('#grade_score').val(),
                'toon_idx' : $('#grade_toon_idx').val(),
                'art_idx' : $('#grade_art_idx').val(),
                'os' : 'W',
                'store_type' : 'P'
            },
            success: function(data) {
                if (data.alert) {
                    alert(data.alert.replace(/<br>/gi,'\n'));
                }
                if(data.score){
                    $('#total_score_img').attr('style','width:'+(Math.ceil(data.score)*10)+'%');
                    $('#total_score_set').html(data.score);
                    $('#score_user_cnt').html(data.user_cnt);
                    $('#score_chk').show();
                    $('.star-view').hide();
                }

            },
            error: function(data) {}
        });
    },

    get_comment : function(last_idx , page, location) {
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + '/webtoon/comment_list/location/'+location,
            dataType: 'html',
            async : false,
            data: {
                'toon_idx' : $('#grade_toon_idx').val(),
                'last_idx' : last_idx,
                'art_idx' : $('#grade_art_idx').val(),
                'page' : page,
                'os' : 'W',
                'store_type' : 'P',
                'location' : location
            },
            success: function(html) {
                if (html) {

                    if(location=='V') {
                        $('#comment_paging').remove();
                        $('#comment_list').html('');
                        $('#comment_list').last().append(html);
                        $('#comment_nav').prepend($('#comment_paging'));
                        $('#comment_paging').show();
                        $('#total_cnt').html($('#comment_cnt').val());
                        $('#total_cnt2').html($('#comment_cnt').val());
                    } else {
                        $('#comment_paging').remove();
                        $('#comment_list').html('');
                        $('#comment_list').last().append(html);
                        $('#review1').append($('#comment_paging'));
                        $('#comment_paging').show();
                        $('#total_cnt').html($('#comment_cnt').val());
                    }

                }
                if(location=='V') {
                    $('.vcomment').attr('href', '#comment_section');
                }
            },
            error: function(data) {}
        });
    },

    set_like : function(idx,act_type,location) {
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + '/webtoon/set_like',
            dataType: 'json',
            async : false,
            data: {
                'comment_idx' : idx,
                'act_type' : act_type,
                'location' : location,
                'os' : 'W',
                'store_type' : 'P'

            },
            success: function(data) {
                if (data.alert) {
                    alert(data.alert.replace(/<br>/gi,'\n'));
                }
                if (data.code=='00') {
                    if(act_type=='R') {
                        if(data.like_cnt > 999) {
                            $('.like_idx_'+idx).html('999+');
                        } else {
                            $('.like_idx_'+idx).html(data.like_cnt)
                        }
                        $('.comment_idx_'+idx).attr('onclick',$('.comment_idx_'+idx).attr('onclick').replace("'R'","'D'"));
                        $('.comment_idx_'+idx).addClass('on');
                        $('.comment_idx_'+idx).blur();
                    } else {
                        if(data.like_cnt > 999) {
                            $('.like_idx_'+idx).html('999+');
                        } else {
                            $('.like_idx_'+idx).html(data.like_cnt)
                        }                        $('.comment_idx_'+idx).attr('onclick',$('.comment_idx_'+idx).attr('onclick').replace("'D'","'R'"));
                        $('.comment_idx_'+idx).removeClass('on');
                        $('.comment_idx_'+idx).blur();
                    }
                }
            },
            error: function(data) {}
        });
    },
    set_comment : function(location, act_type, idx) {
        if(act_type=='R' && $('#comment').val()=='') {
            alert(Webtoon_Lang['webtoon_lang1']);
            return;
        }
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + '/webtoon/set_comment',
            dataType: 'json',
            data: {
                'act_type' : act_type,
                'toon_idx' : $('#grade_toon_idx').val(),
                'art_idx' : $('#grade_art_idx').val(),
                'comment' : $('#comment').val(),
                'comment_idx' : idx,
                'location' : location,
                'os' : 'W',
                'store_type' : 'P'

            },
            success: function(data) {
                if (data.alert) {
                    alert(data.alert.replace(/<br>/gi,'\n'));
                }
                if (data.code=='00') {
                    $('#comment_more').remove();
                    $('.comment-list').html('');
                    Review.get_comment('0','1',location);
                    if(act_type=='R') {
                        $('#comment').val('');
                        $('#comment_char_cnt').html('0');
                    }
                }
                if (data.code=='703' || data.code=='705') {
                    if(act_type=='R') {
                        $('#comment').val('');
                        $('#comment_char_cnt').html('0');
                    }
                }
            },
            error: function(data) {}
        });
        $('.btn.btn-block.btn-dgray').blur();
    },

    open_popup: function(id, comment_idx)
    {
        $('#report_comment_idx').val(comment_idx);

        $('#'+id).modal();
    },

    set_report: function()
    {
        if (!$('#report_comment_idx').val()) {
            alert(lang.webtoon_13);
            return;
        }

        // 타입선택
        if (!$(':radio[name="report_type"]:checked').val()) {
            alert(lang.webtoon_14);
            return;
        }

        // 타입에 따른 텍스트 입력
        if ($(':radio[name="report_type"]:checked').val() == '9') {
            if (!$('#report').val()) {
                alert(lang.webtoon_15);
                return;
            }
        }

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + '/webtoon/set_report',
            dataType: 'json',
            data: {
                'comment_idx' : $('#report_comment_idx').val(),
                'report_type' : $(':radio[name="report_type"]:checked').val(),
                'report' : $('#report').val(),
                'os': 'W',
                'store_type' : 'P'
            },
            success: function(data) {
                alert(data.alert.replace(/<br>/gi,'\n'));

                if (data.code=='00') {
                    // 작성내용 초기화
                    $('#report').val('');
                    $(':radio[name="report_type"]').prop('checked', false);

                    $('#modal-report').modal('hide');
                }
            },
            error: function(data) {}
        });
    }
};

var Recently = {
    init: function () {

    },
    on_recntly_edit_mode: function () {
        $(".recently-edit-btn").css("display", "none");
        $(".recently-edit-mode").css("display", "");
        $(".section_myrecent").addClass('delete-active');
    },
    off_recntly_edit_mode: function () {
        $(".recently-edit-btn").css("display", "");
        $(".recently-edit-mode").css("display", "none");
        $(".section_myrecent").removeClass('delete-active');

        if (SITE_TYPE == 'F') {
            $(".section_myrecent .list__delet__wrap").removeClass('check');
            $("#recently_check_all_btn").removeClass('check');

            $(".delet__num mark").text(0);
        } else {
            $(".section_myrecent .delete__visual").removeClass('active');
            $("#recently_check_all_btn").removeClass('active');

            $(".select__sub-rg mark").text(0);
        }
    },
    check_delete_toon: function (ele) {
        let class_name = '';

        if (SITE_TYPE == 'F') {
            class_name = 'check';
        } else {
            class_name = 'active';
        }

        if ($(ele).parent().hasClass(class_name)) {
            $(ele).parent().removeClass(class_name);
        } else {
            $(ele).parent().addClass(class_name);
        }

        this.count_del_check_toon();
    },
    select_all: function (ele) {
        if (SITE_TYPE == 'F') {
            if ($(ele).hasClass('check')) {
                $(".section_myrecent .list__delet__wrap").removeClass('check');
                $(ele).removeClass('check');
            } else {
                $(".section_myrecent .list__delet__wrap").addClass('check');
                $(ele).addClass('check');
            }
        } else {
            if ($(ele).hasClass('active')) {
                $(".section_myrecent .delete__visual").removeClass('active');
                $(ele).removeClass('active');
            } else {
                $(".section_myrecent .delete__visual").addClass('active');
                $(ele).addClass('active');
            }
        }

        this.count_del_check_toon();
    },
    count_del_check_toon: function () {
        if (SITE_TYPE == 'F') {
            let del_toon_cnt = $(".section_myrecent .list__delet__wrap.check").length;
            let total_recently_cnt = $("#total_recently_cnt").val();

            $(".delet__num mark").text(del_toon_cnt);

            if (total_recently_cnt == del_toon_cnt) {
                $("#recently_check_all_btn").addClass('check');
            } else {
                $("#recently_check_all_btn").removeClass('check');
            }

            if (del_toon_cnt > 0) {
                $("#recently_delete_btn").removeClass('disabled');
            } else {
                $("#recently_delete_btn").addClass('disabled');
            }
        } else {
            let del_toon_cnt = $(".section_myrecent .delete__visual.active").length;
            let total_recently_cnt = $("#total_recently_cnt").val();

            $(".select__sub-rg mark").text(del_toon_cnt);

            if (total_recently_cnt == del_toon_cnt) {
                $("#recently_check_all_btn").addClass('active');
            } else {
                $("#recently_check_all_btn").removeClass('active');
            }

            if (del_toon_cnt > 0) {
                $("#recently_delete_btn").addClass('active');
            } else {
                $("#recently_delete_btn").removeClass('active');
            }
        }
    },
    delete_recently_confirm: function () {
        let del_lists = [];

        if (SITE_TYPE == 'F') {
            $(".section_myrecent  li .list__delet__wrap.check .list__delet__wrap__con").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        } else {
            $(".section_myrecent  li .delete__visual.active .delete__check").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        }

        if (del_lists.length > 0) {
            $("#modal_del_cnt").text(del_lists.length);
            $("#recent_delete").modal();
        }
    },
    delete_recently_toon: function () {
        var del_lists = [];

        if (SITE_TYPE == 'F') {
            $(".section_myrecent  li .list__delet__wrap.check .list__delet__wrap__con").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        } else {
            $(".section_myrecent  li .delete__visual.active .delete__check").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        }

        if (del_lists.length > 0) {
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + '/webtoon/ajax_add_delete_recently_list',
                dataType: 'json',
                async: false,
                data: {
                    'del_idx': del_lists
                },
                success: function (response) {
                    if (response.code == 200) {
                        location.reload();
                    }
                },
                error: function (response) {
                }
            });
        }
    }
};

var Favorite = {
    init: function () {

    },
    on_favorite_edit_mode: function () {
        $(".favorite-edit-btn").css("display", "none");
        $(".favorite-edit-mode").css("display", "");
        $(".section_myfavorite").addClass('delete-active');
    },
    off_favorite_edit_mode: function () {
        $(".favorite-edit-btn").css("display", "");
        $(".favorite-edit-mode").css("display", "none");
        $(".section_myfavorite").removeClass('delete-active');

        if (SITE_TYPE == 'F') {
            $(".section_myfavorite .list__delet__wrap").removeClass('check');
            $("#favorite_check_all_btn").removeClass('check');

            $(".delet__num mark").text(0);
        } else {
            $(".section_myfavorite .delete__visual").removeClass('active');
            $("#favorite_check_all_btn").removeClass('active');

            $(".select__sub-rg mark").text(0);
        }
    },
    check_delete_toon: function (ele) {
        let class_name = '';

        if (SITE_TYPE == 'F') {
            class_name = 'check';
        } else {
            class_name = 'active';
        }

        if ($(ele).parent().hasClass(class_name)) {
            $(ele).parent().removeClass(class_name);
        } else {
            $(ele).parent().addClass(class_name);
        }

        this.count_del_check_toon();
    },
    select_all: function (ele) {
        if (SITE_TYPE == 'F') {
            if ($(ele).hasClass('check')) {
                $(".section_myfavorite .list__delet__wrap").removeClass('check');
                $(ele).removeClass('check');
            } else {
                $(".section_myfavorite .list__delet__wrap").addClass('check');
                $(ele).addClass('check');
            }
        } else {
            if ($(ele).hasClass('active')) {
                $(".section_myfavorite .delete__visual").removeClass('active');
                $(ele).removeClass('active');
            } else {
                $(".section_myfavorite .delete__visual").addClass('active');
                $(ele).addClass('active');
            }
        }

        this.count_del_check_toon();
    },
    count_del_check_toon: function () {
        if (SITE_TYPE == 'F') {
            let del_toon_cnt = $(".section_myfavorite .list__delet__wrap.check").length;
            let total_recently_cnt = $("#total_favorite_cnt").val();

            $(".delet__num mark").text(del_toon_cnt);

            if (total_recently_cnt == del_toon_cnt) {
                $("#favorite_check_all_btn").addClass('check');
            } else {
                $("#favorite_check_all_btn").removeClass('check');
            }

            if (del_toon_cnt > 0) {
                $("#favorite_delete_btn").removeClass('disabled');
            } else {
                $("#favorite_delete_btn").addClass('disabled');
            }
        } else {
            let del_toon_cnt = $(".section_myfavorite .delete__visual.active").length;
            let total_recently_cnt = $("#total_favorite_cnt").val();

            $(".select__sub-rg mark").text(del_toon_cnt);

            if (total_recently_cnt == del_toon_cnt) {
                $("#favorite_check_all_btn").addClass('active');
            } else {
                $("#favorite_check_all_btn").removeClass('active');
            }

            if (del_toon_cnt > 0) {
                $("#favorite_delete_btn").addClass('active');
            } else {
                $("#favorite_delete_btn").removeClass('active');
            }
        }
    },
    delete_favorite_confirm: function () {
        let del_lists = [];

        if (SITE_TYPE == 'F') {
            $(".section_myfavorite  li .list__delet__wrap.check .list__delet__wrap__con").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        } else {
            $(".section_myfavorite  li .delete__visual.active .delete__check").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        }

        if (del_lists.length > 0) {
            $("#modal_del_cnt").text(del_lists.length);
            $("#favorite_delete").modal();
        }
    },
    delete_favorite_toon: function () {
        var del_lists = [];

        if (SITE_TYPE == 'F') {
            $(".section_myfavorite  li .list__delet__wrap.check .list__delet__wrap__con").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        } else {
            $(".section_myfavorite  li .delete__visual.active .delete__check").each(function (i) {
                del_lists.push($(this).attr('del_idx'));
            });
        }
        if (del_lists.length > 0) {
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + '/webtoon/ajax_add_delete_favorite_list',
                dataType: 'json',
                async: false,
                data: {
                    'del_idx': del_lists
                },
                success: function (response) {
                    if (response.code == 200) {
                        location.reload();
                    }
                },
                error: function (response) {
                }
            });
        }
    }
};

/**
 * set pretty langauge
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);// AMD. Register as anonymous module.
    } else {
        factory(jQuery);// Browser globals.
    }
}(function ($) {
    "use strict";
    $.fn.prettydate.setDefaults({
        afterSuffix: lang['date_msg_19'],
        beforeSuffix: lang['date_msg_20'],
        dateFormat: "YYYY-MM-DD hh:mm:ss",
        messages: {
            second: lang['date_msg_1'],
            seconds: lang['date_msg_2'],
            minute: lang['date_msg_3'],
            minutes: lang['date_msg_4'],
            hour: lang['date_msg_5'],
            hours: lang['date_msg_6'],
            day: lang['date_msg_7'],
            days: lang['date_msg_8'],
            week: lang['date_msg_9'],
            weeks: lang['date_msg_10'],
            month: lang['date_msg_11'],
            months: lang['date_msg_12'],
            year: lang['date_msg_13'],
            years: lang['date_msg_14'],

            // Extra
            yesterday: lang['date_msg_15'],
            beforeYesterday: lang['date_msg_16'],
            tomorrow: lang['date_msg_17'],
            afterTomorrow: lang['date_msg_18']
        }
    });
}));