$(document).ready(function () {
    Base.init();
    layerLogin.init();
    layerRegister.init();
    Search.init();
    // if ($('#viewer-img').length == 0) {
    if ($('#site_type').val() != 'F') {
        centerModal.init();
    }
    // }
    $(document).on('click', function (e) {
        setCookie('cp', e.pageX + "|" + e.pageY);

        // 'layer-mymenu' close event.
        if (e && e.type === 'click' && /p|label|button/i.test(e.target.tagName) && $(e.target).closest('.layer-mymenu').is('.layer-mymenu')) {
            return;
        }
        $("#gender_popup_text").css("display", "none");
        $(".layer-mymenu").removeClass("active");

    });
    setCookie('backurl', document.referrer);

    if (getCookie('setMyMenu') === 'Y') {
        $(".layer-mymenu").addClass("active");
        deleteCookie('setMyMenu');
    }

    // 성별 선택 modal open
    if ($("#is_show_gen_modal").val() == 1) {
        $("#gender_select").modal();
    }

    // applink 호출
    AppLaunch.init();
});

const LANG_PREFIX = getLangPrefix(),
    CONTENT_LANG = getLang(),
    DOMAIN_PART = location.hostname.split('.'),
    SUB_DOMAINS = (DOMAIN_PART.length > 2) ? DOMAIN_PART.shift() : DOMAIN_PART,
    UPPER_LEVEL_DOMAINS = DOMAIN_PART.join('.');


var Base = {
    init: function () {
        slickMainBanner();
        slickMyRecent();
        slickMyFavorite();
        slickBecause_1();
        slickBecause_2();
        slickBecause_3();
        slickBecause_4();
        slickBecause_5();
        slickTodayUp();
        slickRanking();
        slickNewComic();
        slickHot();
        slickBottomBanner();
        episodeViewer();

        // 메인 배너 배경 로드
        if ($('.main_banner_item').length > 0) {
            $('.main_banner_item .slider_item').each(function () {
                Base.preload($(this).data('bg'));
            });
        }

        if ($('#origin-to-short').length != 0) {
            // 생성
            var clipboard = new Clipboard('.btn');

            clipboard.on('success', function (e) {
                console.log(e);
                alert(lang.base_2);
            });

            clipboard.on('error', function (e) {
                console.log(e);
                alert(lang.base_3);
            });
        }

        // 모달 이 있다면 로드
        if ($("#alert").length != 0) {
            $("#alert").imagesLoaded().done(function () {
                $("#alert").modal();
            });
        }

        if ($("#new").length != 0) {
            $(".mbanner3-slick").imagesLoaded().done(function () {
                //모달 메인배너 슬라이드
                Base.popup('new');
            });
        }

        // 라인 인풋
        $(".form-group-line .form-control").on('focusin focusout',function(e){
            var label = $(this).next('label');

            if(e.type === 'focusin') {
                TweenMax.to(label,0.1, {
                    y:-20,
                    scale:0.8,
                    transformOrigin:"0 0",
                    ease:Power0.easeNone
                });
            } else {
                if(!$(this).val()) {
                    TweenMax.to(label,0.1, {
                        y:0,
                        scale:1,
                        transformOrigin:"0 0",
                        ease:Power0.easeNone
                    });
                }
            }
        });

        $(".form-group-line .form-control").each(function(index,item){
            var label = $(item).next('label');
            if($(item).val()) {
                TweenMax.to(label,0.1, {
                    y:-20,
                    scale:0.8,
                    transformOrigin:"0 0",
                    ease:Power0.easeNone
                });
            }
        });

        if (getCookie('GTOOMICSt_log')) {
            Base.t_call(getCookie('GTOOMICSt_log'));
            deleteCookie('GTOOMICSt_log');
        }

        // 성별 정보 업데이트
        var btn_gender_eml = $('#btn_gender');
        if (btn_gender_eml.length !== 0) {
            btn_gender_eml.click(function () {
                $('#gender_popup_text').toggle();
            });

            $("input:radio[name='gender']").click(function () {
                var currentSelectGen = $("input:radio[name='gender']:checked").val()
                var currentSelectGenTxt = $("input:radio[name='gender']:checked + label").text();

                $.ajax({
                    url: LANG_PREFIX + '/auth/selected_gender',
                    type: 'post',
                    dataType: 'text',
                    data: {
                        'gender_code': currentSelectGen
                    },
                    success: function () {
                        $("#gender_popup_text").css("display", "none");
                        $("#btn_gender").text(currentSelectGenTxt);
                        Base.reloadChangeGen();
                    },
                    error: function (err1, err2, errMsg) {
                    }
                });
            })
        }

        // 스크롤 데이터 수집 관련 함수 init - add by HJH (190625)
        Base.setHisScrollingData();

        // VIP 취소 철회
        $('.btn-reactivate').on('click', function () {
            var place = $(this).data('place');
            var free = $(this).data('free');

            $.ajax({
                url: LANG_PREFIX + '/mypage/ajax_reactivate_vip',
                type: 'POST',
                dataType: 'json',
                data: {
                    place: place,
                    free: free
                },
                success: function (data) {
                    if (data.code == 200) {
                        if (SITE_TYPE == 'F') {
                            $('.female_vip_reactivate_wrap').addClass('hidden');
                            $('.female_vip_reactivate_success').removeClass('hidden');
                        } else {
                            $('.vip-reactivate').addClass('hidden');
                            $('.vip-reactivated').removeClass('hidden');
                            $('.vip-free-success').removeClass('hidden');
                            $('.vip-free').addClass('hidden');
                        }
                    } else {
                        alert(data.message + ' (code: ' + data.code + ')');
                    }
                }
            });
        });

        // 성별 선택 modal close
        $("#gender_select").on('hide.bs.modal', function () {
            $.ajax({
                url: LANG_PREFIX + '/auth/close_gender_modal',
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    // if (data.code == 200) {
                    // }
                }
            });
        });
    },
    /**
     * 성별 선택 modal에서 선택한 값 설정
     * @param selectGen
     */
    setUserGen: function(selectGen) {
        $.ajax({
            url: LANG_PREFIX + '/auth/selected_gender',
            type: 'post',
            dataType: 'text',
            data: {
                'gender_code': selectGen
            },
            success: function () {
                location.reload();
            },
            error: function (err1, err2, errMsg) {
            }
        });
    },
    closeVipReactNoti: function (prefix, react_type) {
        // 자동 연장 재개 배너 닫은 횟수 저장 - 쿠키 방식으로 기획 변경 #2456
        // $.ajax({
        //     url: '/mypage/ajaxReactivationNoticeAddCount'
        // });

        // 자동 연장 결제 재시작 배너 로그 - 닫은 횟수
        $.ajax({
            method: 'POST',
            url: '/mypage/ajaxAddReactivationStatsCount',
            data: {type: 'banner_close_cnt', react_type: react_type}
        });

        // 자동 연장 재개 배너 하루 동안 보지 않기
        setCookie(prefix + 'reactivation_banner_display', 'none', 1);

        $('.section_vip_restart_wrap').hide();
        $('.skip__bnr').hide();
        $('#glo_wrapper').removeClass('use__ship__bnr');
    },
    closeFamilySafeInfo: function (prefix) {
        // Family Safe Info 하루 동안 보지 않기
        setCookie(prefix + 'family_safe_info_display', 'none', 1);

        $('.family__safe__info').hide();
    },
    changeSignInForm: function() {
        $("#sns_login_fieldset").css("display", "none");
        $("#login_fieldset").css("display", "");
        $("#with_email_sign_in").val('Y');
        $("#with_email_sign_up").val('Y');
    },
    changeSignUpForm: function() {
        $("#sns_reg_fieldset").css("display", "none");
        $("#reg_fieldset").css("display", "");
        $("#with_email_sign_in").val('Y');
        $("#with_email_sign_up").val('Y');
    },
    moveToTerms:function() {
        location.href = LANG_PREFIX + '/help/access_terms';
    },
    setHisScrollingData: function() {
        // 스크롤데이터 수집 관련 함수
        // 로컬 히스토리에 저장하지 못한 scroll tracking 데이터가 존재하면 보내도록 함.
        // add by HJH (190625)
        var tr_idx = (localStorage["tr_idx"]) ? localStorage["tr_idx"] : '';
        var message = (localStorage["message"]) ? JSON.parse(localStorage["message"]) : [];
        var event = (localStorage["event"]) ? JSON.parse(localStorage["event"]) : [];
        var toon_idx = (localStorage["toon_idx"]) ? localStorage["toon_idx"] : '';
        var turn_order = (localStorage["turn_order"]) ? localStorage["turn_order"] : '';
        var scroll_type = (localStorage["scroll_type"]) ? JSON.parse(localStorage["scroll_type"]) : [];
        var reg_timestamp = (localStorage["reg_timestamp"]) ? JSON.parse(localStorage["reg_timestamp"]) : [];
        var isSameCnt = false;

        if (message.length == event.length && scroll_type.length == reg_timestamp.length && event.length == scroll_type.length)
        {
            isSameCnt = true;
        }

        localStorage.removeItem('tr_idx');
        localStorage.removeItem('message');
        localStorage.removeItem('event');
        localStorage.removeItem('toon_idx');
        localStorage.removeItem('turn_order');
        localStorage.removeItem('scroll_type');
        localStorage.removeItem('reg_timestamp');

        if (message.length > 0 && isSameCnt) {
            $.ajax({
                type: 'POST',
                url: LANG_PREFIX + "/webtoon/tr_dt",
                dataType: 'text',
                data: {
                    'tr_i': tr_idx,
                    'ms': message,
                    'ev': event,
                    't_i': toon_idx,
                    't_o': turn_order,
                    'd_t': 'pc',
                    's_t': scroll_type,
                    'r_t': reg_timestamp
                },
                success: function () {
                }
            });
        }
    },
    reloadChangeGen: function() {
        // 선택한 성별이 기존과 다르면 reload()
        var currentSelectGen = $("input:radio[name='gender']:checked").val();
        var beforeSelectGen = $('.gender_popup_text').data('sgen');

        if (beforeSelectGen !== currentSelectGen) {
            setCookie('setMyMenu', 'Y', 1);
            location.reload();
        }
    },

    shareFacebook: function(sUrl) {
        sUrl = encodeURIComponent(sUrl) + '/t/F';
        if (Base.shareSns(sUrl)){
            window.open('http://www.facebook.com/sharer/sharer.php?u=' + sUrl, 'facebook');
        }
    },

    shareTwitter: function(sText, sUrl)
    {
        sUrl = encodeURIComponent(sUrl)+'/t/T';
        if(Base.shareSns(sUrl)) {
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(sText) + '&url=' + sUrl, 'twitter');
        }
    },

    shareSns: function(sUrl)
    {
        var bResult = true;
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/click/outLink",
            data: {
                'url' : sUrl
            },
            dataType: 'json',
            async: false,
            success: function (aRst) {
                if (parseInt(aRst.code) !== 200) {
                    alert(aRst.msg);
                    bResult = false
                } else {
                    if (aRst.msg !== '') {
                        alert(aRst.msg);
                    }
                }
            },
            error: function () {
                bResult = false
            }
        });

        return bResult;
    },
    /**
     * 열린 모달창 닫기
     */
    modal_hide: function () {
        var sectionSign01Eml = $('.section_sign01');
        var popupList = [];
        popupList[0] = 'modal-login';
        popupList[1] = 'register';
        popupList[3] = 'modal-adult';
        popupList[4] = 'certify';
        popupList[5] = 'vip_check';
        popupList[6] = 'same_email_modal';
        popupList[7] = 'modal-sign';
        popupList[8] = 'modal_yahoo_register';


        // 모달이 있으면 제거해보자.
        if ($("#modal-login").hasClass('in') === false && sectionSign01Eml.hasClass('active') === true) {
            sectionSign01Eml.removeClass('active');
        }

        popupList.forEach(function (id) {
            var eml = $('#' + id);
            eml.on('hide.bs.modal', function () {
                $('body').css('overflow', '');
            });

            eml.on('show.bs.modal', function () {
                $('body').css('overflow', 'hidden');
            });

            if (eml.hasClass('in') === true) {
                eml.modal('hide');
            }
        });
    },
    popup: function (id, type, url, direction) {
        var bExistSameId = false;
        var isOnlySignInPop = (id === "modal-login-header");
        var loginChkHis = getCookie('GTOOMICSlogin_chk_his');
        var idEml = $('#' + id);
        var modalSignEml = $('#modal-sign'); // 로그인, 가입 통합 레이어

        if ($("#reg_form_wrap").css("display") == "none") {
            $("#section_email_check").css("display", "none");
            $("#reg_form_wrap").css("display", "")
        }

        if (isOnlySignInPop) {
            if (loginChkHis == 'Y') {
                $("#with_email_sign_in").val('Y');
                $("#with_email_sign_up").val('Y');
            }
            id = "modal-login";
        }
        Base.modal_hide(); // 열린 모달 닫기

        if (url !== undefined) {
            if (id === 'modal-adult' || id === 'adult_auth') {
                idEml.find('input:hidden[id="adult_auth_url"]').prop('value', url);
            } else {
                $('input:hidden[id="return"]').prop('value', url);
            }
        }

        if (direction !== undefined) {
            $('input:hidden[id="direction"]').prop('value', direction);
        }

        if (id === 'modal-login' || id === 'register') {
            var remove_class = 'register';
            var add_class = 'login';
            var title = lang.base_4;

            if (type !== undefined) {
                switch (type) {
                    case 'login':
                        remove_class = 'register';
                        add_class = 'login';
                        title = lang.base_4;
                        Base.t_call('t_login');
                        break;
                    case 'register':
                        remove_class = 'login';
                        add_class = 'register';
                        title = lang.base_5;
                        Base.t_call('t_register');
                        break;
                    case 'sns-register':
                        remove_class = 'login';
                        add_class = 'register';
                        title = lang.base_5;
                        $.ajax({
                            type: "POST",
                            url: LANG_PREFIX + "/auth/get_user_by_email",
                            dataType: 'json',
                            async: false,
                            success: function (aRst) {
                                if (aRst.code === 'Y') {
                                    if (aRst.list.length > 0) {
                                        layerRegister.setSignupCheckLayer(aRst.user_id, aRst.list);
                                        bExistSameId = true;
                                    }
                                }
                            }
                        });
                        Base.t_call('t_register');
                        break;
                    default:
                        remove_class = 'register';
                        add_class = 'login';
                        title = lang.base_4;
                        Base.t_call('t_register');
                }
            }

            $('#modal-login-' + remove_class).removeClass('active');
            $('#' + remove_class).removeClass('active');
            $('#modal-login-' + add_class).addClass('active');
            $('#' + add_class).addClass('active');
            $('#modal-text').text(title);

            if (add_class === 'login' && $("#user_id").val() !== "") {
                setTimeout(function () {
                    $("#user_pw").focus();
                }, 500);
            }
        }

        if (!bExistSameId) {
            // 성인 인증 설정일 경우 admin 세팅을 가져옵니다.
            if (id === 'modal-adult' || id === 'adult_auth') {
                var redirect = location.href;
                if (url !== undefined && url.length > 0) {
                    redirect = url;
                }

                Base.popupAuthRedirect('tw_auth', redirect);
            } else {
                if (id === 'tw_auth') {
                    location.href = LANG_PREFIX + '/age_verification/?redirect=' + location.pathname;
                } else {
                    if (id === "modal-login" || id === "register") {
                        var sEmailParam = getUrlParam(url, "email");
                        var joinUserId = modalSignEml.find('#join_user_id').val();
                        if (!sEmailParam && !isOnlySignInPop) {
                            if (loginChkHis === "Y") {
                                $("#with_email_sign_in").val('Y');
                                $("#with_email_sign_up").val('Y');
                                id = "modal-login";
                            } else {
                                id = "register";
                            }
                        }

                        Base.clear_sign_form(id);
                        if ($('#site_type').val() == 'F') {
                            Base.sortSnsIconFmale();
                        } else {
                            Base.sortSnsIcon();
                        }

                        modalSignEml.modal();
                        if (sEmailParam) {
                            modalSignEml.find("#user_id").val(sEmailParam);
                            modalSignEml.find("#user_pw").focus();
                        } else if (type === 'register') { // 가입창을 바로 출력 하는경우
                            Base.clear_sign_form('register');
                            if (joinUserId.length > 0) { // 이전에 입력한 값이 있는 경우
                                modalSignEml.find("#join_user_id").val(joinUserId);
                            }
                        }
                    } else {
                        idEml.modal();
                    }
                }
            }
        }
    },

    /*
    언어 설정에 따라 SNS 아이콘이 다르게 배치되도록 함
    add by HJH (190425)
     */
    sortSnsIcon: function () {
        var arrSnsHtml = [];
        var htmlSnsIcon = "";
        var hrefPrefix = $("#href_prefix").val();
        var uriString = $("#return").val();
        var iconCount = 0;
        var isNewLine = false;

        arrSnsHtml['facebook'] = '<span>';
        arrSnsHtml['facebook'] += '<a href=\"'+hrefPrefix+'/auth/facebook/?return='+uriString+'\">';
        arrSnsHtml['facebook'] += '<img src="/assets/mobile/img/global/sns_facebook.png" alt="facebook">';
        arrSnsHtml['facebook'] += '</a>';
        arrSnsHtml['facebook'] += '</span>';

        arrSnsHtml['google'] = '<span>';
        arrSnsHtml['google'] += '<a href="'+hrefPrefix+'/auth/google/?return='+uriString+'">';
        arrSnsHtml['google'] += '<img src="/assets/mobile/img/global/sns_google.png" alt="google">';
        arrSnsHtml['google'] += '</a>';
        arrSnsHtml['google'] += '</span>';

        arrSnsHtml['apple'] = '';
        var apple_logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130" style="width: 67px; height: 67px; vertical-align: middle;"><defs><style>.cls-1{fill:#fff;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><circle cx="65" cy="65" r="65"/><path class="cls-1" d="M80.29,62.77c-.07-7.08,5.79-10.53,6.06-10.69a13.05,13.05,0,0,0-10.27-5.55c-4.32-.45-8.51,2.59-10.72,2.59s-5.63-2.54-9.28-2.47a13.66,13.66,0,0,0-11.51,7c-5,8.62-1.27,21.28,3.5,28.24,2.38,3.41,5.17,7.22,8.82,7.09s4.9-2.28,9.21-2.28,5.52,2.28,9.24,2.19,6.25-3.43,8.55-6.87a28.3,28.3,0,0,0,3.91-8,12.31,12.31,0,0,1-7.51-11.32ZM73.26,42a12.5,12.5,0,0,0,2.86-9,12.75,12.75,0,0,0-8.25,4.27c-1.77,2.07-3.35,5.46-2.94,8.65,3.12.23,6.32-1.58,8.33-3.94Z"/></g></g></svg>';
        if(typeof  window.webkit != 'undefined' && typeof  window.webkit.messageHandlers.notifyAppleSignIn != 'undefined') {
            arrSnsHtml['apple'] += '<span>';
            arrSnsHtml['apple'] += '<a href="#" onclick="apps.setCookie(\'login_attempt\', \'Y\', 1); window.webkit.messageHandlers.notifyAppleSignIn.postMessage(\'\');">';
            arrSnsHtml['apple'] += apple_logo;
            arrSnsHtml['apple'] += '</a>';
            arrSnsHtml['apple'] += '</span>';
        } else {
            if($('meta[name="appleid-signin-client-id"]').length > 0){
                arrSnsHtml['apple'] += '<span>';
                arrSnsHtml['apple'] += '<a href="' + hrefPrefix + '/auth/apple?return=' + uriString + '">';
                arrSnsHtml['apple'] += apple_logo;
                arrSnsHtml['apple'] += '</a>';
                arrSnsHtml['apple'] += '</span>';
            }
        }

        arrSnsHtml['yahoo'] = '<span>';
        arrSnsHtml['yahoo'] += '<a href="'+hrefPrefix+'/auth/yahoo/?return='+uriString+'">';
        arrSnsHtml['yahoo'] += '<img src="/assets/mobile/img/global/sns_yahoo.png" alt="yahoo">';
        arrSnsHtml['yahoo'] += '</a>';
        arrSnsHtml['yahoo'] += '</span>';

        arrSnsHtml['line'] = '<span>';
        arrSnsHtml['line'] += '<a href="'+hrefPrefix+'/auth/line/?return='+uriString+'">';
        arrSnsHtml['line'] += '<img src="/assets/mobile/img/global/sns_line.png" alt="line">';
        arrSnsHtml['line'] += '</a>';
        arrSnsHtml['line'] += '</span>';

        arrSnsHtml['twitter'] = '<span>';
        arrSnsHtml['twitter'] += '<a href="'+hrefPrefix+'/auth/twitter/?return='+uriString+'">';
        arrSnsHtml['twitter'] += '<img src="/assets/mobile/img/global/sns_twitter.png" alt="twitter">';
        arrSnsHtml['twitter'] += '</a>';
        arrSnsHtml['twitter'] += '</span>';

        arrSnsHtml['weibo'] = '<span>';
        arrSnsHtml['weibo'] += '<a href="/auth/weibo/?return=' + uriString + '">';
        arrSnsHtml['weibo'] += '<img src="/assets/mobile/img/global/sns_weibo.png" alt="weibo">';
        arrSnsHtml['weibo'] += '</a>';
        arrSnsHtml['weibo'] += '</span>';

        arrSnsHtml['wechat'] = '<span>';
        arrSnsHtml['wechat'] += '<a href="/auth/wechat/?return=' + uriString + '">';
        arrSnsHtml['wechat'] += '<img src="/assets/mobile/img/global/sns_wechat.png" alt="wechat">';
        arrSnsHtml['wechat'] += '</a>';
        arrSnsHtml['wechat'] += '</span>';

        $.each(arrSnsHtml, function(index, item){
            if(item != '') iconCount++;
        });
        if(iconCount >= 6) isNewLine = true;
        if (location.hostname.split('.')[1] === 'bobolika') {
            htmlSnsIcon = arrSnsHtml['weibo'];
        } else if (location.hostname.split('.')[0] === 'comic' || location.hostname.split('.')[0] === 'comics') {
            htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['line'] + (isNewLine ? '' : '<br>' ) + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
        } else {
            if (hrefPrefix === "/en") {
                htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + (isNewLine ? '' : '<br>' ) + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
            } else if (hrefPrefix === "/sc") {
                htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + (isNewLine ? '' : '<br>' ) + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
            } else if (hrefPrefix === "/tc") {
                htmlSnsIcon = arrSnsHtml['facebook'] + arrSnsHtml['google'] + arrSnsHtml['line'] + arrSnsHtml['twitter'] + (isNewLine ? '' : '<br>' ) + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
            } else {
                htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + (isNewLine ? '' : '<br>' ) + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
            }
        }

        $("#login .login_sns_icon_wrap").html(htmlSnsIcon);
        $("#register .reg_sns_icon_wrap").html(htmlSnsIcon);
    },

    /**
     * 여성향 로그인 SNS 아이콘
     */
    sortSnsIconFmale: function () {
        var arrSnsHtml = [];
        var htmlSnsIcon = "";
        var hrefPrefix = $("#href_prefix").val();
        var uriString = $("#return").val();
        var iconCount = 0;

        arrSnsHtml['facebook'] = '<a href=\"'+hrefPrefix+'/auth/facebook/?return='+uriString+'\">';
        arrSnsHtml['facebook'] += '<span class="sp-icons sp-icons__img_login_profile_fb">facebook</span>';
        arrSnsHtml['facebook'] += '</a>';

        arrSnsHtml['google'] = '<a href="'+hrefPrefix+'/auth/google/?return='+uriString+'">';
        arrSnsHtml['google'] += '<span class="sp-icons sp-icons__img_login_profile_gg">google</span>';
        arrSnsHtml['google'] += '</a>';

        if (typeof  window.webkit != 'undefined' && typeof  window.webkit.messageHandlers.notifyAppleSignIn != 'undefined') {
            arrSnsHtml['apple'] = '<a href="#" onclick="apps.setCookie(\'login_attempt\', \'Y\', 1); window.webkit.messageHandlers.notifyAppleSignIn.postMessage(\'\');">';
            arrSnsHtml['apple'] += '<span class="sp-icons sp-icons__img_login_profile_ap">apple</span>';
            arrSnsHtml['apple'] += '</a>';
        } else {
            if ($('meta[name="appleid-signin-client-id"]').length > 0) {
                arrSnsHtml['apple'] = '<a href="' + hrefPrefix + '/auth/apple?return=' + uriString + '">';
                arrSnsHtml['apple'] += '<span class="sp-icons sp-icons__img_login_profile_ap">apple</span>';
                arrSnsHtml['apple'] += '</a>';
            }
        }

        arrSnsHtml['yahoo'] = '<a href="'+hrefPrefix+'/auth/yahoo/?return='+uriString+'">';
        arrSnsHtml['yahoo'] += '<span class="sp-icons sp-icons__img_login_profile_yh">yahoo</span>';
        arrSnsHtml['yahoo'] += '</a>';

        arrSnsHtml['line'] = '<a href="'+hrefPrefix+'/auth/line/?return='+uriString+'">';
        arrSnsHtml['line'] += '<span class="sp-icons sp-icons__img_login_profile_li">line</span>';
        arrSnsHtml['line'] += '</a>';

        arrSnsHtml['twitter'] = '<a href="'+hrefPrefix+'/auth/twitter/?return='+uriString+'">';
        arrSnsHtml['twitter'] += '<span class="sp-icons sp-icons__img_login_profile_tw">twiter</span>';
        arrSnsHtml['twitter'] += '</a>';

        arrSnsHtml['weibo'] = '<a href="/auth/weibo/?return=' + uriString + '">';
        arrSnsHtml['weibo'] += '<img src="/assets/mobile/img/global/sns_weibo.png" alt="weibo">';
        arrSnsHtml['weibo'] += '</a>';

        arrSnsHtml['wechat'] = '<a href="/auth/wechat/?return=' + uriString + '">';
        arrSnsHtml['wechat'] += '<img src="/assets/mobile/img/global/sns_wechat.png" alt="wechat">';
        arrSnsHtml['wechat'] += '</a>';

        $.each(arrSnsHtml, function(index, item) {
            if(item != '') iconCount++;
        });

        if (hrefPrefix === "/en") {
            htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
        } else if (hrefPrefix === "/sc") {
            htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
        } else if (hrefPrefix === "/tc") {
            htmlSnsIcon = arrSnsHtml['facebook'] + arrSnsHtml['google'] + arrSnsHtml['line'] + arrSnsHtml['twitter'] + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
        } else {
            htmlSnsIcon = arrSnsHtml['google'] + arrSnsHtml['facebook'] + arrSnsHtml['twitter'] + arrSnsHtml['line'] + arrSnsHtml['yahoo'] + arrSnsHtml['apple'];
        }

        $("#login .login_sns_icon_wrap").html(htmlSnsIcon);
        $("#register .reg_sns_icon_wrap").html(htmlSnsIcon);
    },

    /*
    인증 후 이동해야할 경우 사용
     */
    popupAuthRedirect: function (id, redirect) {
        var authRedirectEml = $('#auth_redirect');
        Base.modal_hide(); // 열린 모달 닫기

        // 인증팝업에 redirect 가 있다면
        if (redirect.length > 0 && authRedirectEml.length > 0 && authRedirectEml.val().length === 0) {
            authRedirectEml.val(redirect);
        }

        $('#' + id).modal();
    },

    reset_facebook: function () {
        var reset_id = ($('#reset_id').val());

        if (!reset_id) {
            alert(lang.base_1);
            return false;
        }

        // 비밀번호 설정중 멘트

        $.ajax({
            url: LANG_PREFIX + '/auth/reset_facebook',
            type: 'post',
            dataType: 'json',
            data: {
                'user_id': reset_id
            },
            success: function (aRst) {
                if (aRst.code !== 200) {
                    alert(aRst.ret);
                    return;
                }

                // 멘트 종료

                alert(lang.base_6);
                location.href = LANG_PREFIX + '/';
            },
            error: function (err1, err2, errMsg) {
            }
        });
    },

    popupOpen: function (url, width, height) {
        var sst = window.open(url, 'popwin', 'top=' + ((screen.availHeight - height) / 2 - 40) + ', left=' + (screen.availWidth - width) / 2 + ', width=' + width + ', height=' + height + ', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');
        if (sst) {
            sst.focus();
        }
        if ($("#close_btn").length != 0) {
            $("#close_btn").click();
        }
    },

    formReset: function (id) {
        $("#" + id).each(function() {
            this.reset();
        });
    },

    setDisplay: function (display, return_val) {
        // Yes 선택 시 년도 셀렉트 박스가 있을 때
        if (display == 'A' && $('#birthYear').length > 0) {
            const birthYear = $('#birthYear').val();
            const birthMonth = $('#birthMonth').val();
            const birthDay = $('#birthDay').val();
            const thisYear = new Date().getFullYear();

            if (birthYear == '' || birthMonth == '' || birthDay == '') {
                alert(lang.age_verification_1);
                return false;
            }

            // 18세 미만
            if (birthYear >= thisYear - 17) {
                alert(lang.age_verification_2);
                return false;
            }
        }

        if ($('#auth_redirect').length > 0 && $('#auth_redirect').val().length > 0 && display == 'Y') {
            return_val = $('#auth_redirect').val();
        }
        location.href = LANG_PREFIX + '/index/set_display/?display=' + display + '&return=' + return_val;
    },

    setFamilyMode: function (familymode, return_val) {
        if ($('#auth_redirect').length > 0 && $('#auth_redirect').val().length>0 && familymode == 'Y') {
            return_val = $('#auth_redirect').val();
        }
        location.href = LANG_PREFIX + '/index/set_family_mode/?family_mode=' + familymode + '&return=' + return_val;
    },

    setAuthDisplay: function (display) {
        $.ajax({
            url: LANG_PREFIX + '/index/set_display',
            type: 'get',
            dataType: 'json',
            data: {
                'display': display
            },
            success: function (aRst) {
            },
            error: function (err1, err2, errMsg) {
            }
        });
    },

    get_last_view_contents: function (toon_idx) {
        $('#last_view_list').empty();
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/webtoon/get_last_popup_data",
            dataType: 'html',
            data: {
                'toon_idx': toon_idx
            },
            success: function (aRst) {
                if (aRst == 'false') {
                    Base.popup('modal-last');
                } else {
                    $('#last_view_list').html(aRst);
                    Base.popup('modal-ep');
                }
            }
        });
    },
    closeTooltip: function (cName) {

        if (cName == 'tool_tip_top' || cName == 'tool_tip_right' ) {
            var tool_tip_cookie =  getCookie('tooltip');

            if (!tool_tip_cookie) {
                var tool_tip_obj = new Object();

                tool_tip_obj.name = 'tooltip';
                tool_tip_obj.cnt = 1;

                setCookie('tooltip', JSON.stringify(tool_tip_obj) , 30);
            } else if (tool_tip_cookie !== false) {
                var cookie = JSON.parse(tool_tip_cookie);
                var cnt  = cookie.cnt+1;
                var name  = cookie.name;

                var tool_tip_obj = new Object();
                tool_tip_obj.name = name;
                tool_tip_obj.cnt = cnt;
                setCookie('tooltip', JSON.stringify(tool_tip_obj) , 30);
            }
        }
        if (cName == 'tool_tip_top' || cName == 'tool_tip_right') {
            cName = 'tool_tip_top';
            $('#tool_tip_right').hide();
            $('#tool_tip_top').hide();
        }
        setCookie(cName, 'Y', 1);
        $('#' + cName).hide();
    },

    // 앞의 텍스트박스에 특정자리 글씨가 써지면 자동으로 다음 칸으로 커서가 넘어간다.
    nextGo: function (e, value, object) {
        if (e.value.length>=value) {
            $("#"+object).focus();
        }
    },

    // 휴대폰 번호 체크
    validatePhone : function (sPhone, sMsg) {

        var regexObj = /^(?:(010-\d{4})|(01[1|6|7|8|9]-\d{3,4}))-(\d{4})$/;

        if (!regexObj.test(sPhone)){
            alert(sMsg);
            return false;
        }

        return true;
    },
    FreeInAppcoinPopupSetValue: function(val)
    {
        $.ajax({
            url: LANG_PREFIX + '/webtoon/set_free_in_app_coin_popup_yn/set_value/'+val,
            type: 'get',
            async : false
        });
    },
    coinPopupSetValue: function(val)
    {
        $.ajax({
            url: LANG_PREFIX + '/webtoon/set_coin_popup_yn/set_value/'+val,
            type: 'get',
            async : false
        });
    },
    crossCoinPopupSetValue: function(val) {
        setCookie('cross_popup_hidden_yn', 'Y');
    },
    setUserExt: function(key,val)
    {
        $.ajax({
            url: LANG_PREFIX + '/mypage/set_user_ext/set_field/'+key+'/set_value/'+val,
            type: 'get'
        });
    },

    coinPopupGetValue: function()
    {
        var coin_value;
        $.ajax({
            url: LANG_PREFIX + '/webtoon/get_coin_popup_yn',
            type: 'get',
            async : false,
            cache : false,
            success: function (val) {
                coin_value = val;
            }
        });
        return coin_value;
    },

    crossCoinPopupGetValue: function () {
        return (getCookie('cross_popup_hidden_yn') == 'Y') ? 'Y' : 'N';
    },

    FreeInAppCoinPopupGetValue: function()
    {
        var coin_value;
        $.ajax({
            url: LANG_PREFIX + '/webtoon/get_free_in_app_coin_popup_yn',
            type: 'get',
            async : false,
            cache : false,
            success: function (val) {
                coin_value = val;
            }
        });
        return coin_value;
    },

    /**
     * 성인인증.. 결과에 상관없이 성인 메뉴 노출
     */
    set_user_auth : function(useridx, url)
    {
        // Yes 선택 시 년도 셀렉트 박스가 있을 때
        if ($('#birthYear').length > 0) {
            var birthYear = $('#birthYear').val();
            var birthMonth = $('#birthMonth').val();
            var birthDay = $('#birthDay').val();
            var thisYear = new Date().getFullYear();

            if (birthYear == '' || birthMonth == '' || birthDay == '') {
                alert(lang.age_verification_1);
                return false;
            }

            // 18세 미만
            if (birthYear >= thisYear - 17) {
                alert(lang.age_verification_2);
                return false;
            }
        }

        $.ajax({
                type: "POST",
                url: LANG_PREFIX + "/auth/set_user_auth",
                dataType: 'json',
                async: false,
                data: { 'user_idx' : useridx },
                success: function(aRst) {

                }
            });
        if(url=='') url='/';

        Base.setDisplay('A',url);
    },

    /**
     * Family Safe 안내 메시지에서의 성인인증
     */
    set_user_auth_family_info : function(useridx, url)
    {
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/set_user_auth",
            dataType: 'json',
            async: false,
            data: { 'user_idx' : useridx },
            success: function(aRst) {

            }
        });
        if(url=='') url='/';

        Base.setDisplay('A',url);
    },

    t_call: function (url) {
        if (url !== '') {

            $('#t_frame').attr('src', LANG_PREFIX + "/index/" + url);

            /*
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + "/index/" + url,
                dataType: 'html',
                async: false,
                success: function (aRst) {
                },
                error: function (aRst) {
                }
            });
            */
        }
    },

    clear_sign_form: function (sign_type) {
        var with_email_sign_in = $("#with_email_sign_in").val();
        var with_email_sign_up =  $("#with_email_sign_up").val();

        if (sign_type == "modal-login") {
            $("#tab_sign_in").addClass("on active");
            $("#tab_sign_up").removeClass("on active");

            $("#login").removeClass("d_none display-no");
            $("#register").addClass("d_none display-no");

            if ($("#error_div_register").hasClass("hide") === false) {
                $("#error_div_register").addClass("hide");
            }

            $("#register #join_user_id").val("");
            $("#register #join_user_pw").val("");
            $("#register .check__line").css("display", "none");
            $("#modal-sign #incorrectly_email").val("");

            if (with_email_sign_in == "N") {
                $("#sns_login_fieldset").css("display", "");
                $("#login_fieldset").css("display", "none");
            } else {
                $("#sns_login_fieldset").css("display", "none");
                $("#login_fieldset").css("display", "");
            }
        } else if(sign_type == "register") {
            $("#tab_sign_up").addClass("on active");
            $("#tab_sign_in").removeClass("on active");

            $("#register").removeClass("d_none display-no");
            $("#login").addClass("d_none display-no");

            if ($("#error_div_login").hasClass("hide") === false) {
                $("#error_div_login").addClass("hide");
            }

            // $("#login #user_id").val("");
            $("#login #user_pw").val("");

            if (with_email_sign_up == "N") {
                $("#sns_reg_fieldset").css("display", "");
                $("#reg_fieldset").css("display", "none");
            } else {
                $("#sns_reg_fieldset").css("display", "none");
                $("#reg_fieldset").css("display", "");
            }
        }
    },

    /**
     * 인증 메일 발송 안내 폼에서 돌아가기 버튼 누를 시
     */
    returnSignUpView: function () {
        $("#section_email_check").css("display", "none");
        $("#reg_form_wrap").css("display", "");
    },

    end: function () {
    },

    preload: function () {
        var images = new Array();

        for (var i = 0; i < arguments.length; i++) {
            if (typeof(arguments[i]) == "undefined") {
                continue;
            }

            images[i] = new Image();
            images[i].src = arguments[i];
        }
    },

    /**
     * 현재 주소에 가입 완료 segment가 존재하면 삭제
     */
    deleteRegSeg: function () {
        let renewURL = location.href;
        renewURL = renewURL.replace('/registration/ok', '');

        //페이지 갱신
        history.pushState(null, null, renewURL);
    },

    closeGiftCoin: function () {
        $.ajax({
            method: 'POST',
            url: '/index/close_gift_coin',
            data: {type: 'close'}
        });

        $('#gift_bonus_coin').modal('hide');
    },

    /**
     * [works #17849] 장애 보상 레이어 팝업
     * 장애 보상 팝업 닫기
     */
    closeGiftTime: function () {
        $.ajax({
            method: 'POST',
            url: '/index/close_gift_time',
            data: {type: 'close'}
        });

        $('#service_error').modal('hide');
    }
};

var layerLogin = {
    init: function () {
        this.settingValidate();
        this.settingButtonLoginValidate();
        this.procSettingUserId();

        var savedId = $("#login #user_id").val(); // 쿠키에 저장된 사용자 아이디 - add by HJH (190509)
        var emaildomains = [];

        // 로그인 레이어
        /*
        $("#toggle-login").click(function(e){

            $(".layer-mymenu").removeClass("active");
            $(".section_sign01").toggleClass("active");

            if ($(".section_sign01").hasClass("active") === true) {
                Base.t_call('t_login');
            }

            return false;
        });
        */

        $("#layer-close").click(function(e){
            $(".section_sign01").removeClass("active");
            return false;
        });

        $("#toggle-mymenu").click(function(e){
            $(".section_sign01").removeClass("active");

            $(this).toggleClass("active");
            $(".layer-mymenu").toggleClass("active");

            if ($(this).hasClass("active") === true){
                $("h5.my").addClass('on');
            } else {
                $("h5.my").removeClass('on');
                //Base.reloadChangeGen();
            }

            if ($('.btn-reactivate:visible').length > 0) {
                // 자동 연장 결제 재시작 배너 로그 - 재시작 버튼 표시 횟수
                var react_type = $(".btn-reactivate").attr('data-free') == "1"? "1" : "0";

                $.ajax({
                    method: 'POST',
                    url: '/mypage/ajaxAddReactivationStatsCount',
                    data: {type: 'menu_button_view_cnt', react_type: react_type}
                });
            }

            return false;
        });

        $('#keep_cookie').change(function () {
            if ($(this).is(":checked")) {
                $(this).val("1");
            } else {
                $(this).val("0");
            }
        });

        $('#modal-sign').on('show.bs.modal', function (e) {
            $("#register #join_user_id").val("");
            $("#register #join_user_pw").val("");
            $("#register .check__line").css("display", "none");
            $("#modal-sign #incorrectly_email").val("");
            layerRegister.setErrorDiv('', 'hide');
            if (savedId != "") {
                $("#login #user_id").val(savedId);
            } else {
                $("#login #user_id").val("");
            }

            $("#login #user_pw").val("");
        });

        // $('#modal-sign').on('show.bs.modal', function (e) {
        //     alert("modal show!!");
        // })

        // vip 멤버쉽 계정 팝업 시 배경 스크롤 방지 - add by HJH (190430)
        $('#vip_check').on('hide.bs.modal', function (e) {
            $('body').css('overflow', '');
        });
        $('#vip_check').on('show.bs.modal', function (e) {
            $('body').css('overflow', 'hidden');
        });

        // vip 멤버쉽 계정 팝업 시 배경 스크롤 방지 - add by HJH (190430)
        $('#same_email_modal').on('hide.bs.modal', function (e) {
            $('body').css('overflow', '');
        });
        $('#same_email_modal').on('show.bs.modal', function (e) {
            $('body').css('overflow', 'hidden');
        });
    },
    /**
     * 에러 메세지 div처리
     * sErrMsg : 에러 메세지
     * sMode : 'show', 'hide'
     * type : '1', '2'
     */
    setErrorDiv: function (sErrMsg, sMode, type) {
        var $oErrorDiv = $('#error_div_login'+type),
            bHasHideClass = $oErrorDiv.hasClass('hide');

        if (sMode === 'show') {
            if (bHasHideClass === true) {
                $oErrorDiv.removeClass('hide');
            }
            $oErrorDiv.html(sErrMsg);
        } else if (sMode === 'hide') {
            if (bHasHideClass === false) {
                $oErrorDiv.addClass('hide');
            }
        }
    },
    settingValidate: function () {
        $("#login_frm").validate({
            onkeyup: false,
            onclick: false,
            onfocusout: false,
            rules: {
                user_id: {required: true, email: true},
                user_pw: {required: true, minlength: 4, maxlength: 20}
            },
            messages: {
                user_id: {
                    required: lang.base_7,
                    email: lang.base_8
                },
                user_pw: {
                    required: lang.base_9,
                    minlength: $.validator.format(lang.base_10),
                    maxlength: $.validator.format(lang.base_11)
                }
            },
            submitHandler: function (form) {
                layerLogin.loginAction('1');
            },
            invalidHandler: function (form, validator) {
                // 검실 실패 리스트
                var aErrorList = validator.errorList;
                // 모든 에러가 아닌 하나의 에러만 출력
                layerLogin.setErrorDiv(aErrorList[0]['message'], 'show', 1);
                aErrorList[0]['element'].focus();
            },
            errorPlacement: function (error, element) {

                //
            }
        });// end of validate
    },
    settingButtonLoginValidate: function () {
        $("#toggle_login_frm").validate({
            onkeyup: false,
            onclick: false,
            onfocusout: false,
            rules: {
                toggle_user_id: {required: true, email: true},
                toggle_user_pw: {required: true, minlength: 4, maxlength: 20}
            },
            messages: {
                toggle_user_id: {
                    required: lang.base_7,
                    email: lang.base_8
                },
                toggle_user_pw: {
                    required: lang.base_9,
                    minlength: $.validator.format(lang.base_10),
                    maxlength: $.validator.format(lang.base_11)
                }
            },
            submitHandler: function (form) {
                var sUserId = $('#toggle_login_field').find('#toggle_user_id').val(),
                    sUserPw = $('#toggle_login_field').find('#toggle_user_pw').val(),
                    iSaveUserId = 1, // default: 무조건 아이디 저장 - modified by HJH (190509)
                    iKeepCookie = $("input:checkbox[name='keep_toggle_cookie']:checked").val(),
                    returnUrl = $("input[name='return']").val(),
                    direction = $("input[name='direction']").val(),
                    login_chk = $('#login_chk').val(),
                    vip_chk = $('#vip_chk').val(),
                    sFinalType = '',
                    sFinalUrl = '';

                $.ajax({
                    type: "POST",
                    url: LANG_PREFIX + "/auth/layer_login",
                    dataType: 'json',
                    async: false,
                    data: {
                        'user_id': sUserId,
                        'user_pw': sUserPw,
                        'save_user_id': iSaveUserId,
                        'keep_cookie': iKeepCookie,
                        'returnUrl': returnUrl,
                        'direction': direction,
                        'login_chk': login_chk,
                        'vip_chk': vip_chk
                    },
                    success: function (aRst) {
                        if (aRst.code !== 200) {
                            layerLogin.setErrorDiv(aRst.ret, 'show','2');
                            return;
                        }

                        if(aRst.login_alert!='' && aRst.login_alert != undefined) {
                            alert(aRst.login_alert.replace(/<br>/gi,'\n'));
                        }

                        if ($("#vip_chk").val() == 'Y' && aRst.other_account != '') {
                            layerLogin.setVipCheckLayer(sUserId, 'top', "");
                            return false;
                        } else if (aRst.redirection == 'reload' || aRst.redirection == false) {
                            sFinalType = 'reload';

                        } else {
                            sFinalType = 'redirection';
                            sFinalUrl = aRst.redirection;
                        }

                        if (sFinalType == 'reload') {
                            location.reload();
                        } else {
                            location.replace(sFinalUrl);
                            if (location.hash.length > 0 && location.hash.indexOf('#') !== -1) {
                                location.reload();
                            }
                        }
                    },
                    error: function (aRst) {
                    }
                });
            },
            invalidHandler: function (form, validator) {
                // 검실 실패 리스트
                var aErrorList = validator.errorList;
                // 모든 에러가 아닌 하나의 에러만 출력
                layerLogin.setErrorDiv(aErrorList[0]['message'], 'show', 2);
                aErrorList[0]['element'].focus();
            },
            errorPlacement: function (error, element) {

                //
            }
        });// end of validate
    },
    loginAction: function () {
        var sUserId = $('#login').find('#user_id').val(),
            sUserPw = $('#login').find('#user_pw').val(),
            iSaveUserId = 1, // default: 무조건 아이디 저장 - modified by HJH (190509)
            iKeepCookie = $("input:checkbox[id='keep_cookie']:checked").val(),
            returnUrl = $('#modal-sign').find('#return').val(),
            direction = $('#modal-sign').find('#direction').val(),
            login_chk = $('#login_chk').val(),
            vip_chk = $('#vip_chk').val(),
            sFinalType = '',
            sFinalUrl = '';

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/layer_login",
            dataType: 'json',
            async: false,
            data: {
                'user_id': sUserId,
                'user_pw': sUserPw,
                'save_user_id': iSaveUserId,
                'keep_cookie': iKeepCookie,
                'returnUrl': returnUrl,
                'direction': direction,
                'login_chk': login_chk,
                'vip_chk': vip_chk
            },
            success: function (aRst) {
                if (aRst.code !== 200) {
                    if (aRst.code == 201) {
                        location.href = aRst.redirection;
                        return false;
                    } else {
                        layerLogin.setErrorDiv(aRst.ret, 'show', '1');
                        return false;
                    }
                }

                if(aRst.login_alert!='' && aRst.login_alert != undefined) {
                    alert(aRst.login_alert.replace(/<br>/gi,'\n'));
                }

                if (aRst.other_account != '' && vip_chk == 'Y') {
                    sFinalUrl = aRst.redirection;
                    layerLogin.setVipCheckLayer(sUserId, 'center', sFinalUrl);
                    return false;
                } else if (aRst.redirection == 'reload' || aRst.redirection == false) {
                    sFinalType = 'reload';

                } else {
                    sFinalType = 'redirection';
                    sFinalUrl = aRst.redirection;
                }

                if (sFinalType == 'reload') {
                    location.reload();
                } else {
                    location.replace(sFinalUrl);
                    if (location.hash.length > 0 && location.hash.indexOf('#') !== -1) {
                        location.reload();
                    }
                }
            },
            error: function (aRst) {
            }
        });
    },

    /**
     * 쿠키를 체크하여 아이디를 저장했을시 출력
     */
    procSettingUserId: function () {
        var sUid = getCookie('uId');
        if (sUid.length === 0) {
            return;
        }

        $('#login').find('#user_id').val(sUid);
        $('#login').find('#save_user_id').attr('checked', true);
    },

    /**
     * 동일 이메일의 VIP 아이디 혹은 코인 보유 아이디 체크 팝업
     */
    setVipCheckLayer: function (sUserId, layerType, redirectUrl) {
        var apiUrl = LANG_PREFIX + '/auth/vip_account_list';

        if (SITE_TYPE == 'F') {
            apiUrl = LANG_PREFIX + '/auth/fmale_vip_account_list';
        }

        $.ajax({
            type: "POST",
            url: apiUrl,
            dataType: 'text',
            data: {
                'user_id': sUserId,
                'layer_type': layerType
            },
            success: function(aRst) {
                aRst = $.parseJSON(aRst);
                if(aRst.code == 200){
                    $('#vip_check_list').html(aRst.listHtml);
                    $('.vipcheck_footer').html(aRst.footerLink);

                    var vip_check_elm = $('#vip_check');
                    var dup_check_id = vip_check_elm.find('[id=dup_check_id]');
                    dup_check_id.text(sUserId);

                    if ($("#modal-sign").css("display") == 'block') {
                        $("#modal-sign").modal('toggle');
                    }
                    Base.popup('vip_check');
                }else{
                    $('#vip_chk').val('N');
                    if (redirectUrl != "") {
                        location.href = redirectUrl;
                    } else {
                        location.reload();
                    }
                }
            }
        });

        return false;
    },

    /**
     * 로그인 유지 체크박스 이벤트 처리
     */
    keepCookie: function () {
        var $icon = $('#login_fieldset .input__info-lf .sp-icons');

        $('#keep_cookie').click();

        if ($('#keep_cookie').val() == '1') {
            $icon.removeClass('sp-icons__ico_login_keep_check_off');
            $icon.addClass('sp-icons__ico_login_keep_check_on');
        } else {
            $icon.removeClass('sp-icons__ico_login_keep_check_on');
            $icon.addClass('sp-icons__ico_login_keep_check_off');
        }
    },

    end: function () {
    }
};

/**
 * layer 회원 가입 관련
 */
var layerRegister = {
    bHasEmailCheck: false,// 이메일 체크 여부 (1회성 변수)
    init: function () {
        var user_id_elm = $('#register').find('#join_user_id');

        $('#agree').click(function () {
            if ($("#agree").prop("checked")) {
                //전체 checkbox 를 체크해준다
                $("#access_term").prop("checked", true);
                $("#private_term").prop("checked", true);
                // 전체선택 체크박스가 해제된 경우
            } else {
                //모든 checkbox 의 체크를해제시킨다.
                $("#access_term").prop("checked", false);
                $("#private_term").prop("checked", false);
            }
        });

        $('#access_term').click(function () {
            if ($(this).prop("checked") === false) {
                $("#agree").prop("checked", false);
            } else if ($("#private_term").prop("checked")) {
                $("#agree").prop("checked", true);
            }
        });

        $('#private_term').click(function () {
            if ($('#private_term').prop("checked") === false) {
                $("#agree").prop("checked", false);
            } else if ($("#access_term").prop("checked")) {
                $("#agree").prop("checked", true);
            }
        });

        user_id_elm.focus();
        user_id_elm.keyup(function () {
            $('#modal-sign').find('#incorrectly_email').val('');
            layerRegister.setErrorDiv('', 'hide');
            user_id_elm.nextAll("span").css('display', 'none');
        });
        this.defineValidMethod();
        this.settingValidate();

        var emaildomains = [];

        // 인증코드 modal 닫을 시 호출
        $('#modal_verify_code').on('hide.bs.modal', function (e) {
            layerRegister.initVerifyCode();
        });
    },
    initVerifyCode: function () {
        var user_email = $("#join_user_id").val();

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/init_email_verification_code",
            dataType: 'text',
            data: {
                'join_user_id': user_email
            },
            success: function (aRst) {

            }
        });
    },
    resendVerifyCode: function () {
        var user_email = $("#join_user_id").val();
        // var verify_code = $("#verify_code").val();

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/resend_email_verification_code",
            dataType: 'text',
            data: {
                'join_user_id': user_email
            },
            success: function (aRst) {
                aRst = $.parseJSON(aRst);
                if (aRst.code === "S200") {
                    $("#verify_error_msg").css("display", "");
                    $("#verify_error_msg").text(aRst.msg);
                } else {
                    $("#verify_error_msg").css("display", "");
                    $("#verify_error_msg").text(aRst.msg);
                }
            }
        });
    },
    verifyCodeLengthCheck: function (object) {
        if (object.value.length > object.maxLength){
            object.value = object.value.slice(0, object.maxLength);
        }
    },
    checkVerifyCode: function () {
        var user_pass = $("#join_user_pw").val();
        var user_email = $("#join_user_id").val();
        var verify_code = $("#verify_code").val();

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/email_verification_code",
            dataType: 'text',
            data: {
                'join_user_pw': user_pass,
                'join_user_id': user_email,
                'verify_code': verify_code
            },
            success: function (aRst) {
                aRst = $.parseJSON(aRst);
                if (aRst.code === 200) {
                    location.reload();
                } else {
                    $("#verify_error_msg").css("display", "");
                    $("#verify_error_msg").html(aRst.msg);
                }
            }
        });
    },
    defineValidMethod: function () {
        $.validator.addMethod("unique", function (value, element, params) {
            //console.log(value, element, params);
            var res = false;
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + "/member/uniqChk",
                dataType: 'text',
                async: false,
                data: {'sUserId': value},
                success: function (aRst) {
                    aRst = $.parseJSON(aRst);
                    if (aRst.code === 200) {
                        res = true;
                    }
                }
            });
            return res;
            return this.optional(element) || false;
        }, $.validator.format(lang.base_12));

        //validator 에 특수문자 오류를 추가
        $.validator.addMethod("alphanumeric", function(value, element) {
            return this.optional(element) || /^\w+$/i.test(value);
        }, "Letters, numbers, and underscores only please");
    },
    settingValidate: function () {
        $("#register_frm").validate({
            onkeyup: false,
            onclick: false,
            onfocusout: false,
            rules: {
                join_user_id: {required: true, email: true},
                join_user_pw: {required: true, minlength: 6, maxlength: 20,alphanumeric: true},
                access_term: {required: true},
                private_term: {required: true},
            },
            messages: {
                join_user_id: {
                    required: lang.base_7,
                    email: lang.base_8
                },
                join_user_pw: {
                    required: lang.base_9,
                    alphanumeric:lang.base_13,
                    minlength: $.validator.format(lang.base_10),
                    maxlength: $.validator.format(lang.base_11)
                },
                user_pw_chk: {
                    required: lang.base_14,
                    minlength: $.validator.format(lang.base_10),
                    maxlength: $.validator.format(lang.base_1),
                    equalTo: lang.base_15
                },
                access_term: {
                    required: lang.base_16
                },
                private_term: {
                    required: lang.base_17
                }
            },
            submitHandler: function (form) {
                if (form.id != "register_frm") {    // [works #2012] 회원가입 레이어 팝업 높이 조절 이슈
                    var $oErrorDiv = $('#error_div_register'),
                        bHasHideClass = $oErrorDiv.hasClass('hide');

                    if (bHasHideClass === false) {
                        $oErrorDiv.addClass('hide');
                    }
                }

                layerRegister.registerAction();
            },
            /**
             * ** 검증 실패 핸들러 **
             * 기존에는 해당 input 박스 옆에 모든 에러 메세지 출력되는 방식
             * 출력되는 위치 지정 및 모든 에러가 아닌 하나씩 출력되게 수정
             *
             * 참고 : http://www.zachhunter.com/2010/11/jquery-validation-show-focus-on-first-error-only/
             */
            invalidHandler: function (form, validator) {
                $('#error_div_register').removeClass('shake');
                var $oErrorDiv = $('#error_div_register'),
                    bHasHideClass = $oErrorDiv.hasClass('hide');
                if (bHasHideClass === true) {
                    $oErrorDiv.addClass('shake');
                    $oErrorDiv.removeClass('hide');
                }

                // 검실 실패 리스트
                var aErrorList = validator.errorList;
                // 모든 에러가 아닌 하나의 에러만 출력
                $oErrorDiv.text(aErrorList[0]['message']);
                aErrorList[0]['element'].focus();
                $oErrorDiv.addClass('shake');
            },
            /**
             * 에러 메세지를 출력 위치 지정
             * 검증 실패 핸들러에서 에러를 출력해주므로
             * 해당 메서드를 비워 줘야만 중복으로 메세지가 발생하지 않는다.
             */
            errorPlacement: function (error, element) {
                //
            }
        });// end of validate
    },
    registerAction: function () {
        var register_elm = $('#register'),
            modal_login_elm = $('#modal-sign'),
            sUserId = register_elm.find('#join_user_id').val(),
            sUserPwd = register_elm.find('#join_user_pw').val(),
            iAgree = $("input:checkbox[id='agree']").is(":checked"),
            iAccess = $("input:checkbox[id='access_term']").is(":checked"),
            iPrivate = $("input:checkbox[id='private_term']").is(":checked"),
            sClientIp = modal_login_elm.find('#client_ip').val(),
            returnUrl = modal_login_elm.find('#return').val(),
            direction = modal_login_elm.find('#direction').val(),
            incorrectly_email = modal_login_elm.find('#incorrectly_email').val(),
            sFinalType = '',
            sFinalUrl = '',
            bHasEmail = true, //
            bEmail = true;
        $('#error_div_register').html("");  // [works #2012] 회원가입 레이어 팝업 높이 조절 이슈
        // email 체크
        if (sUserId !== incorrectly_email) {
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + "/auth/incorrectly_email",
                dataType: 'text',
                async: false,
                data: {'sUserId': sUserId},
                success: function (aRst) {
                    aRst = $.parseJSON(aRst);
                    if (aRst.code === 200) {
                        res = true;
                    } else {
                        modal_login_elm.find('#incorrectly_email').val(sUserId);
                        // [works #2012] 회원가입 레이어 팝업 높이 조절 이슈
                        // layerRegister.setErrorDiv(aRst.msg, 'show');
                        if ($('#error_div_register').hasClass("hide")) {
                            $('#error_div_register').removeClass("hide");
                        }
                        $('#error_div_register').css('height', "");
                        $('#error_div_register').html(aRst.msg);
                        $('#error_div_register').css('height', $('#error_div_register').height());
                        layerRegister.handleCheck(register_elm.find('#join_user_id'));
                        bEmail = false;
                        return false;
                    }
                }
            });
        }

        // yahoo 메일 가입자는 sns 가입 안내 레이어
        if (sUserId.indexOf('@yahoo') > 0 || sUserId.indexOf('@ymail') > 0) {
            var mail = sUserId.split('@');
            $('#modal_yahoo_register').find('#yahoo_email').html('@' + mail[1]);
            Base.popup('modal_yahoo_register');
            return false;
        }

        if(!layerRegister.bHasEmailCheck){
            $.ajax({
                type: "POST",
                url: LANG_PREFIX + "/auth/get_user_by_email",
                dataType: 'json',
                async: false,
                data: {'user_id': sUserId},
                success: function (aRst) {
                    if (aRst.code === 'Y') {
                        if (aRst.list.length > 0) {
                            var isEmail = false;
                            $.each(aRst.list, function (i, k) {
                                if (k == 'email') isEmail = true;
                            });
                            if (!isEmail) {
                                layerRegister.setSignupCheckLayer(sUserId, aRst.list);
                                bHasEmail = false;
                            }
                        }
                    }
                    layerRegister.bHasEmailCheck = true;
                }
            });
        }

        if (bEmail && bHasEmail) {
            $.ajax({
                url: LANG_PREFIX + '/auth/layer_register',
                type: 'post',
                dataType: 'json',
                data: {
                    'user_id': sUserId,
                    'user_pw': sUserPwd,
                    'agree': iAgree,
                    'access_term': iAccess,
                    'private_term': iPrivate,
                    'client_ip': sClientIp,
                    'returnUrl': returnUrl,
                    'direction': direction
                },
                success: function (aRst) {
                    if (aRst.code !== 200) {
                        if (aRst.code == 301) {
                            layerRegister.setVerifyCodeLayer(aRst.email);
                        } else {
                            if (aRst.code == 303) {
                                $("#reg_form_wrap").css("display", "none");
                                $("#section_email_check").css("display", "");
                                $("#section_email_check .text04").text("");
                                $("#section_email_check .text01").empty();

                                $("#section_email_check .text01").html(aRst.ret);

                                if (aRst.verif_msg != "") {
                                    $("#section_email_check .text04").text(aRst.verif_msg);
                                }
                            } else {
                                if ($("#reg_form_wrap").css("display") == "none") {
                                    $("#section_email_check").css("display", "none");
                                    $("#reg_form_wrap").css("display", "")
                                }

                                //layerRegister.setErrorDiv(aRst.ret, 'show');
                                // [works #2012] 회원가입 레이어 팝업 높이 조절 이슈
                                if ($('#error_div_register').hasClass("hide")) {
                                    $('#error_div_register').removeClass("hide");
                                }
                                $('#error_div_register').css('height', "");
                                $('#error_div_register').html(aRst.ret);
                                $('#error_div_register').css('height', $('#error_div_register').height());
                            }
                        }
                        return;
                    }

                    if (aRst.login_alert !== '' && aRst.login_alert !== undefined) {
                        alert(aRst.login_alert.replace(/<br>/gi, '\n'));
                    }

                    if (aRst.redirection === 'reload') {
                        sFinalType = 'reload';

                    } else {
                        sFinalType = 'redirection';
                        sFinalUrl = aRst.redirection;
                    }

                    if (sFinalType === 'reload') {
                        location.reload();
                    } else {
                        location.replace(sFinalUrl);
                        if (location.hash.length > 0 && location.hash.indexOf('#') !== -1) {
                            location.reload();
                        }
                    }
                },
                error: function (err1, err2, errMsg) {
                }
            });
        }

    },
    setVerifyCodeLayer: function (email) {
        var modalVerifyCode = $('#modal_verify_code'); // 이메일 계정 사용여부 확인 화면
        $("#verify_error_msg").css("display", "none");
        $("#verify_error_msg").text("");
        $("#verify_code").val("");
        $("#target_email").text(email);

        $("body").css("padding-right", "");

        modalVerifyCode.modal({
            backdrop: false
        });

        return false;
    },
    snsregister: function (sUrl) {
        // 약관 동의 정보를 담은 json배열 생성
        var iAccess = {
                "check": $("input:checkbox[id='access_term']").is(":checked"),
                "message": lang.base_16,
                "id": "access_term"
            },
            iPrivate = {
                "check": $("input:checkbox[id='private_term']").is(":checked"),
                "message": lang.base_17,
                "id": "private_term"
            };


        if (iAccess.check !== true) {

            var $oErrorDiv = $('#error_div_register'),
                bHasHideClass = $oErrorDiv.hasClass('hide');

            if (bHasHideClass === true) {
                $oErrorDiv.removeClass('hide');
            }

            // 검실 실패 리스트
            var aErrorList = iAccess.message;

            // 모든 에러가 아닌 하나의 에러만 출력
            $oErrorDiv.text(aErrorList);
            $("#" + iAccess.id).focus();
            return;
        }

        if (iPrivate.check !== true) {

            var $oErrorDiv = $('#error_div_register'),
                bHasHideClass = $oErrorDiv.hasClass('hide');

            if (bHasHideClass === true) {
                $oErrorDiv.removeClass('hide');
            }

            // 검실 실패 리스트
            var aErrorList = iPrivate.message;

            // 모든 에러가 아닌 하나의 에러만 출력
            $oErrorDiv.text(aErrorList);
            $("#" + iPrivate.id).focus();
            return;
        }

        if (iAccess.check === true && iPrivate.check === true) {
            location.href = sUrl;
        }
    },

    /**
     * 회원 가입 체크 팦업
     */
    setSignupCheckLayer: function (email, accounts) {
        var modal_login_elm = $('#modal-sign')
        var same_email_modal = $('#same_email_modal'); // 이메일 계정 사용여부 확인 화면
        var dup_check_id = same_email_modal.find('[id=dup_check_id]');

        if(accounts.length > 0) {
            $.each(accounts, function (i, k) {
                switch (k) {
                    case 'google':
                        same_email_modal.find('#dup_check_id_google').show();
                        break;
                    case 'facebook':
                        same_email_modal.find('#dup_check_id_facebook').show();
                        break;
                    case 'line':
                        same_email_modal.find('#dup_check_id_line').show();
                        break;
                    case 'yahoo':
                        same_email_modal.find('#dup_check_id_yahoo').show();
                        break;
                    case 'twitter':
                        same_email_modal.find('#dup_check_id_twitter').show();
                        break;
                    case 'email':
                        same_email_modal.find('#dup_check_id_email').show();
                        break;
                    case 'apple':
                        same_email_modal.find('#dup_check_id_apple').show();
                        break;
                    default:
                        same_email_modal.find('#dup_check_id_email').show();
                        break;
                }
            });
        }
        if (modal_login_elm.is(':visible')) {
            modal_login_elm.modal('toggle');
        }

        $("body").css("padding-right", "");

        if (SITE_TYPE == 'F') {
            $('mark#dup_check_id').text(email);
            dup_check_id.val(email);
        } else {
            dup_check_id.text(email);
        }
        same_email_modal.modal();
        return false;
    },

    /**
     * 에러 메세지 div처리
     * sErrMsg : 에러 메세지
     * sMode : 'show', 'hide'
     */
    setErrorDiv: function (sErrMsg, sMode) {
        var $oErrorDiv = $('#error_div_register'),
            bHasHideClass = $oErrorDiv.hasClass('hide');

        if (sMode === 'show') {
            if (bHasHideClass === true) {
                $oErrorDiv.removeClass('hide');
            }
            $oErrorDiv.html(sErrMsg);
        } else if (sMode === 'hide') {
            if (bHasHideClass === false) {
                $oErrorDiv.addClass('hide');
            }
        }
    },

    // check
    handleCheck: function (e) {
        var val = e.val();
        var fontSize = parseInt(e.css('font-size'));
        var checkLine = e.parent().find('span');

        if (val.indexOf('@') !== -1) {

            var mail = val.split('@');
            var size = layerRegister.measureText(mail[0], fontSize);
            var valSize = layerRegister.measureText(val, fontSize);

            checkLine.css('display', "block");
            checkLine.css('left', size.width + parseInt(e.css('padding-left')) + 'px');
            checkLine.css('right', e.outerWidth() - valSize.width - parseInt(e.css('padding-right')) + 'px');
        }
    },

    measureText: function (pText, pFontSize, pStyle) {
        var lDiv = document.createElement('div');

        document.body.appendChild(lDiv);

        if (pStyle != null) {
            lDiv.style = pStyle;
        }
        lDiv.style.fontSize = "" + pFontSize + "px";
        lDiv.style.position = "absolute";
        lDiv.style.left = -1000;
        lDiv.style.top = -1000;

        lDiv.innerHTML = pText;

        var lResult = {
            width: lDiv.clientWidth,
            height: lDiv.clientHeight
        };

        document.body.removeChild(lDiv);
        lDiv = null;

        return lResult;
    },
    submitDupCheck : function(){
        var join_user_id = $("#register #join_user_id").val();

        $('form[name=register_frm]').submit();
        $("#same_email_modal").modal('toggle');

        $("body").css("padding-right", "");

        Base.clear_sign_form('register');
        if ($('#site_type').val() == 'F') {
            Base.sortSnsIconFmale();
        } else {
            Base.sortSnsIcon();
        }
        $('#modal-sign').modal();

        $("#register #join_user_id").val(join_user_id);
    }
};

// 검색
var Search = {
    init: function () {
        $("#srch-val").bind('focusin', function () {
            if ($('#search_list ul li').length === 0 && $('#srch-val').val().length === 0) {
                Search.get_recent_list();
                // Search.get_recomm_list();
            }

            if (isSearchToon()) {
                $(".section_search_dropbox").show();
            }
        });

        //setup before functions
        var typingTimer;                // 타이머 초기화
        var doneTypingInterval = 100;  // 대기시간 0.1초로 설정
        var $input = $("#srch-val");

        //keyup 된 후 0.1초 후 검색 시작
        $input.on('keyup', function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        });

        //검색어를 입력할 경우 시간 초기화
        $input.on('keydown', function () {
            clearTimeout(typingTimer);
        });

        //keyup 후 지정한 시간이 지났을 경우 실행
        function doneTyping () {
            if ($('#srch-val').val().length > 0) {
                Search.ajax_search();
            } else if ($('#srch-val').val().length === 0) {
                $('#search_list').hide();

                if (isSearchToon()) {
                    $(".section_search_dropbox").show();
                    $('#search_recently_list').show();
                } else {
                    $(".section_search_dropbox").hide();
                    $('#search_recently_list').hide();
                }

                $('#search_recommend_list').show();
            }
        }

        $('body').click(function (e) {
            if ($(e.target).parents('.section_search').length === 0) {
                $(".section_search_dropbox").hide();

                // 여성향 서비스 검색 박스 닫기
                if ($('.top__search__input').length > 0) {
                    $('.top__search__input').stop().animate({ opacity: 0 }, 200, function () {
                        $(this).closest('.top__search').removeClass('active');
                    });
                }
            }
        });

        // 검색 더보기
        $('.section_search_dropbox').scroll(function() {
            if ($('#more_loading_wrap').length > 0 && $(".more-loading").css('display') == 'none') {
                if ($('.section_search_dropbox').scrollTop() == ($('#search_list').height() - $(".section_search_dropbox").height())) {
                    Search.ajax_search_more()
                }
            }
        });

        // 검색 더보기 (여성향 서비스)
        $('.scroll__area').scroll(function() {
            if ($('#more_loading_wrap').length > 0 && $(".more-loading").css('display') == 'none') {
                if ($('.scroll__area').scrollTop() == ($('#search_list').height() - $('.scroll__area').height())) {
                    Search.ajax_search_more()
                }
            }
        });
    },

    ajax_cookie_search: function (data) {
        $.post('/webtoon/ajax_search', {
                'toonData': data
            },
            function (data) {
                $('#search_result').html(data);
                Search.set_search_srcoll();
            }
        );
    },

    ajax_search: function () {
        if ($('#srch-val').val() !== '' && $('#srch-val').val().length > 0) {
            $.post(LANG_PREFIX + '/webtoon/ajax_search', {
                    'toonData': $.trim($('#srch-val').val()),
                    'offset': 0,
                    'limit': 20
                },
                function (data) {
                    // 검색 결과가 없을시엔 데이터가 없음을 표기
                    $('#search_list').html(data);
                }
            ).done(function () {
                if ($('#srch-val').val().length > 0) {
                    $(".section_search_dropbox").show();
                    $('#search_list').show();
                    if ($('#search_recently_list').find('li').length === 0) {
                        Search.get_recent_list();
                    }
                    // if ($('#search_recommend_list').find('li').length === 0) {
                    //     Search.get_recomm_list();
                    // }
                    $('#search_recently_list').hide();
                } else {
                    if (isSearchToon()) $('#search_recently_list').show();
                }
            });

        }
    },
    ajax_search_more: function () {
        if ($('#srch-val').val() !== '' && $('#srch-val').val().length > 0) {
            var offset = $("#more_offset").val();
            var limit = $("#more_limit").val();

            $("#more_loading_wrap").find(".more-loading").removeClass("dp-none");

            $.post(LANG_PREFIX + '/webtoon/ajax_search', {
                    'toonData': $.trim($('#srch-val').val()),
                    'offset': Number(offset) + 20,
                    'limit': limit
                },
                function (data) {
                    // 검색 결과가 없을시엔 데이터가 없음을 표기
                    $('#search_list').append(data);
                    $("#more_loading_wrap").remove();
                }
            ).done(function () {
                if ($('#srch-val').val().length > 0) {
                    $(".section_search_dropbox").show();
                    $('#search_list').show();

                    if ($('#search_recently_list').find('li').length === 0) {
                        Search.get_recent_list();
                    }

                    $('#search_recently_list').hide();
                } else {
                    if (isSearchToon()) $('#search_recently_list').show();
                }
            });
        }
    },
    get_recent_list: function () {
        var recent = document.getElementById('search_recently_list');
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/webtoon/get_recent_list",
            dataType: 'html',
            async: false,
            success: function (data) {
                $(recent).html(data);
                //Search.set_search_srcoll();
            },
            error: function (data) {
            }
        });
    },
    get_recomm_list: function () {
        var recomm = document.getElementById('search_recommend_list');

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/webtoon/get_recomm_list",
            dataType: 'html',
            async: false,
            success: function (data) {
                $(recomm).html(data);
                //Search.set_search_srcoll();
            },
            error: function (data) {
            }
        });
    },
    set_search_srcoll: function() {
        $('#search_result').slimScroll({
            height: '300px',
            scrollTo:'0px',
            railVisible: true,
            alwaysVisible: true
        });
        if ($('#srch-val').val().length > 0) {
            $('.slimScrollBar').css('top','0px');
            //$('#srch-layer').show();
            $(".srch-result").show();
        }
    },
    /**
     * 이전 검색 작품 삭제
     * @param e
     */
    close_recent: function (e) {
        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/webtoon/delete_search_cookie",
            data: {
                'toon_idx': $(e).data('toon-idx')
            },
            dataType: 'json',
            success: function (aRst) {
                if (parseInt(aRst) === 200) {
                    if ($(e).parents('ul').find('li').length <= 1) {
                        $('#recently_list_no_msg').show();
                    }
                    $(e).parents('li').remove();

                    // add by HJH (190416)
                    // [works #2041 연관]
                    // 최근 검색 웹툰 개수 차감
                    if (isSearchToon()) {
                        var cntSearchToon = $("#recent_search_cnt").val();
                        cntSearchToon -= 1;
                        $("#recent_search_cnt").val(cntSearchToon);
                    }
                }
            }
        });
    },
    end: function () {
    }
};

//모달 중앙배치
var centerModal = {
    init:function(){
        $(document).on('show.bs.modal', '.modal', centerModal.positionModals);
        $(window).on('resize', function(e) {
            $('.modal:visible').each(centerModal.positionModals);
        });
    },
    positionModals:function(e){
        var $mbanner3 = $(this).find('.mbanner3-slick');
        if ($mbanner3.length) {
            mbanner3();
            $mbanner3.resize();
        }

        var $this = $(this).css('display', 'block'),
            $dialog = $this.find('.modal-dialog'),
            marginBottom = parseInt($dialog.css('margin-bottom'), 10),
            offset = ((window.innerHeight - $dialog.height()) / 2 - marginBottom);
            $dialog.css('margin-top', offset < marginBottom ? marginBottom : offset);
    }
};

// 비밀번호 찾기 ajax
// add by HJH (190521)
var forgotPassword = {
    check_email: function (e) {
        var user_id = $("input[name='user_id']").val();
        user_id = user_id.replace(/ /gi, ""); //공백제거

        $.ajax({
            type: "POST",
            url: LANG_PREFIX + "/auth/forgot_password_check",
            data: {
                'user_id': user_id
            },
            dataType: 'json',
            success: function (aRst) {
                if (aRst.redirect != "") {
                    location.href = aRst.redirect;
                } else {
                    if (SITE_TYPE == 'F') {
                        var $parent = $("#err_msg").parent('div');

                        $("#err_msg").html(aRst.sMsg);

                        if (!aRst.bRes) {
                            $parent.removeClass('submit__success');
                            $parent.addClass('submit__fail');
                            $parent.find('.sp-icons').removeClass('sp-icons__ico_toast_success');
                            $parent.find('.sp-icons').addClass('sp-icons__ico_toast_fail');
                        } else {
                            $parent.removeClass('submit__fail');
                            $parent.addClass('submit__success');
                            $parent.find('.sp-icons').removeClass('sp-icons__ico_toast_fail');
                            $parent.find('.sp-icons').addClass('sp-icons__ico_toast_success');
                        }

                        $("#err_msg").parent("div").css("display", "");
                    } else {
                        $("#err_msg").html(aRst.sMsg);

                        if (!aRst.bRes) {
                            $("#err_msg").removeClass("alert-info");
                            $("#err_msg").css("color", "red");
                        } else {
                            $("#err_msg").css("color", "");
                            $("#err_msg").addClass("alert-info");
                        }

                        $("#err_msg").css("display", "");
                    }
                }
            }
        });

        return false;
    }
};

/**
 * 앱 런쳐
 * @type {{init: appLaunch.init}}
 */
var AppLaunch = {
    /**
     * 이벤트 등록하여 호출시 사용
     */
    init: function(){
        this._oOS = this._getOS();
        var app_btn = $('.app_launch');
        if(app_btn.length > 0){
            app_btn.click(function(){
                AppLaunch._clickLaunch(this);
            });
        }
    },
    /**
     * 즉시 호출시 사용
     */
    click: function(t){
        AppLaunch._clickLaunch(t);
    },
    _clickLaunch: function(t){
        var data = this._getData(t); // app link data
        console.log(data);
        if (this._oOS.ios || this._oOS.ipados) {
            if (data.ios.redirect) {
                location.href = data.ios.redirect
                return false;
            }
            if(true === this._isIOS9Over()) {
                if(data.ios.universal){
                    console.log('#1-0 click ios universal link');
                    this._launchIOSByUniversalLink(data);
                } else {
                    if(false === this._isInApp()) {
                        location.href = "https://itunes.apple.com/app/id" + data.ios.installId + "?mt=8";
                    } else {
                        return false;
                    }
                }
            } else {
                console.log('#1-1 click ios frame link low 9');
                this._installIOS(data);
                this._launchIOSWithFrame(data);
            }
        } else if (this._oOS.android) {
            if (data.android.redirect) {
                location.href = data.android.redirect;
                return false;
            }
            console.log('#2-1 click android ');
            this._launchAndroid(data);
        } else {
            if(data.etc && data.etc.type == 'modal' && $('#free__app').length > 0){
                $('#free__app').modal();
            } else {
                this._printNotMatchInfo(data);
            }

        }

    },
    _getData: function (t) {
        return {
            ios: {
                scheme: t.getAttribute("data-ios-scheme"),
                installId: t.getAttribute("data-ios-install"),
                query: t.getAttribute("data-ios-query"),
                redirect: t.getAttribute("data-ios-redirect"),
                universal: t.getAttribute("data-ios-universal"),
            },
            android: {
                scheme: t.getAttribute("data-android-scheme"),
                package: t.getAttribute("data-android-package"),
                query: t.getAttribute("data-android-query"),
                action: t.getAttribute("data-android-action"),
                category: t.getAttribute("data-android-category"),
                redirect: t.getAttribute("data-android-redirect")
            },
            etc: {
                type: t.getAttribute("data-pc-type"),
                url: t.getAttribute("data-unknown-url"),
            }
        }
    },
    _getOS: function () {
        var pos = -1,
            ua = navigator.userAgent.toLowerCase(),
            ios = false, // n
            ipados = false, // r
            android = false, // i
            version = "";
        if (ua.match(/ipad/i) || ua.match(/iphone/i)) {
            ios = true;
            pos = ua.indexOf("os ");
        } else if (ua.indexOf("macintosh") > -1 && "ontouchend" in document) {
            ipados = true;
            pos = ua.indexOf("version/");
        } else if (ua.match(/android/i)) {
            android = true;
            pos = ua.indexOf("android ");
            console.log(pos);
        }
        if (true === ios && pos > -1) {
            version = ua.substr(pos + 3, 3).replace("_", ".");
        } else if (true === ipados && pos > -1) {
            version = ua.substr(pos + 8, 4)
        } else if (true === android && pos > -1) {
            version = ua.substr(pos + 8, 3)
        }
        return {ios: ios, ipados: ipados, android: android, version: version, pos: pos};
    },
    _isIOS9Over: function () {
        return parseInt(this._oOS.version, 10) >= 9
    },
    _launchAppByIframe: function (t) {
        var fr = document.createElement("iframe");
        fr.style.display = "none",
            fr.src = t,
            document.body.appendChild(fr),
            setTimeout(function () {
                document.body.removeChild(fr)
            }, 1e3)
    },

    _launchIOSByUniversalLink: function (t) { // ios 유니버셜 링크 이동
        var url = t.ios.universal
        if(t.ios.query) url += '?' + t.ios.query;
        console.log(url);
        window.location.href = url;
    },
    _launchIOS: function (t) { // ios 스키마  이동
        if (!t.ios.scheme) return false;
        window.location.href = t.ios.scheme + "://" + t.ios.query;
    },
    _launchIOSWithFrame: function (t) { //
        if (!t.ios.scheme) return false;
        var e = t.ios.scheme + "://" + t.ios.query;
        this._launchAppByIframe(e)
    },
    _installIOS: function (t) {
        var dt = +new Date,
            wait = 1e3,
            install_url = "https://itunes.apple.com/app/id" + t.ios.installId + "?mt=8";
        t.ios.scheme || (wait = 0),
            naverAppCheckTimer = setTimeout(function () {
                +new Date - dt < 1500 && (window.location.href = install_url)
            }, wait)
    },
    _launchAndroid: function (t) {
        if (!t.android.scheme) {
            this._launchAndroidWithIntent("market://details?id=" + t.android.package);
            return false;
        }
        if (true === this._isInApp()) {
            var e = t.android.scheme + "://" + t.android.action + t.android.query;
            this._launchAndroidWithIntent(e)
        } else {
            var intent = "intent://" + t.android.query + "#Intent;",
                intent_param = ["appstore", "redirect", "query", "fallback", 'action'];
            for (var i in t.android) {
                var o = t.android[i];
                if(intent_param.indexOf(i) < 0 && o){
                    intent += i + "=" + o + ";"
                }
            }
            intent += "end";
            this._launchAndroidWithIntent(intent)
        }
    },
    _launchAndroidWithIntent: function (t) {
        if(true === this._isInApp() && true !== this._isCrosswalk() && parseFloat(this._oOS.version) >= 4.4){
            this._launchAppByIframe(t);
        } else {
            console.log(t);
            window.location.href = t
        }
    },
    _isInApp: function () {
        var is_app = false;
        if(/LALATOON/.test(navigator.userAgent) || typeof toomicsGlobal != 'undefined') {
            is_app = true;
        }
        return is_app;
    },
    _isCrosswalk: function () {
        return /Crosswalk/.test(navigator.userAgent)
    },
    _printNotMatchInfo: function (t) {
        //var conf = t.config.unsupportedMsg;
        window.alert('not support!');
    },
};

function mbanner3(){
    $(".mbanner3-slick").on('init', function(event, slick) {
        $(this).css({
            "display": "block",
            "visibility": "visible"
        });
    }).slick({
        infinite: true,
        zIndex: 10,
        dots: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000
    });
}

function slickMainBanner() {
    var item = $(".main_banner_item");
    if (item.length > 0) {
        $(item).on('init', function(e, s) {
            $(this).find('.slider_item').css({
                "display": "block",
                "visibility": "visible"
            });
        }).on('beforeChange', function(e, s, d, n){
            var bg_url = $(s.$slides[n]).data('bg');
            var target = $('#top_banner_bg');
            var bef_bg = target.css('background-image').replace(/(url\(|\)|'|")/gi, '');

            if (bef_bg.indexOf('http') == -1) {
                bef_bg = window.location.protocol + "//" + window.location.host + bef_bg;
            }

            if (bg_url.indexOf('http') == -1) {
                bg_url = window.location.protocol + "//" + window.location.host + bg_url;
            }

            if (bef_bg != bg_url) {
                target.css('transition', 'background-image 0.5s ease-in-out');
                target.css({'background-image': 'url(' + (bg_url) + ')'});
            }
        }).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: true,
            fade: true,
            cssEase: 'linear',
            arrows: false,
            autoplay: true,
            autoplaySpeed: 6000
        });
    }
}

/**
 * Recently Read
 */
function slickMyRecent() {
    //section_myrecent
    var item = $(".section_myrecent .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_myrecent .left_btn',
            nextArrow: '.section_myrecent .right_btn',
        });
    }
}

/**
 * Favorite Read
 */
function slickMyFavorite() {
    //section_myfavorite
    var item = $(".section_myfavorite .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_myfavorite .left_btn',
            nextArrow: '.section_myfavorite .right_btn',
        });
    }
}

/**
 * section_because_1
 */
function slickBecause_1() {
    //section_because_1
    var item = $(".section_because_1 .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_because_1 .left_btn',
            nextArrow: '.section_because_1 .right_btn',
        });
    }
}

/**
 * section_because_2
 */
function slickBecause_2() {
    //section_because_2
    var item = $(".section_because_2 .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_because_2 .left_btn',
            nextArrow: '.section_because_2 .right_btn',
        });
    }
}

/**
 * section_because_3
 */
function slickBecause_3() {
    //section_because_3
    var item = $(".section_because_3 .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_because_3 .left_btn',
            nextArrow: '.section_because_3 .right_btn',
        });
    }
}

/**
 * section_because_4
 */
function slickBecause_4() {
    //section_because_4
    var item = $(".section_because_4 .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_because_4 .left_btn',
            nextArrow: '.section_because_4 .right_btn',
        });
    }
}

/**
 * section_because_5
 */
function slickBecause_5() {
    //section_because_4
    var item = $(".section_because_5 .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            prevArrow: '.section_because_5 .left_btn',
            nextArrow: '.section_because_5 .right_btn',
        });
    }
}


function slickRanking() {
    var cnt_genre = $("#cnt_genre").val();
    if (cnt_genre > 0) {
        for (var i = 1; i <= cnt_genre; i++) {
            var item = $("#section_ranking"+i+" .slick_item");
            if (item.length > 0) {
                $(item).slick({
                    infinite: true,
                    zIndex: 10,
                    dots: false,
                    arrows: true,
                    speed: 300,
                    slidesToShow: 5,
                    slidesToScroll: 5,
                    slidesPerRow: 5,
                    rows: 1,
                    //visiableWidth: true,
                    prevArrow: "#section_ranking"+i+" .left_btn",
                    nextArrow: "#section_ranking"+i+" .right_btn",
                });
            }
        }
    }
}

/**
 * Today's Comics
 */
function slickTodayUp() {
    //section_todayup
    var item = $("#section_todayup .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            // slidesToShow: 5,
            //slidesToScroll: 5,
            slidesPerRow: 5,
            rows:2,
            //visiableWidth: true,
            prevArrow: '#section_todayup .left_btn',
            nextArrow: '#section_todayup .right_btn',
        });
    }
}

/**
 * New Comics
 */
function slickNewComic() {
    //section_todayup
    var item = $("#section_newcomic .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            //slidesToShow: 5,
            //slidesToScroll: 5,
            slidesPerRow: 5,
            rows: 2,
            //visiableWidth: true,
            prevArrow: '#section_newcomic .left_btn',
            nextArrow: '#section_newcomic .right_btn',
        });
    }
}

/**
 * Popular Comics
 */
function slickHot() {
    //section_most
    var item = $(".section_most  .slick_item");
    if (item.length > 0) {
        $(item).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            //slidesToShow: 5,
            //slidesToScroll: 5,
            slidesPerRow: 5,
            rows:2,
            //visiableWidth: true,
            prevArrow: '.section_most .left_btn',
            nextArrow: '.section_most .right_btn',
        });
    }
}

/*
    viewer bottom banner
*/
function slickBottomBanner() {
    var item = $('.bottom_banner_item');
    if (item.length > 0) {
        $(item)
            .on('init', function (e, s, d) {
                $(this).find('.slider_item').css({
                    display: 'block',
                    visibility: 'visible',
                });
            })
            .on('afterChange', function (e, s, d) {})
            .slick({
                lazyLoad: 'progressive',
                infinite: true,
                zIndex: 10,
                dots: true,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 6000,
            });
    }
}

/*
    epsode bottom lise slide
*/
function episodeViewer() {
    var $item = $('.ep-viewer__bottom__list .slick_item');

    $item.each(function (i) {
        var $this = $(this);
        $this.addClass('slide-count-' + i);

        $this
            .parent()
            .find('.left_btn ')
            .addClass('left_btn-' + i);
        $this
            .parent()
            .find('.right_btn')
            .addClass('right_btn-' + i);

        $('.slide-count-' + i).slick({
            lazyLoad: 'progressive',
            infinite: true,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            prevArrow: '.ep-viewer__bottom__list .left_btn-' + i,
            nextArrow: '.ep-viewer__bottom__list .right_btn-' + i,
        });
    });

}

/**
 * type별 시간 지정 cookie
 * @param cName cookie name
 * @param cValue domain
 * @param t_type [0:sec,1:min,2:hours,3:days]
 * @param t_val time
 */
function setCookieSec(cName, cValue, t_type, t_val) {
    var expire = new Date();
    var ary_time_type = [1000, (1000*60), (1000*60*60), (1000*60*60*24)]; // 초, 분, 시, 일
    v = (ary_time_type[t_type] * t_val);
    expire.setTime(expire.getTime() + v);
    cookies = cName + '=' + escape(cValue) + '; path=/ ; domain=.' + UPPER_LEVEL_DOMAINS; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
    if(typeof v != 'undefined') cookies += ';expires=' + expire.toUTCString() + ';';
    document.cookie = cookies;
}

// 쿠키 생성
function setCookie(cName, cValue, cDay) {
    var expire = new Date();

    // 날짜가 변경될때까지만 인정
    // 조금 이상하지만 요청사항 이므로 처리한다
    expire.setHours(0, 0, 0, 0);
    expire.setDate(expire.getDate() + cDay);
    cookies = cName + '=' + escape(cValue) + '; path=/ ; domain=.' + UPPER_LEVEL_DOMAINS; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
    if (typeof cDay != 'undefined') cookies += ';expires=' + expire.toUTCString() + ';';
    document.cookie = cookies;
}

// 쿠키 가져오기
function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if (start != -1) {
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if (end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}

/**
 * 쿠키 삭제
 * @param cookieName 삭제할 쿠키명
 */
function deleteCookie(cookieName) {
    var expireDate = new Date();

    //어제 날짜를 쿠키 소멸 날짜로 설정한다.
    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie = cookieName + "= " + "; expires=" + expireDate.toUTCString() + "; path=/; domain=." + UPPER_LEVEL_DOMAINS;
}


/**
 * url 정보로 컨텐츠 언어 확인
 *
 * @returns {string}
 * @lang_add
 */
function getLang() {
    if (location.hostname.split('.')[1] === 'bobolika') {
        return 'zh_cn';
    }

    var seg = ((location.pathname.split('/')[1] == '') ? location.pathname.split('/')[2] : location.pathname.split('/')[1]);
    switch (seg) {
        case 'tc':
            return 'zh_tw';
        case 'sc':
            return 'zh_cn';
        case 'mx':
            return 'es_mx';
        case 'esp':
            return 'es_mx';
        case 'es':
            return 'es_es';
        case 'jp':
            return 'jp';
        case 'it':
            return 'it';
        case 'fr':
            return 'fr';
        case 'pt':
            return 'pt_pt';
        case 'br':
            return 'pt_br';
        case 'por':
            return 'pt_br';
        case 'de':
            return 'de';
        case 'kr':
            return 'kr';
        default :
            return 'en';
    }
}

/**
 * 언어 구분자 추출
 *
 * @returns {string}
 */
function getLangPrefix() {
    if (location.hostname.split('.')[1] === 'bobolika') {
        return '';
    } else {
        return '/' + location.pathname.split('/')[1];
    }
}

function isSearchToon() {
    var cntSearchToon = $("#recent_search_cnt").val();

    return (cntSearchToon > 0) ? true : false;
}

/**
 * url에서  지정한 parameter 획득
 * add by HJH (190507)
 * @param url
 * @param name
 * @returns parameter value
 */
function getUrlParam(url, name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
    return (results) ? results[1] : "";
}

