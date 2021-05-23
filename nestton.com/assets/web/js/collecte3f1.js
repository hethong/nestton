var collect = {
    /**
     * Param
     */
    SEND_LAST_IMAGE: false,
    TOON_IDX: 0,
    ART_IDX: 0,
    TURN_ORDER: 0,
    IS_VIP: 0,
    SEND_COUNT: 5,

    ARR_MESSAGE: [],
    ARR_REG_TIMESTAMP: [],
    ARR_EVENT: [],
    ARR_SCROLL_TYPE: [],
    TR_IDX: 0,
    SCREEN_WIDTH: 0,
    SCREEN_HEIGHT: 0,
    TRACKING_WHEEL_TIMER: null,
    TRACKING_SCROLLBAR_TIMER: null,
    SEND_SCROLLING_DATA_INTERVAL: 30000,
    /**
     * Inital
     */
    init: function () {

        //global Param
        this.setToonIdx();
        this.setArtIdx();
        this.setTurnOrder();
        this.setIsVip();

        // Document Attach Event Listener
        if(this.IS_VIP == 1){
            // Scroll tracking 관련 변수 - add by HJH (190625)
            var clickBeforeScrollTop = 0;
            var isMovingMouse = false;

            // scroll tracking 관련 메소드 init - add by HJH (190625)
            this.trackingInit();
            // this.setScrollingData();

            /*$(document)
                .on("appear", '.lazy_detail', collect.eventImageAppear); // 이미지 appear 이벤트 등록*/
            this.initScrollDepth();


            $(".viewer-title a").on('click', function(e){
                // scroll tracking 관련 이벤트 - add by HJH (190625)
                var message = 'Title button';
                collect.setClickData(message)
            });

            $(document).on('click', function(e) {
                collect.setBtnMoveTracking(e); //add by HJH (190625)
            });

            $(document).mousedown(function(e){
                // scroll tracking 관련 이벤트 - add by HJH (190625)
                isMovingMouse = true;
                clickBeforeScrollTop = $(window).scrollTop();
            });

            $(document).mouseup(function(e){
                collect.setScrollBarMoveTracking(clickBeforeScrollTop); //add by HJH (190625)
            });

            document.getElementById("viewer-img").addEventListener("wheel", function(){
                collect.setWheelTracking(); //add by HJH (190625)
            });
        }
    },

    setToonIdx: function(){
        var idx = $('#toon_idx').val();
        this.TOON_IDX = idx;
        return idx;
    },
    setArtIdx: function(){
        var idx = $('#art_idx').val();
        this.ART_IDX = idx;
        return idx;
    },
    setTurnOrder: function(){
        var idx = $('#turn_order').val();
        this.TURN_ORDER = idx;
        return idx;
    },
    setIsVip: function(){
        var is = $('#is_vip').val();
        this.IS_VIP = is;
        return is;
    },

    /**
     * function sample
     */
    eventImageAppear: function(){
        if($(this).hasClass('last_image')){
            if(!this.SEND_LAST_IMAGE){
                this.SEND_LAST_IMAGE = true;
                collect.ajaxSetStatus('i');
                // console.log('last image');
            }
        }
    },
    initScrollDepth: function(){
        jQuery.scrollDepth({
            userTiming: false,
            pixelDepth: false,
            elements: ['#viewer-body2'],
            eventHandler: function(e) {
                if(e.eventLabel == '#viewer-body2'){
                    collect.ajaxSetStatus('p');
                    // console.log('scroll end point');
                }
            }
        });
    },
    /**
     * ajax 마지막 이미지 노출시 전송
     * @param m 모드(i : load last image, p: current point/total percent)
     */
    ajaxSetStatus: function(m){
        if(typeof m == 'undefined') m = 'i';
        var toon_idx = this.TOON_IDX;
        var art_idx = this.ART_IDX;
        var turn_order = this.TURN_ORDER;
        var url = LANG_PREFIX + '/webtoon/' + ((m == 'i') ? "Y2FsbF9sb2FkX2xhc3RfaW1hZ2U" : "Y2FsbF9yZWFjaF9lbmRfcG9pbnQ");
        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            data: {
                'toon_idx': toon_idx,
                'art_idx': art_idx,
                'turn_order': turn_order,
            },
            success: function (res) {
                // console.log(res);
            }
        });
    },
    trackingInit: function () {
        // 스크롤 트래킹 init
        // Make by HJH (190625)
        this.TOON_IDX = $("#toon_idx").val();
        this.ART_IDX = $("#art_idx").val();
        this.TURN_ORDER = $("#turn_order").val();
        this.SCREEN_WIDTH = window.innerWidth;
        this.SCREEN_HEIGHT = window.innerHeight;

        var reg_timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');

        $.ajax({
            type: 'POST',
            url: LANG_PREFIX + "/webtoon/tr_init",
            data: {
                't_i': collect.TOON_IDX,
                'a_i': collect.ART_IDX,
                't_o': collect.TURN_ORDER,
                'd_t': 'pc',
                'r_t': reg_timestamp,
                's_w': collect.SCREEN_WIDTH,
                's_h': collect.SCREEN_HEIGHT,
                'u_a': navigator.userAgent
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.tr_idx) {
                    collect.TR_IDX = resp.tr_idx;
                }
            }
        });
    },
    clearGlobalTrackingArray: function() {
        // 스크롤 트래킹 관련 전역 변수 초기화
        // Make by HJH (190625)
        this.ARR_MESSAGE = [];
        this.ARR_REG_TIMESTAMP = [];
        this.ARR_EVENT = [];
        this.ARR_SCROLL_TYPE = [];
    },
    clearTrackingLocalStorage: function() {
        // 스크롤 트래킹 관련 Local storage 초기화
        // Make by HJH (190625)
        localStorage.removeItem('tr_idx');
        localStorage.removeItem('message');
        localStorage.removeItem('event');
        localStorage.removeItem('toon_idx');
        localStorage.removeItem('turn_order');
        localStorage.removeItem('scroll_type');
        localStorage.removeItem('reg_timestamp');
    },
    setScrollingData: function() {
        // 스크롤 트래킹
        // 20초마다 스크롤 트래킹 데이터 request
        // Make by HJH (190625)
        setInterval(function () {
            var arr_message = (collect.ARR_MESSAGE.length > 0) ? collect.ARR_MESSAGE : [];
            var arr_event = (collect.ARR_EVENT.length > 0) ? collect.ARR_EVENT : [];
            var arr_scroll_type = (collect.ARR_SCROLL_TYPE.length > 0) ? collect.ARR_SCROLL_TYPE : [];
            var arr_reg_timestamp = (collect.ARR_REG_TIMESTAMP.length > 0) ? collect.ARR_REG_TIMESTAMP : [];

            collect.clearGlobalTrackingArray();
            collect.clearTrackingLocalStorage();

            if (arr_message.length > 0) {
                $.ajax({
                    type: 'POST',
                    url: LANG_PREFIX + "/webtoon/tr_dt",
                    dataType: 'text',
                    data: {
                        'tr_i': collect.TR_IDX,
                        'ms': arr_message,
                        'ev': arr_event,
                        't_i': collect.TOON_IDX,
                        't_o': collect.TURN_ORDER,
                        'd_t': 'pc',
                        's_t': arr_scroll_type,
                        'r_t': arr_reg_timestamp
                    },
                    success: function () {
                    }
                });
            }
        }, collect.SEND_SCROLLING_DATA_INTERVAL);
    },
    setClickData: function(message) {
        // 스크롤 트래킹
        // 상세보기 뷰에 존재하는 버튼 클릭시 해당 데이터 셋팅
        // Make by HJH (190625)
        var current_timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');

        this.clearTrackingLocalStorage();

        this.ARR_MESSAGE.push(message);
        this.ARR_REG_TIMESTAMP.push(current_timestamp);
        this.ARR_EVENT.push('click');
        this.ARR_SCROLL_TYPE.push('none');

        localStorage['tr_idx'] = this.TR_IDX;
        localStorage['message'] = JSON.stringify(this.ARR_MESSAGE);
        localStorage['event'] = JSON.stringify(this.ARR_EVENT);
        localStorage['toon_idx'] = this.TOON_IDX;
        localStorage['turn_order'] = this.TURN_ORDER;
        localStorage['scroll_type'] = JSON.stringify(this.ARR_SCROLL_TYPE);
        localStorage['reg_timestamp'] = JSON.stringify(this.ARR_REG_TIMESTAMP);
    },
    setWheelTracking: function() {
        // 스크롤 트래킹
        // 상세보기 화면에서 마우스 스크롤시 데이터 셋팅
        // Make by HJH (190625)
        var current_timestamp = '';
        var iCntScrollTop = 0;

        console.log(collect.ARR_MESSAGE);

        // if (!isMoveMouse) {
            if (collect.TRACKING_WHEEL_TIMER !== null) {
                clearTimeout(collect.TRACKING_WHEEL_TIMER);
            }
            collect.TRACKING_WHEEL_TIMER = setTimeout(function () {
                current_timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
                iCntScrollTop = $(window).scrollTop();

                collect.ARR_REG_TIMESTAMP.push(current_timestamp);
                collect.ARR_MESSAGE.push(iCntScrollTop);
                collect.ARR_EVENT.push('scroll');
                collect.ARR_SCROLL_TYPE.push('wheel');

                if (collect.ARR_MESSAGE.length >= collect.SEND_COUNT) {
                    collect.sendScrollData();
                }
            }, 150);
        // }
    },
    setScrollBarMoveTracking: function(clickBeforeScrollTop) {
        // 스크롤 트래킹
        // 상세보기 화면에서 스크롤바를 잡고 스크롤 이동시 데이터 셋팅
        // Make by HJH (190625)
        var current_timestamp = '';
        var iCntScrollTop = 0;
        // var debounceTimer = null;

        console.log(collect.ARR_MESSAGE);

        // if(isMoveMouse){
            if (collect.TRACKING_SCROLLBAR_TIMER !== null) {
                clearTimeout(collect.TRACKING_SCROLLBAR_TIMER);
            }
            collect.TRACKING_SCROLLBAR_TIMER = setTimeout(function () {
                var barScroll = $(window).scrollTop();
                if (clickBeforeScrollTop != barScroll) {
                    current_timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
                    collect.ARR_REG_TIMESTAMP.push(current_timestamp);

                    collect.ARR_EVENT.push('scroll');
                    collect.ARR_SCROLL_TYPE.push('scrollbar');

                    iCntScrollTop = $(window).scrollTop();
                    collect.ARR_MESSAGE.push(iCntScrollTop);
                }

                isMoveMouse = false;

                if (collect.ARR_MESSAGE.length >= collect.SEND_COUNT) {
                    collect.sendScrollData();
                }
            }, 150);
        // }
    },
    setBtnMoveTracking: function(e) {
        // 스크롤 트래킹
        // 상세보기뷰에 존재하는 버튼 클릭시 저장 데이터 셋팅
        // Make by HJH (190625)
        var ele = e.target;
        var ele_class = $(ele).attr('class');
        var btn_class = '';
        var message = '';

        if (ele_class == "ico_view_list") {
            ele = $(ele).parent();
        }

        btn_class = $(ele).attr('class');

        switch (btn_class) {
            case 'vlist':
                message = 'List button';
                break;
            case 'vnext':
                message = 'Next button';
                break;
            case 'ico_view_next':
                message = 'Next button';
                break;
            case 'vprev':
                message = 'Prev button';
                break;
            case 'ico_view_prev':
                message = 'Prev button';
                break;
            case 'viewer-title':
                message = 'Title button';
                break;
            case 'viewer-logo':
                message = 'Home button';
                break;
            default:
                message = '';
        }
        if (message != '') {
            this.setClickData(message);
        }
    },
    sendScrollData: function() {
        var arr_message = (collect.ARR_MESSAGE.length > 0) ? collect.ARR_MESSAGE : [];
        var arr_event = (collect.ARR_EVENT.length > 0) ? collect.ARR_EVENT : [];
        var arr_scroll_type = (collect.ARR_SCROLL_TYPE.length > 0) ? collect.ARR_SCROLL_TYPE : [];
        var arr_reg_timestamp = (collect.ARR_REG_TIMESTAMP.length > 0) ? collect.ARR_REG_TIMESTAMP : [];

        collect.clearGlobalTrackingArray();
        collect.clearTrackingLocalStorage();

        if (arr_message.length > 0) {
            $.ajax({
                type: 'POST',
                url: LANG_PREFIX + "/webtoon/tr_dt",
                dataType: 'text',
                data: {
                    'tr_i': collect.TR_IDX,
                    'ms': arr_message,
                    'ev': arr_event,
                    't_i': collect.TOON_IDX,
                    't_o': collect.TURN_ORDER,
                    'd_t': 'pc',
                    's_t': arr_scroll_type,
                    'r_t': arr_reg_timestamp
                },
                success: function () {
                }
            });
        }
    }
}