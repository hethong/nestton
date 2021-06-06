/**
 * Created by 2 on 2016-10-31.
 */
$(document).ready(function () {
    var $lazyElms = $('img.lazy');
    if ($lazyElms.length > 0) {
        $lazyElms.lazyload({
            effect: "fadeIn",
            effectTime: 500,
            failure_limit: 1000
        });

        $('.slick_item').on('scroll', function () {
            $(window).scroll();
        });
    }
    $(".prettydate").prettydate();
});

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
