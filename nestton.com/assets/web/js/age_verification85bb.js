$(document).ready(function () {
    AgeVerificationSms.init();
});

const AgeVerificationSms = {
    sms_int_tel: {},
    wait: false,

    init: function () {
        AgeVerificationSms.initTelInput();

        AgeVerificationSms.clickSmsSend();

        AgeVerificationSms.clickVerifyCodeSend();

        AgeVerificationSms.clickCancel();

        AgeVerificationSms.setSelect2Element();
    },

    initTelInput: function () { // 국제 전화번호 input 생성
        const country = document.getElementById("country").value;
        let input = document.querySelector("#phone");

        if (input !== null) {
            AgeVerificationSms.sms_int_tel = window.intlTelInput(input, {
                dropdownContainer: document.body,
                initialCountry: country,
                preferredCountries: [],
                utilsScript: "/assets/lib/intl-tel-input-16.0.0/build/js/utils.js"
            });
        }
    },
    getStrHMS: function(second){
        let msg = ' ';
        let h = parseInt(second / 3600);
        let m = parseInt((second % 3600) / 60);
        let s = second % 60;

        if (h > 0) {
            h += '';
            msg += h.padStart(2, '0') + ':'
        }

        if (m > 0) {
            m += '';
            msg += m.padStart(2, '0') + ':'
        } else if (m === 0 && h > 0) {
            msg += '00:'
        }

        if (s % 60 > 0) {
            s += '';
            msg += s.padStart(2, '0');
        } else if (s === 0 && m > 0) {
            msg += '00'
        }

        return msg;
    },

    countDown: function (oRst) {
        const btnSend = document.getElementById("sms_verify_send");
        let downloadTimer, leftTime, msg;

        leftTime = oRst.message;
        downloadTimer = setInterval(function () {
            msg = AgeVerificationSms.getStrHMS(leftTime);

            btnSend.innerHTML = lang.str_replace(lang.age_verification_6, msg);
            leftTime -= 1;
            if (leftTime <= 0) {
                clearInterval(downloadTimer);
                AgeVerificationSms.wait = false;
                btnSend.disabled = false;
                btnSend.innerHTML = lang.age_verification_7;
            }
        }, 1000);
    },

    clickSmsSend: function () { // sms 인증 요청
        const btnSend = document.getElementById("sms_verify_send");
        const btnCancel = document.getElementById('sms_cancel');
        const smsHeader = document.getElementById('sms_header');
        const smsHeaderMsg = document.getElementById('sms_header_message');
        const phoneDiv = document.getElementById('phone_div');
        const codeDiv = document.getElementById('code_div');
        const smsMsg = document.getElementById('sms_message');

        $('#sms_verify_send').click(function () {
            AgeVerificationSms.resetSmsMsg();

            if (!AgeVerificationSms.sms_int_tel.isValidNumber()) {
                smsMsg.innerHTML = lang.age_verification_3;
                return false
            }

            if (AgeVerificationSms.wait === true) {
                return false;
            }

            AgeVerificationSms.wait = true;
            btnSend.disabled = true;
            btnSend.innerHTML = '<img src="/assets/web/img/common/sms_loading.png" style="height:24px">';

            $.ajax({
                url: LANG_PREFIX  + '/age_verification/request_sms',
                type: 'POST',
                dataType: 'json',
                data: {
                    phone : AgeVerificationSms.sms_int_tel.getNumber()
                },
                sync: false,
                success: function (oRst) {
                    if ([200, 202].includes(oRst.code)) { // sms 인증 번호 발송
                        // UI 변경
                        smsHeader.innerHTML = lang.age_verification_4;
                        smsHeaderMsg.innerHTML = lang.age_verification_5;
                        phoneDiv.style.display = "none";
                        codeDiv.style.display = "block";
                        btnSend.classList.add('button_no');
                        btnSend.classList.remove('button_send');
                        AgeVerificationSms.countDown(oRst);

                        if (oRst.code === 202 && btnCancel.dataset.step === '2') {
                            smsMsg.innerHTML = lang.age_verification_9;
                        }

                        btnCancel.dataset.step = "2";
                    } else if (oRst.code === 102) {
                        AgeVerificationSms.countDown(oRst);
                    } else {
                        AgeVerificationSms.wait = false;
                        btnSend.disabled = false;
                        btnSend.innerHTML = lang.age_verification_7;
                        smsMsg.innerHTML = oRst.message;
                    }
                }
            });
        });
    },

    clickVerifyCodeSend: function () { // sms 인증 번호 확인
        $('#verify_code').click(function () {
            const code = document.getElementById("code").value;
            const returnUrl = getUrlParam(location.href, 'return_url');
            const smsMsg = document.getElementById('sms_message');

            AgeVerificationSms.resetSmsMsg();

            $.ajax({
                url: LANG_PREFIX  + '/age_verification/verify_sms',
                type: 'POST',
                dataType: 'json',
                data: {
                    code : code,
                    return_url: returnUrl
                },
                sync: false,
                success: function (oRst) {
                    if (oRst.code === 201){
                        location.href = oRst.return;
                    } else {
                        smsMsg.innerHTML = oRst.message;
                    }
                }
            });
        });
    },

    clickCancel: function () { // sms 인증 번호 확인
        const phoneDiv = document.getElementById('phone_div');
        const codeDiv = document.getElementById('code_div');
        const btnCancel = document.getElementById('sms_cancel');
        const smsHeader = document.getElementById('sms_header');
        const smsHeaderMsg = document.getElementById('sms_header_message');
        const btnVerifySend = document.getElementById('sms_verify_send');

        $('#sms_cancel').click(function () {
            AgeVerificationSms.resetSmsMsg();

            if (btnCancel.dataset.step === "2") {
                smsHeader.innerHTML = lang.age_verification_10;
                smsHeaderMsg.innerHTML = lang.age_verification_11;
                btnCancel.dataset.step = "1";
                btnVerifySend.classList.add('button_send');
                btnVerifySend.classList.remove('button_no');
                phoneDiv.style.display = "block";
                codeDiv.style.display = "none";
            } else {
                history.back();
            }
        });
    },

    resetSmsMsg: function()
    {
        document.getElementById('sms_message').innerHTML = '';
    },

    setSelect2Element: function()
    {
        $("#birthMonth").select2({
            minimumResultsForSearch: Infinity
        });

        $("#birthDay").select2({
            minimumResultsForSearch: Infinity
        });

        $("#birthYear").select2({
            minimumResultsForSearch: Infinity
        });
    }
};


