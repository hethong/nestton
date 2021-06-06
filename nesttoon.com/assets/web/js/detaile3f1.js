$(document).ready(function () {
    var show_page = $('input[name=show_page]').val();
    if(show_page == '1'){
        Detail.initPage();
    }else{
        Detail.initDefault();
    }
    if ($('#viewer-img').length != 0) {
        Detail.init();
        viewerToolbar.init();
    }
    if ($('.lazy').length > 0) {
        ll = new LazyLoad(options);
    }

    if ($('.cross-imgs').length > 0) {
        CrossViewerToolbar.init();
    }

    if ($('.lazy_detail').length > 0) {
        $('.lazy_detail').lazyload({threshold: (window.innerHeight * 2)});
    }

    // lead url 옵션 레이어
    var $eFullVer = $('#fullVer');
    if ($eFullVer.length > 0) {
        $eFullVer.modal({
            keyboard: false,
            backdrop: 'static'
        });
    }

    collect.init();
});
// * vanila lazyload define
function logElementEvent(eventName, element) {
    //console.log(Date.now(), eventName, $(element).attr('id'));
}
var callback_loading = function (element) {
    logElementEvent("⌚ LOADING", element);
    var progress = $(element).siblings('div.progress');
    var loading = progress.children('.progress__loading');
    var button = progress.children('.reload__btn');
    loading.show();
    button.hide();
    button.css('z-index', 0);
};
var callback_loaded = function (element) {
    logElementEvent("👍 LOADED", element);
    var progress = $(element).siblings('div.progress');
    var loading = progress.children('.progress__loading');
    var button = progress.children('.reload__btn');
    $(element).css('visibility', 'visible');
    progress.hide();
    button.css('z-index', 0);
};
var callback_error = function (element) {
    logElementEvent("💀 ERROR", element);
    var progress = $(element).siblings('div.progress');
    var loading = progress.children('.progress__loading');
    var button = progress.children('.reload__btn');
    var bg = $(element).data('bg');
    $(element).data('src', $(element).attr('src'));
    if(bg == 'b'){
        $(element).attr('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAALQAQMAAABIQjEhAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAANQTFRFAAAAp3o92gAAAFVJREFUeJztwTEBAAAAwqD1T20KP6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL4G+lAAAZQLO5IAAAAASUVORK5CYII=");
    } else {
        $(element).attr('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAALQAQMAAABIQjEhAAAAA1BMVEX///+nxBvIAAAAYUlEQVR42uzBgQAAAACAoP2pF6kCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD24JAAAAAAQND/166wAQAAwCz6UAABSDBL2gAAAABJRU5ErkJggg==");
    }

    loading.hide();
    button.show();
    button.css('z-index', '9999');
    button.click(function (e) {
        var time = new Date().getTime();
        var id = $(this).data('id');
        var element = $('img#' + id);
        var el = document.querySelector('img#' + id);
        LazyLoad.load(el, options);
        element.attr('src', element.data('src'));

        if(!send_click_image_reload){
            var toon_idx = $('input#toon_idx');
            var art_idx = $('input#art_idx');
            var user_idx = $('input#user_idx');
            var offset = element.offset();
            var pos = offset.top;
            var data = {
                'toon_idx': toon_idx.val(),
                'art_idx': art_idx.val(),
                'user_idx': user_idx.val(),
                'pos': pos
            };
            $.ajax({
                url: LANG_PREFIX + '/webtoon/call_click_image_reload',
                type: 'POST',
                dataType: 'json',
                data : data
            }).done(function (json) {
            }).fail(function () {
                send_click_image_reload = false;
            });
            send_click_image_reload = true
        }
    });
};
send_click_image_reload = false; // 이미지 리로드 이벤트 여부 전달
options = {
    use_native: true,
    threshold: window.innerHeight * 3,
    callback_loading: callback_loading,
    callback_loaded: callback_loaded,
    callback_error: callback_error,
};

var Detail = {
    page : 1,
    tot_page : 1,
    goto : true,
    init: function () {
        // $('body').addClass('bg-white');
        Detail.initSlick();
    },
    initDefault: function(){
        if($('.lazy').length > 0){
            $('#viewer-body2').show();
        }
        $("#viewer-img").removeClass('active');
        /*$(window).scroll(function () {
            // 마지막 이미지 영역의 세로 사이즈
            var last_image = count - 1;
            var last_height = parseInt($('#load_image_' + last_image).height() / 2, 10);

            // 이미지 영역의 세로를 구한뒤 마지막 이미지 영역의 세로분 + 세로분의 절반에 도달했을때 새로운 이미지를 로드
            var document_height = Number($('#viewer-img').height()) - Number($('#load_image_' + last_image).height() + last_height);
            var scroll_top = Number($(window).scrollTop());
            var current_height = document_height - scroll_top;

            if (current_height <= 50) {
                Detail.loadContents();
            }
        });*/

        if (location.href.indexOf('/webtoon/detail') !== -1 || location.href.indexOf('/site/detail') !== -1) {
            Detail.setCopyrightColor();
        }
    },
    initSlick: function(){
        $('.viewer-slick').on('init',function(event, slick){
            var activeIndex = $(this).find('.active').index();
            if(activeIndex <= 0){ activeIndex = 0; }
            slick.slickGoTo(activeIndex);
            $(this).css({
                "display":"block",
                "visibility":"visible"
            });

        }).slick({
            infinite: false,
            zIndex: 10,
            dots: false,
            arrows: true,
            speed: 300,
            slidesToShow: 5,
            slidesToScroll: 5,
            //centerMode:true
            /*infinite: false,
            slidesToShow: 5,
            slidesToScroll: 5,
            zIndex:10,
            centerMode:true,
            centerPadding:'0px'*/
        });

        $('.viewer-slick').on('afterChange', function (event, slick, currentSlide) {
            if (currentSlide <= 2) {
                $('.slick-prev').addClass('hidden');
            } else {
                $('.slick-prev').removeClass('hidden');
            }

            if (currentSlide >= $('._slide').length - 3) {
                $('.slick-next').addClass('hidden');
            } else {
                $('.slick-next').removeClass('hidden');
            }
        });

        //미니뷰어
        $(".viewer-footer").on('mouseenter',function(e) {
            TweenMax.to($(".viewer-mini"),0.4,{
                bottom:70,
                transformOrigin: "bottom center"
            });
            return false;
        });

        $(".viewer-footer").on('mouseleave',function(e) {
            TweenMax.to($(".viewer-mini"),0.4,{
                bottom:-148,
                transformOrigin: "bottom center"
            });
            return false;
        });
    },
    /**
     * 상세페이지 - 페이지 초기화
     */
    initPage : function(){
        if($('input[name=cur_page]').length > 0){
            var cur_page = parseInt($('input[name=cur_page]').val());
            var tot_page = parseInt($('input[name=tot_page]').val());
            Detail.page = parseInt($('input[name=cur_page]').val());
            Detail.tot_page = parseInt($('input[name=tot_page]').val());

            if (cur_page >= tot_page) {
                Detail.goto == false;
                Detail.page = 'end';
                $('#loading_wrap').hide();
                $('#viewer-body2').show();
            } else {
                Detail.goto == true;
                Detail.setWindowScroll();
            }
        }
    },
    setWindowScroll: function(){
        $(window).scroll(function () {
            var windowScrollTop = $(window).scrollTop();
            var windowScrollBottom = windowScrollTop + $(window).height();
            var domHeight = $(document).height();
            var nextPage = Detail.page + 1;
            if ($('#load_image_wrap_'+nextPage).length == 0) {
                if (Detail.page != 'end' && windowScrollBottom >= domHeight- (window.innerHeight*5)  && Detail.goto == true) {
                    Detail.goto = false;
                    var renewURL = Detail.setUrl(nextPage);
                    Detail.ajaxNextPage(renewURL,  Detail.page);
                }
            }
        });
    },
    ajaxNextPage: function(url, page){
        $.ajax({
            url: url,
            dataType: 'html',
            success: function(html) {
                if(html.trim() != ''){
                    Detail.goto = true;
                    Detail.page++;
                    // Detail.setUrlState(Detail.page);
                    $('#page_number').html(Detail.page);
                    $('#viewer-body').append(html);
                    $('.lazy_detail').lazyload();
                }else{
                    Detail.page = 'end';
                    $('#loading_wrap').hide();
                    $('#viewer-body2').show();
                }
            }
        });
    },
    setUrl: function(page){
        var sepRenewURL = location.href.split("?", 2);
        var renewURL = sepRenewURL[0];
        var query = '';
        if(sepRenewURL[1] != undefined){
            query = '?'+sepRenewURL[1];
        }
        renewURL = renewURL.replace(/\/page\/([0-9]+)/ig,'');
        renewURL += '/page/'+page;
        renewURL = renewURL.replace(/\/detail\//ig,'/detail_page/');
        renewURL += query;
        return renewURL;
    },
    setUrlState: function(page){
        var sepRenewURL = location.href.split("?", 2);
        var renewURL = sepRenewURL[0];
        var query = '';
        if(sepRenewURL[1] != undefined){
            query = '?'+sepRenewURL[1];
        }
        renewURL = renewURL.replace(/\/page\/([0-9]+)/ig,'');
        renewURL += '/page/'+page;
        renewURL += query;
        history.pushState(null, null, renewURL);
    },
    getItems: function () {
        $('#viewer-img').find('*:not(script)').each(function () {
            var image_data = '';
            var image_key = '';
            if ($(this).get(0).nodeName.toLowerCase() == 'img' && (typeof($(this).attr('data-src')) != 'undefined' && $(this).attr('data-src') != '')) {
                image_data = $(this).attr('data-src');
                image_key = $(this).attr('id');
                //console.log('original image_key is', image_key);
            }
            if (image_data.length > 0) {
                items.push(image_data);
                items_key.push(image_key);
            }
        });
    },
    loacContents3: function () {

        function loadImage(url, index, callback) {
            //console.log('get urls', url);
            var image = new Image();
            image.onload = function () {
                callback(null, image, index);
            };
            image.src = url;
            //console.log('get urls', image.src);
        }

        function loadImages(urls, callback) {
            var returned = false;
            var count = 0;
            var result = new Array(urls.length);

            var load_image_id_dft = '#load_image_';
            var load_image_id_set = '';
            var set_image_id = '#';

            urls.forEach(function (url, index) {
                loadImage(url, index, function (error, item, index) {
                    if (returned) return;
                    if (error) {
                        returned = true;
                        return callback(error);
                    }
                    result[index] = item;

                    set_image_id = '#'.concat(items_key[index]);
                    $(set_image_id).remove();

                    var set_image_id_get_number = set_image_id.split('#set_image_');
                    load_image_id_set = load_image_id_dft.concat(set_image_id_get_number[1]);
                    $(load_image_id_set).append(result[index]);

                    count++;
                    if (count === urls.length) {
                        return callback(null, result);
                    }
                });
            });
        }

        this.getItems();
        loadImages(items, function (err, images) {
            if (err) throw err;
            //console.log('All images loaded', images);
            $('#viewer-body2').find('img').each(function () {
                $(this).attr('src', $(this).data('src'));
            });
            $('#viewer-body2').show();
        });

    },
    loadContents: function () {

        if (items.length > 0) {
            // 이미 로드된 이미지 확인
            if (count >= items.length) {
                return false;
            }

            // 다음 이미지 로드
            $('#load_image_' + count).show();
            $('#' + count).attr('src', items[count] + '?' + (count));

            // 출력된 이미지 카운트
            //count++;
        } else {
            $('#viewer-img').find('*:not(script)').each(function () {
                var image_data = '';

                if ($(this).get(0).nodeName.toLowerCase() == 'img' && typeof($(this).attr('src')) != 'undefined') {
                    image_data = $(this).attr('data-src');
                }

                if (image_data.length > 0) {
                    items.push(image_data);
                }
            });

            // 첫번째 이미지 로드


            for (var i = 0; i < 5; i++) {
                if($('#'+i).length > 0) {
                    //$('#load_image_'+i).show();
                    $('#' + i).attr('src', items[i] + '?' + i);
                }
            }



            if($('#0').length > 0) $('#0').imagesLoaded().done(function () {
                $('#load_image_0').attr('style', '');
            });
            // 출력된 이미지 카운트
            //count++;
        }

        $('#'+count).imagesLoaded().done(function () {
            if(count==0) {
                count = 5;
            } else {
                count++;
            }

            Detail.loadContents();
        });

        $('#load_image_'+ (items.length-1)).imagesLoaded().done(function () {
            $('#viewer-body2').find('img').each(function() {
                $(this).attr('src', $(this).data('src'));
            });
            $('#viewer-body2').show();
        });
    },

    getRGBA: function () {
        $.fn.getRGBA = function (callBack) {
            var image = this[0],
                canvas = $("<canvas/>")[0],
                imageData;

            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
            imageData = canvas.getContext("2d").getImageData(0, 0, image.width, image.height).data;

            var start = imageData.length - 4;
            callBack({
                r: imageData[start],
                g: imageData[start + 1],
                b: imageData[start + 2],
                a: imageData[start + 3]
            });
        };
    },

    setCopyrightColor: function () {
        $.event.add(window, "load", function () {
            var elm = $('#viewer-img').find('img').last(),
                copyright_elm = $('#copyright'),
                copyright_img_elm = copyright_elm.find('img'),
                site_type = 'Z';

            if (copyright_elm.data('site-type') !== undefined) {
                site_type = copyright_elm.data('site-type');
            }

            if (elm.length > 0) {
                if (elm.attr('crossOrigin') !== undefined) {
                    elm.css('display', 'block');
                    Detail.getRGBA();
                    elm.getRGBA(function (color) {
                        var color_value, copyright_color;
                        color_value = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                        copyright_color = color_value < 128 ? 'black' : 'white';

                        if (copyright_color === 'black') {
                            copyright_img_elm.attr('src', '/assets/web/img/contents/b_viewer-copyright_' + CONTENT_LANG + '_' + site_type + '.png?v=20210414');
                            $('.ep__next').addClass('bg-black');
                        } else {
                            copyright_img_elm.attr('src', '/assets/web/img/contents/w_viewer-copyright_' + CONTENT_LANG + '_' + site_type + '.png?v=20210414');
                            $('.ep__next').addClass('bg-white');
                        }
                        copyright_img_elm.css('display', 'block');
                    });
                }else{
                    copyright_img_elm.attr('src', '/assets/web/img/contents/w_viewer-copyright_' + CONTENT_LANG + '_' + site_type + '.png?v=2020061012');
                    elm.css('display', 'block');
                    copyright_img_elm.css('display', 'block');
                }
            }
        });
    },

    /**
     * 웹툰 상세 하단의 추천 웹툰 클릭시 CTR A/B 테스트 관련 통계 데이터 셋팅
     * @param moveUrl
     * @param bannerType
     */
    genFirstComicCheckData: function(moveUrl, toonIdx, landingType) {
        if (landingType == 'A') {
            location.href = moveUrl;
        } else {
            $.ajax({
                url: LANG_PREFIX + '/webtoon/ajax_gen_first_comic_check_data',
                type: 'post',
                dataType: 'text',
                data: {
                    'toon_idx': toonIdx,
                    'landing_type': landingType
                },
                success: function () {
                    location.href = moveUrl;
                }
            });
        }
    },

    /**
     * lead 레이어 팝업 클릭
     * @param leadType
     */
    goCompleateLead: function(leadType)
    {
        $.ajax({
            type : 'post',
            url: LANG_PREFIX + '/webtoon/click_lead_layer',
            dataType: 'json',
            data : {
                lead_type: leadType
            }
        });
    }
};

// 뷰어툴바
var viewerToolbar = {
    isHidden:false,
    init: function() {
        $(window).load(function (event) {
            viewerToolbar.visible();
            viewerToolbar.isHidden = false;
        });
        // [works #2153] 상하단 레이어 width값 추가
        if ($(".glo_viewer").width()) {
            $(".viewer-top, .viewer-bottom").css('width', $(".glo_viewer").width());
            $(window).on('resize', function (e) {
                $(".viewer-top, .viewer-bottom").css('width', $(".glo_viewer").width());
            });
        }

        $(window).scroll(function (event) {
            let st = Math.round($(this).scrollTop());
            let vtm = $('#viewer-img').data('topMargin'); // 뷰어 상단 여백

            // 스크롤이 마지막 영역에 도달
            if (st >= ($(document).height() - window.innerHeight - vtm)) {
                // 메뉴 노출
                viewerToolbar.visible();
                viewerToolbar.isHidden = false;
            }

            if (st > 85 && st < ($(document).height() - window.innerHeight - vtm)) {
                viewerToolbar.hidden();
                viewerToolbar.isHidden = true;
                // $('.direction__toast').hide();
            } else if (st <= 85) {
                viewerToolbar.visible();
                viewerToolbar.isHidden = false;
            }
        });

        if ($('#viewer-body2').length != 0) {
            $('#viewer-body2').click(function (e) {
                var className = e.target.getAttribute('class');
                if (className != null) {
                    if (
                        className.indexOf('btn') !== -1 ||
                        className.indexOf('icon-minus') !== -1 ||
                        className.indexOf('icon-plus') !== -1 ||
                        className.indexOf('icon-remove-sign') !== -1
                    ) {
                        return;
                    }
                }
                if (viewerToolbar.isHidden) {
                    viewerToolbar.visible();
                    viewerToolbar.isHidden = false;
                } else {
                    viewerToolbar.hidden();
                    viewerToolbar.isHidden = true;
                }
            });
        }

        if ($('.viewer-etc').length != 0) {
            $('.viewer-etc').click(function (e) {
                e.stopPropagation();

                var className = e.target.getAttribute('class');

                if (className != null) {
                    if (
                        className.indexOf('slick-active') !== -1 ||
                        className.indexOf('slick-dots') !== -1 ||
                        className.indexOf('slick-arrow') !== -1 ||
                        className.indexOf('ico_left') !== -1 ||
                        className.indexOf('ico_right') !== -1 ||
                        className.indexOf('text') !== -1
                    ) {
                        return;
                    }
                }
                if (viewerToolbar.isHidden) {
                    viewerToolbar.visible();
                    viewerToolbar.isHidden = false;
                } else {
                    viewerToolbar.hidden();
                    viewerToolbar.isHidden = true;
                }
            });
        }
        this.action();
    },
    hidden:function() {
        TweenMax.to($(".viewer-top"),0.2,{
            top:-85,
            opacity:0,
            ease: Power0.easeNone
        });
        TweenMax.to($(".viewer-footer"),0.3,{
            bottom:-233,
            opacity:0,
            ease: Power0.easeNone
        });
    },
    visible:function() {
        TweenMax.to($(".viewer-top"),0.2,{
            top:0,
            opacity:1,
            ease: Power0.easeNone
        });

        TweenMax.to($(".viewer-footer"),0.3,{
            bottom:0,
            opacity:1,
            ease: Power0.easeNone
        });
    },
    action:function() {
        $(".viewer-body").click(function(e) {
            var className = e.target.getAttribute('class');

            if (className != null) {
                if (
                    className.indexOf('cross-prev') !== -1 ||
                    className.indexOf('cross-next') !== -1 ||
                    className.indexOf('cross-menu') !== -1
                ) {
                    return;
                }
            }
            if (viewerToolbar.isHidden) {
                viewerToolbar.visible();
                viewerToolbar.isHidden = false;
            } else {
                viewerToolbar.hidden();
                viewerToolbar.isHidden = true;
            }
        });

        if (!viewerToolbar.isHidden) {
            $(".vmore").on('mouseenter',function(e){
                TweenMax.to($(".viewer-mini"),0.4,{bottom:85,transformOrigin: "bottom center"});
                return false;
            });
            $(".viewer-footer").on('mouseleave',function(e){
                TweenMax.to($(".viewer-mini"),0.4,{bottom:-233,transformOrigin: "bottom center"});
                return false;
            });
        }
    },
    actionComics:function(){
        $(".comics-menu").click(function(e){
            $(this).toggleClass("active");
            if($(this).hasClass("active")) {
                TweenMax.to($(".viewer-top-comics"),0.2,{top:-85,ease: Power0.easeNone});
                TweenMax.to($(".viewer-footer-comics"),0.2,{bottom:-177,ease: Power0.easeNone});
            } else {
                TweenMax.to($(".viewer-top-comics"),0.2,{top:0,ease: Power0.easeNone});
                TweenMax.to($(".viewer-footer-comics"),0.2,{bottom:0,ease: Power0.easeNone});
            }

        });
    }
};

//크로스 뷰어 일경우
var CrossViewerToolbar = (function () {
    var $crossImgWrap = $('.cross-imgs');
    var $crossImgs = $('.cross-imgs >div');
    var $crossMenuBtn = $('.cross-menu');
    var $crossNavBtnWrap = $('.cross-btns');
    var $crossNavBtn = $('.cross-btns >button');
    var $viewChangeBtn = $('.bar__btns').find('button');
    var $progressBarWrap = $('.progress__bar');
    var $currentPg = $('.current-pg');
    var $totalPg = $('.total-pg');
    var $scrollToggleBtn = $('.viewer-method-toggle');
    var $sliderSelection = $('#progress__bar').find('.slider-selection');
    var $FirstPageNotice = $('#direction__first');
    var $lastPageNotice = $('#direction__last');
    var $prevEpisodeBtn = $('#btn_prev');
    var $nextEpisodeBtn = $('#btn_next');
    var $directionToast = $('.direction__toast');
    var $turnPosition = $('#turn_position');
    var direction = $crossImgWrap.data('direction');
    var isSingle = false || $crossImgWrap.hasClass('single-view');

    function viewerToggle() {
        var $this = $(this);
        if ($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    }

    var ImgResize = (function () {
        var size;
        var imgResize = {naturalWidth:0, naturalHeight:0, height: 0, width: 0};

        function getImgSize($img) {
            var size = {
                naturalWidth: 0,
                naturalHeight: 0,
            };

            size.naturalWidth = $('#' + $img.id).data('naturalwidth');
            size.naturalHeight = $('#' + $img.id).data('naturalheight');

            return size;
        }
        return {
            init: function () {
                this.imgResize();
            },
            imgResize: function () {
                var $img = $crossImgs.eq(1).find('img');
                var windowWidth = $(window).outerWidth();
                var windowHeight = $(window).outerHeight();
                var ratio = 0;
                 if (imgResize.height === 0) {
                    $.each($img, function (key, val) {
                        size = getImgSize(val);
                        var naturalSize = {
                            width: size.naturalWidth,
                            height: size.naturalHeight,
                        };

                        ratio = naturalSize.width / naturalSize.height;
                        imgResize.naturalHeight += naturalSize.height;
                        imgResize.naturalWidth = Math.floor(naturalSize.height * ratio);
                    });

                     imgResize.height = imgResize.naturalHeight;
                     imgResize.width = imgResize.naturalWidth;
                 }

                ratio = imgResize.naturalWidth / imgResize.naturalHeight;

                if (imgResize.naturalHeight > windowHeight - 10) {
                    imgResize.height = windowHeight - 10;
                    imgResize.width = Math.floor(windowHeight * ratio);
                }

                if (imgResize.width > windowWidth / 2) {
                    imgResize.width = Math.floor(windowWidth / 2);
                    imgResize.height = Math.floor(imgResize.width / ratio);
                }

                $crossImgs.css({
                    width: imgResize.width + 'px',
                    height: imgResize.height + 'px',
                });

                if (!isSingle) {
                    imgResize.width = imgResize.width * 2;
                }

                $crossImgWrap.css({
                    width: imgResize.width + 'px',
                    height: imgResize.height + 'px',
                    marginLeft: -Math.round(imgResize.width / 2) + 'px',
                    marginTop: -Math.round(imgResize.height / 2) + 'px',
                });
            },
        };
    })();

    var CrossViewer = (function () {
        if (!$('.cross-imgs').length) {
            return;
        }

        var num = 1;
        var currentIdx = $('.cross-imgs > div.active:eq(0)').index();
        var totalPage = $crossImgs.length;
        var progress = $('#progress__bar').slider();
        var crossBtnsH = parseInt($crossNavBtnWrap.css('height'));
        var isHidden = false;

        return {
            init: function () {
                var $prev;
                var $next;
                $(window).load(function (event) {
                    CrossViewer.visible();
                    CrossViewer.isHidden = false;
                });

                this.mouseMove();

                if (!isHidden) {
                    $crossNavBtnWrap.css('height', crossBtnsH - 110);
                }

                if (isSingle) {
                    $('.bar__btn-single').addClass('active');
                    this.activePage($crossImgs.eq(0));
                } else {
                    num = 2;
                    $('.bar__btn-bouble').addClass('active');
                    this.activePage($crossImgs.eq(0));
                    this.activePage($crossImgs.eq(0).next());
                }

                this.setting(num, num);
                this.checkDirection();
                this.progressMove();

                this.changeView();
                this.actionBtn(direction);

                $crossNavBtn.mouseleave(function () {
                    $('.cross-btn-txt').css('visibility', 'hidden');
                });
                //
                // setTimeout(function () {
                //     $directionToast.fadeOut();
                // }, 1500);
            },
            mouseMove: function () {
                $crossNavBtn.mousemove(function (e) {
                    var $this = $(this);

                    mouseX = e.pageX;
                    mouseY = e.pageY;
                    if ($this.hasClass('cross-next')) {
                        $('.cross-btn-txt').css('visibility', 'hidden');
                        var thisPositionLf = $this.position().left;
                        var thisWidth = $this.find('span').outerWidth();

                        $this
                            .find('span')
                            .css('visibility', 'visible')
                            .css('left', mouseX - thisWidth - thisPositionLf)
                            .css('top', mouseY + 12);
                    } else if ($this.hasClass('cross-menu')) {
                        $('.cross-btn-txt').css('visibility', 'hidden');

                        var thisPositionLf = $this.position().left;
                        var txtWidth =
                            parseInt($this.find('span').outerWidth()) / 2;
                        $this
                            .find('span')
                            .css('visibility', 'visible')
                            .css(
                                'left',
                                mouseX - thisPositionLf + 30 - txtWidth
                            )
                            .css('top', mouseY + 60);
                    } else {
                        $('.cross-btn-txt').css('visibility', 'hidden');
                        var thisMarginLf = parseInt($this.css('left'));

                        $this
                            .find('span')
                            .css('visibility', 'visible')
                            .css('left', mouseX + 60 - thisMarginLf)
                            .css('top', mouseY + 12);
                    }
                });
            },
            setting: function (num, currentIdx) {
                $totalPg.text(totalPage);
                this.stringNum(currentIdx);

                //읽기방향 파악해서 슬라이드 초기 셋팅
                if (direction === 'left') {
                    $progressBarWrap.addClass('left');
                    $crossNavBtnWrap.addClass('left');

                    progress.slider({
                        min: num,
                        max: totalPage,
                        step: num,
                        reversed: true,
                        formatter: function (value) {
                            return value + ' / ' + totalPage;
                        },
                    });
                } else {
                    progress.slider({
                        min: num,
                        max: totalPage,
                        step: num,
                        formatter: function (value) {
                            return value + ' / ' + totalPage;
                        },
                    });
                }
                progress.slider('setValue', currentIdx);
            },
            getIdx: function () {
                var idx = $crossImgs.filter('.active').last().index() + 1;
                if (!isSingle) {
                    if (idx % 2 != 0) idx = idx + 1;
                }
                return idx;
            },
            checkDirection: function (idx) {
                //책 읽는 방향 파악 해서 좌우버튼 변경해줌
                // if (direction === 'left') {
                //     $prev = $('.cross-next');
                //     $next = $('.cross-prev');
                // } else if (direction === 'right') {
                //     $prev = $('.cross-prev');
                //     $next = $('.cross-next');
                // }

                $prev = $('.cross-prev');
                $next = $('.cross-next');

                //두장읽기인지 한장읽기인지 파악후
                //양끝페이지에 있으면 클래스 추가
                if (!isSingle && idx === 2) {
                    $prev.addClass('end');
                    CrossViewer.prev_text(true);
                } else if (isSingle && idx === 1) {
                    $prev.addClass('end');
                    CrossViewer.prev_text(true);
                } else {
                    $prev.removeClass('end');
                    CrossViewer.prev_text(false);
                }

                if (idx === totalPage) {
                    $next.addClass('end');
                    CrossViewer.next_text(true);
                } else {
                    $next.removeClass('end');
                    CrossViewer.next_text(false);
                }
            },
            stringNum: function (current) {
                var size = 2;

                current = current + '';
                current =
                    current.length >= size
                        ? current
                        : new Array(size - current.length + 1).join('0') +
                          current;
                $currentPg.text(current);
            },
            changeView: function () {
                var self = this;

                $viewChangeBtn.on('click', function (e) {
                    var $this = $(this);
                    $viewChangeBtn.removeClass('active');

                    if ($this.hasClass('bar__btn-single')) {
                        $this.addClass('active');
                        $crossImgWrap.addClass('single-view');
                        isSingle = true;
                    } else {
                        $this.addClass('active');
                        $crossImgWrap.removeClass('single-view');
                        isSingle = false;
                    }

                    var idx = self.getIdx();
                    var count = isSingle ? 1 : 2;

                    if (idx !== 1 || idx !== totalPage) {
                        $crossNavBtn.removeClass('end');
                    }

                    self.checkDirection(idx); //읽기방향 판단해서 좌우버튼 셋팅
                    self.setting(count, idx); //읽기방향 판단해서 슬라이드  셋팅
                    progress.slider('setValue', idx); //현재 페이지 값 셋팅
                    self.moving(idx); //이미지 무빙
                    ImgResize.init(); //이미지 리사이징
                });
            },
            moving: function (idx) {
                $crossImgs.removeClass('active');

                if (isSingle) {
                    this.activePage($crossImgs.eq(idx - 1));
                } else {
                    this.activePage($crossImgs.eq(idx - 1).prev());
                    this.activePage($crossImgs.eq(idx - 1));
                }

                if (idx === totalPage) {
                    $progressBarWrap.addClass('end');
                } else {
                    $progressBarWrap.removeClass('end');
                }
            },
            progressMove: function () {
                var self = this;
                progress.on('slideStop', function (pg) {
                    self.moving(pg.value);
                    self.checkDirection(pg.value);
                    self.stringNum(pg.value);
                });
            },
            actionBtn: function (direction) {
                var self = this;
                var idx = self.getIdx();

                //책 읽는 방향 파악
                self.checkDirection(idx);

                $prev.on('click', function (e) {
                    self.hidden();
                    CrossViewer.isHidden = true;
                    $crossNavBtnWrap.css('height', 100 + '%');
                    $lastPageNotice.removeClass('active');
                    var idx = self.getIdx();

                    if (isSingle) {
                        idx--;
                    } else {
                        idx = idx - 2;
                    }

                    if (0 >= idx) {
                        idx = 1;
                        $prev.addClass('end');
                        CrossViewer.prev_text(true);

                        // 이전화로 넘어가는 문구 띄움
                        if (!$FirstPageNotice.hasClass('active')) {
                            $FirstPageNotice.addClass('active');
                        } else {
                            if ($turnPosition.val() !== 'first') {
                                $prevEpisodeBtn[0].click();
                            }
                        }
                    } else {
                        self.stringNum(idx);
                        $next.removeClass('end');
                        CrossViewer.next_text(false);
                        $prev.removeClass('end');
                        CrossViewer.prev_text(false)
                        self.moving(idx);
                        progress.slider('setValue', idx);

                        if (1 === idx && isSingle) {
                            $prev.addClass('end');
                            CrossViewer.prev_text(true);
                            $next.removeClass('end');
                            CrossViewer.next_text(false);
                        } else if (2 === idx && !isSingle) {
                            $prev.addClass('end');
                            CrossViewer.prev_text(true);
                            $next.removeClass('end');
                            CrossViewer.next_text(false);
                        }
                    }
                });

                $next.on('click', function (e) {
                    self.hidden();
                    CrossViewer.isHidden = true;
                    $crossNavBtnWrap.css('height', 100 + '%');
                    $FirstPageNotice.removeClass('active');
                    var idx = self.getIdx();

                    if (isSingle) {
                        idx++;
                    } else {
                        idx = idx + 2;
                    }

                    if (totalPage < idx) {
                        idx = totalPage;
                        $next.addClass('end');
                        CrossViewer.next_text(true);

                        //다음화로 넘어가는 문구 띄움
                        if (!$lastPageNotice.hasClass('active')) {
                            $lastPageNotice.addClass('active');
                        } else {
                            $nextEpisodeBtn[0].click();
                        }
                    } else {
                        self.stringNum(idx);
                        $next.removeClass('end');
                        CrossViewer.next_text(false);
                        $prev.removeClass('end');
                        CrossViewer.prev_text(false);
                        self.moving(idx);
                        progress.slider('setValue', idx);
                        $lastPageNotice.removeClass('active');

                        if (totalPage === idx) {
                            $next.addClass('end');
                            CrossViewer.next_text(true);
                            $prev.removeClass('end');
                            CrossViewer.prev_text(false);
                            $progressBarWrap.addClass('end');
                        }
                    }
                });

                $crossMenuBtn.on('click', function (e) {
                    var idx = self.getIdx();

                    if (CrossViewer.isHidden === false) {
                        CrossViewer.isHidden = true;
                        self.hidden();
                        $crossNavBtnWrap.css('height', 100 + '%');

                        if (totalPage === idx) {
                            $lastPageNotice.addClass('active');
                        }
                    } else {
                        if ($lastPageNotice.hasClass('active')) {
                            $lastPageNotice.removeClass('active');
                        }
                        CrossViewer.isHidden = false;
                        self.visible();
                        $crossNavBtnWrap.css('height', crossBtnsH - 110 + 'px');
                    }
                });

                $(window).on('keydown', function (e) {
                    self.hidden();
                    CrossViewer.isHidden = true;
                    $crossNavBtnWrap.css('height', 100 + '%');

                    if (direction === 'left') {
                        if (e.which === 39) $prev.trigger('click');
                        if (e.which === 37) $next.trigger('click');
                    } else {
                        if (e.which === 37) $prev.trigger('click');
                        if (e.which === 39) $next.trigger('click');
                    }
                });
            },
            hidden: function () {
                TweenMax.to($('.viewer-footer-cross'), 0.2, {
                    bottom: -233,
                    opacity: 0,
                    ease: Power0.easeNone,
                });
                TweenMax.to($('.viewer-top'), 0.2, {
                    top: -85,
                    opacity: 0,
                    ease: Power0.easeNone,
                });
                TweenMax.to($('.viewer-footer'), 0.3, {
                    bottom: -233,
                    opacity: 0,
                    ease: Power0.easeNone,
                });

                // $directionToast.hide();
            },
            visible: function () {
                TweenMax.to($('.viewer-footer-cross'), 0.2, {
                    bottom: 95,
                    opacity: 1,
                    ease: Power0.easeNone,
                });
                TweenMax.to($('.viewer-top'), 0.2, {
                    top: 0,
                    opacity: 1,
                    ease: Power0.easeNone,
                });

                TweenMax.to($('.viewer-footer'), 0.3, {
                    bottom: 0,
                    opacity: 1,
                    ease: Power0.easeNone,
                });
            },
            /**
             * 노출 페이지 활성화 처리
             * @param {object} t($)
             */
            activePage: function(t) {
                if(!t.hasClass('active')) t.addClass('active');
                var tot = totalPage;
                var idx = t.index();
                var offset = 3;
                var lt = 0, gt = 0; // 최소 위치, 최고 위치
                gt = idx - offset;
                if(gt < 0) gt = 0
                lt = idx + offset;
                if(lt > tot - 1) lt = tot - 1;
                $crossImgs.slice(gt, lt).each(function() {
                    if(!$(this).hasClass('load')) {
                        $(this).addClass('load');
                        $(this).find('img').each(function () {
                            $(this).attr('src', $(this).data('src'));
                        });
                    }
                });
            },

            next_text: function(end) {
                if (end) {
                    if ($turnPosition.val() === 'finish') {
                        $next.find('.cross-btn-txt').text(lang['detail_9']);
                    } else if ($turnPosition.val() === 'last') {
                        $next.find('.cross-btn-txt').text(lang['detail_10']);
                    } else {
                        $next.find('.cross-btn-txt').text(lang['detail_7']);
                    }
                } else {
                    $next.find('.cross-btn-txt').text(lang['detail_12']);
                }
            },
            prev_text: function(end) {
                if (end) {
                    $prev.find('.cross-btn-txt').text(lang['detail_8']);
                } else {
                    $prev.find('.cross-btn-txt').text(lang['detail_13']);
                }
            }
        };
    })();

    return {
        init: function () {
            ImgResize.init();
            CrossViewer.init();

            $(window).resize(function () {
                ImgResize.init();
            });
            // $scrollToggleBtn.on('click', viewerToggle);
        },
    };
})();

