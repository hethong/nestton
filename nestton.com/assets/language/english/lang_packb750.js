var lang = {};

// {replace1} 문구를 replce_to_str로 치환
// 예 : lang.str_replace(lang.base_1, str );
lang['str_replace'] = function (obj, str) {
    return obj.split('{replace1}').join(str);
}

// 배열과 랭팩 obj를 넘겨주면 replace1,replace2 등등의 키값을 생성하여 해당 문구에 바인딩
lang['str_replace_arr'] = function (langObj, arr) {
    // 객체 생성
    var replaceArr = {};

    // 키값 생성 후 값 할당
    for (var i = 0; i < arr.length; i++) {
        replaceArr['replace' + (i + 1)] = arr[i];
    }

    // 해당 랭팩의 문구를 가져와
    var str = langObj;
    for (var key in replaceArr) {
        // {replace1},{replace2},{replace3}... 차례대로 값 할당
        str = str.split('{' + key + '}').join(replaceArr[key]);
    }
    return str;
}

//base
lang['base_1'] = 'Please enter your Facebook log in email';
lang['base_2'] = 'The URL was copied successfully';
lang['base_3'] = 'Please use Ctrl+C to copy';
lang['base_4'] = 'Please log in using the email you registered with';
lang['base_5'] = 'This is only available to members with unlimited access';
lang['base_6'] = 'Your Facebook log in account was successfully changed into an ordinary account. The password has been sent to your inbox.';
lang['base_7'] = 'Please enter your email and password.'; //@CHANGE
lang['base_8'] = 'Please enter a valid email address.';
lang['base_9'] = 'Please enter your password';
lang['base_10'] = 'Password must contain at least {0} characters';
lang['base_11'] = 'Password cannot contain more than {0} characters';
lang['base_12'] = '{0} is already in use';
lang['base_13'] = 'Password must contain only letters, numbers, and underscores';
lang['base_14'] = 'Please enter your password a second time to confirm it';
lang['base_15'] = 'Your password or email is not the same';
lang['base_16'] = 'Please agree to the Terms of Service';
lang['base_17'] = 'Please agree to the Privacy Policy ';
lang['base_18'] = 'Please use a number';
lang['base_19'] = 'Please use a number';
lang['base_20'] = 'Please use at least {0} characters for your password';
lang['base_21'] = 'Please only use up to {0} characters for your password';
lang['base_22'] = 'Please enter your phone number';
lang['base_23'] = 'Please enter what you are looking for';

//webtoon
lang['webtoon_1'] = 'Successfully added to favorites';
lang['webtoon_2'] = 'Successfully removed from favorites';
lang['webtoon_3'] = 'To free series home page';
lang['webtoon_4'] = 'You have read the latest updated content';
lang['webtoon_5'] = 'You have read the latest episode';
lang['webtoon_6'] = 'Preview the next chapter';
lang['webtoon_7'] = 'Read next chapter';
lang['webtoon_8'] = 'Super popular webtoons';
lang['webtoon_9'] = 'To paid series home page';
lang['webtoon_10'] = 'Would you like to read the latest popular series?';
lang['webtoon_11'] = 'Not enough coins';
lang['webtoon_12'] = 'Nothing has been selected! Please select \n chapters :)';
lang['webtoon_13'] = 'Please fill the required fields';
lang['webtoon_14'] = 'Please enter the type of report.';
lang['webtoon_15'] = 'Please enter your reason for reporting.';
lang['webtoon_16'] = 'Unable to purchase a series that has finished serialization';
lang['webtoon_17'] = 'Not enough coins';
lang['webtoon_18'] = 'Please enter the content';
lang['webtoon_19'] = 'Please fill the required fields';
lang['webtoon_20'] = 'Please enter the type of report.';
lang['webtoon_21'] = 'Please enter your reason for reporting.';
lang['webtoon_22'] = 'Removed from Favorites.';

//detail
lang['detail_1'] = 'You are already on the first page. Would you like to go to the previous chapter?';
lang['detail_2'] = 'First chapter';
lang['detail_3'] = 'You are already on the last page. Would you like to go to the next chapter?';
lang['detail_4'] = 'This is the last chapter';
lang['detail_5'] = 'Next';
lang['detail_6'] = 'Previous';
lang['detail_7'] = 'Go to next Episode';
lang['detail_8'] = 'Go to previous Episode';
lang['detail_9'] = 'Last Episode';
lang['detail_10'] = 'Latest Episode';
lang['detail_11'] = 'Swipe again to return to the Episode List';
lang['detail_12'] = 'Next Page';
lang['detail_13'] = 'Previous Page';


// mypage
lang['mypage_1'] = 'Are you sure you want to delete the selected series?';
lang['mypage_2'] = 'Are you sure you want to delete your account? \n\n If there is anything we can improve on, please let us know.  \n\n We will strive to provide a better experience for you.';
lang['mypage_3'] = 'Your payment plan was canceled.';
lang['mypage_4'] = 'Subscription could not be renewed.\n Please contact our Customer Service Center';
lang['mypage_5'] = 'Once your subscription is canceled,  {replace1}，\nyour access will not be automatically renewed.\n Are you sure you want to cancel your subscription?';
lang['mypage_6'] = 'Once you cancel your unlimited access voucher, ({replace1})You will not be able to access the service for 90 days after the expiration date. \n Are you sure you will cancel the plan?';
lang['mypage_7'] = 'Your subscription will expire on \n{replace1}.\n Are you sure you want to cancel your subscription?'
lang['mypage_8'] = 'Automatic subscription renewal has been canceled.';
lang['mypage_9'] = 'Cancellation of your subscription could not be completed \n please contact our Customer Service Center.';
lang['mypage_10'] = 'Coin purchases can be made from {replace1} quantity onwards.';
lang['mypage_11'] = 'You are currently using this service.';
lang['mypage_12'] = 'You can repurchase this unlimited access voucher after "{replace1}';
lang['mypage_13'] = 'Your unlimited access voucher grants you access to currently serialized comics. Please remember to cancel the standard vomic voucher, after purchasing the unlimited access voucher.';
lang['mypage_14'] = 'You are currently using this service.';
lang['mypage_15'] = 'Please enter your original password!';
lang['mypage_16'] = 'Password must contain at least {0} characters';
lang['mypage_17'] = 'Password must contain at least {0} characters';
lang['mypage_18'] = 'Password cannot contain more than {0} characters';
lang['mypage_19'] = 'Please enter a new password!';
lang['mypage_20'] = 'Passwords do not match';
lang['mypage_21'] = 'Are you sure you want to change your password?';
lang['mypage_22'] = 'You can repurchase an unlimited access voucher after "{replace1}';
lang['mypage_23'] = 'You are currently using this service';
lang['mypage_24'] = '<em class="text-red">30 day unlimited access voucher<br/>automatically renew</em>';
lang['mypage_25'] = 'You are currently using this service';
lang['mypage_26'] = '<em class="text-red">30 day unlimited access voucher<br/>automatic renewal</em>';
lang['mypage_27'] = '<em class="text-red">30 day unlimited access voucher<br/>automatically renewal</em>';
lang['mypage_28'] = '<em class="text-red">30 day unlimited access voucher<br/>automatically renewal</em>';
lang['mypage_29'] = 'You are currently using this service';
lang['mypage_30'] = 'You can repurchase an unlimited access voucher after "{replace1}';
lang['mypage_31'] = 'Your unlimited access voucher grants you access to currently serialized comics. Please remember to cancel the standard vomic voucher, after purchasing the unlimited access voucher';
lang['mypage_32'] = 'You are currently using this service';
lang['mypage_33'] = 'Please agree to the Terms of Service';
lang['mypage_34'] = 'Event : {replace1}coin + {replace2}coin';
lang['mypage_35'] = 'Purchase {replace1} vouchers';
lang['mypage_36'] = '<em class="text-red">Total {replace1} vouchers</em><small>({replace2} + {replace3} additional vouchers<span class="text-cyan"> + {replace4}</span>)</small>';
lang['mypage_37'] = '<em class="text-red">Total {replace1} vouchers</em><small>({replace2} + additional vouchers {replace3})</small>';
lang['mypage_38'] = 'Copied successfully';
lang['mypage_39'] = 'Please use Ctrl+C to copy';
lang['mypage_40'] = 'Update failed';
lang['mypage_41'] = '<tr><td>{replace1}</td><td><span class="font-ellipsis">{replace2}</span></td><td>{replace2} episodes </td><td><a href="{replace4}" title="read now">{replace5}</a></td></tr>';
lang['mypage_42'] = 'This is the last page';
lang['mypage_43'] = 'The selected series has been deleted';
lang['mypage_44'] = 'Once you cancel your unlimited access voucher, ({replace1})You will not be able to access the service for 90 days after the expiration date';
lang['mypage_45'] = 'Automatic renewal({replace1}) Will you cancel this service?\n this change will take effect from the following month';
lang['mypage_46'] = 'Please enter the original password!';
lang['mypage_47'] = 'Password must contain only letters, numbers, and underscores';
lang['mypage_48'] = 'Password must contain at least {0} characters';
lang['mypage_49'] = 'Password cannot contain more than {0} characters';
lang['mypage_50'] = 'Please enter a new password!';
lang['mypage_51'] = 'Are you sure you want to change your password?';
lang['mypage_52'] = 'Do you really want to delete your membership?';
lang['mypage_53'] = '(Vouchers)';
lang['mypage_54'] = 'Current series';
lang['mypage_55'] = 'Vouchers';
lang['mypage_56'] = 'Are you sure you want to cancel your VIP Membership?';
lang['mypage_57'] = "Please select your cancellation reason";
lang['mypage_58'] = "This mobile number is invalid";
lang['mypage_59'] = "Get Code";
lang['mypage_60'] = "Resend Code";

// payment
lang['payment_1'] = 'Please enter the field.';
lang['payment_2'] = 'Please enter a card number between 13~16 characters.';
lang['payment_3'] = 'The expiry date you entered is invalid.';
lang['payment_4'] = 'Request Purchase';
lang['payment_5'] = 'In progress..';
lang['payment_6'] = 'There is no card associated with this number.';
lang['payment_7'] = 'Card number';
lang['payment_8'] = 'CVV';
lang['payment_9'] = 'MM';
lang['payment_10'] = 'YY';
lang['payment_11'] = 'The card number is invalid.';

// auth (모바일)
lang['auth_1'] = 'Currently in use: {0}';
lang['auth_2'] = 'Please enter your email and password.'; //@CHANGE
lang['auth_3'] = 'Please enter a valid email address.';
lang['auth_4'] = 'Please enter a password';
lang['auth_5'] = 'Password must contain at least {0} characters';
lang['auth_6'] = 'Password cannot contain more than {0} characters';
lang['auth_7'] = 'Please enter the same password to confirm';
lang['auth_8'] = 'Please enter at least {0} characters';
lang['auth_9'] = 'Please enter no more than {0} characters';
lang['auth_10'] = 'Passwords do not match';
lang['auth_11'] = 'Please agree to the Terms of Service';

// 쿠폰
lang['coupon_1'] = 'Log in to use';
lang['coupon_2'] = 'Please enter the correct coupon code';
lang['coupon_3'] = 'Log in to use';
lang['coupon_4'] = 'Please enter the correct coupon code';
lang['coupon_5'] = 'Promotion page';
lang['coupon_6'] = 'Please go to the promotion page to confirm';
lang['coupon_7'] = 'Current Series';
lang['coupon_8'] = 'Current series available for unlimited viewing';
lang['coupon_9'] = 'Vouchers';
lang['coupon_10'] = 'Please go to the promotion page on the side menu to confirm';

// date message
lang['date_msg_1'] = "Just now"; // second
lang['date_msg_2'] = "%s sec %s"; // seconds
lang['date_msg_3'] = "1 min %s"; // minute
lang['date_msg_4'] = "%s min %s"; // minutes
lang['date_msg_5'] = "1 hour %s"; // hours
lang['date_msg_6'] = "%s hours %s"; // hour
lang['date_msg_7'] = "1 day %s"; // day
lang['date_msg_8'] = "%s days %s"; // days
lang['date_msg_9'] = "1 week %s"; // week
lang['date_msg_10'] = "%s weeks %s"; // weeks
lang['date_msg_11'] = "1 month %s"; // month
lang['date_msg_12'] = "%s months %s"; // months
lang['date_msg_13'] = "1 year %s"; // year
lang['date_msg_14'] = "%s year %s"; // year
lang['date_msg_15'] = "Yesterday"; // Yesterday
lang['date_msg_16'] = "2 days ago"; // beforeYesterday
lang['date_msg_17'] = "Tomorrow"; // tomorrow
lang['date_msg_18'] = "The day after tomorrow"; // afterTomorrow
lang['date_msg_19'] = "later"; // afterSuffix
lang['date_msg_20'] = "ago"; // beforeSuffix

// 연령 확인
lang['age_verification_1'] = 'Please select your date of birth.';
lang['age_verification_2'] = 'You are not over the age of 18.';
lang['age_verification_3'] = 'Please enter the correct phone number.';
lang['age_verification_4'] = 'Verification number sent!';
lang['age_verification_5'] = 'The message may take a few minutes to arrive.<br>If you have not received the mssage, please press the resend button.';
lang['age_verification_6'] = 'Resend in {replace1}s';
lang['age_verification_7'] = 'Resend';
lang['age_verification_8'] = 'Verification completed';
lang['age_verification_9'] = 'Verification number has been resent.';
lang['age_verification_10'] = 'Phone Verification';
lang['age_verification_11'] = 'In order to verify your age, we require your phone number.<br>Please enter your phone number and press the Send button.';
