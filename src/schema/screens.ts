/* App screen inventory: which tables and endpoints each screen of the customer app and staff panel uses. */

export interface ScreenSection {
  panel: "customer" | "staff";
  key: string;
  title: string;
  en: string;
  tables: string[];
  endpoints: string[]; // "METHOD path"
  frames: [string, string][]; // [nodeId, name]
}

export const sections: ScreenSection[] = [
  /* ─────────── CUSTOMER ─────────── */
  {
    panel: "customer", key: "c-onboarding", title: "اسپلش و آنبوردینگ", en: "Splash & Onboarding",
    tables: ["user_settings"], endpoints: ["GET /v1/app/version"],
    frames: [["937:22090", "Splash Screen"], ["4601:30767", "Onboarding 1 — All Salons in One Place"], ["4601:31034", "Onboarding 2 — Find Nearby Salons"], ["4601:31077", "Onboarding 3 — Choose with Confidence"], ["4601:31120", "Onboarding 4 — Book in Seconds"]],
  },
  {
    panel: "customer", key: "c-auth", title: "احراز هویت", en: "Authentication",
    tables: ["users", "otp_codes", "auth_sessions", "user_settings"], endpoints: ["POST /v1/auth/otp", "POST /v1/auth/otp/verify", "PATCH /v1/me"],
    frames: [["4331:38132", "Select Language"], ["3314:5158", "Log In"], ["3335:6561", "Log In Verification"], ["5449:36288", "Log In Verification (2)"], ["3343:6839", "Sign Up"], ["3359:14099", "Sign Up Verification"], ["3899:7228", "Complete Profile"], ["3899:10931", "Sign Up Success"]],
  },
  {
    panel: "customer", key: "c-home", title: "خانه", en: "Home",
    tables: ["salon_types", "salons", "branches", "branch_members"], endpoints: ["GET /v1/home"],
    frames: [["4592:19240", "Home — Auto"], ["4592:19290", "Home — 852"]],
  },
  {
    panel: "customer", key: "c-explore", title: "کشف، جستجو و نقشه", en: "Explore",
    tables: ["branches", "services", "service_templates", "search_history", "user_addresses", "cities"], endpoints: ["GET /v1/search", "GET /v1/search/map", "GET /v1/search/recent", "GET /v1/addresses", "POST /v1/addresses", "GET /v1/geo/autocomplete"],
    frames: [["4056:12425", "Explore (Filters)"], ["857:10385", "Map Results — Collapsed"], ["4048:10269", "Map Results — Expanded"], ["4048:9688", "Salon Card Expanded"], ["3585:5772", "Search"], ["3695:28142", "Search — Auto"], ["3807:6016", "Browse Services & Salons"], ["3812:7417", "Browse Services & Salons — Auto"], ["3822:22631", "Location Picker"], ["3829:23235", "Saved Addresses"], ["5213:36943", "Address Actions"], ["3832:23954", "Address Autocomplete"], ["3832:24203", "Add Custom Address"], ["3938:7145", "Date & Time Picker"], ["3974:10340", "Date & Time Picker — Auto"]],
  },
  {
    panel: "customer", key: "c-salon", title: "صفحه سالن", en: "View Salon",
    tables: ["branches", "salons", "services", "service_categories", "branch_members", "reviews", "portfolio_items", "branch_working_hours", "branch_media"], endpoints: ["GET /v1/branches/{id}", "GET /v1/branches/{id}/services", "GET /v1/branches/{id}/experts", "GET /v1/branches/{id}/reviews", "GET /v1/branches/{id}/portfolio", "GET /v1/branches/{id}/nearby"],
    frames: [["4592:23221", "View Salon"], ["4592:23143", "View Salon — Auto"], ["4592:23070", "Services tab"], ["4592:23007", "Experts tab"], ["4592:22951", "Reviews tab"], ["4592:22903", "Portfolio tab"], ["4592:22868", "Other (About/Hours)"], ["4592:22847", "Booking — Select Services"]],
  },
  {
    panel: "customer", key: "c-staff", title: "پروفایل متخصص", en: "Staff Profile",
    tables: ["branch_members", "users", "user_languages", "member_services", "portfolio_items", "reviews"], endpoints: ["GET /v1/experts/{member_id}"],
    frames: [["4592:28770", "Staff Profile"], ["4592:28709", "Staff Profile — Auto"]],
  },
  {
    panel: "customer", key: "c-booking", title: "فرآیند رزرو و پرداخت", en: "Booking",
    tables: ["bookings", "booking_items", "slot_holds", "discount_codes", "payments", "wallets", "escrow_holds"], endpoints: ["POST /v1/booking/availability", "POST /v1/booking/hold", "POST /v1/booking/quote", "POST /v1/bookings", "POST /v1/payments/callback/{gateway}"],
    frames: [["4592:26798", "Select Expert"], ["4592:26763", "Select Date & Time"], ["4592:26730", "Review and Confirm"], ["4592:26697", "Review and Confirm — Auto"], ["4592:26680", "Apply Discount Code"], ["4592:26649", "Review and Confirm (With Discount)"], ["4592:26619", "Payment Method"], ["4592:26589", "Payment Method — Auto"], ["4592:26559", "Payment Method (Insufficient Balance)"], ["4592:26522", "Payment Method (With Deposit)"], ["4592:26474", "Payment Details (Deposit via Gateway)"], ["4592:26426", "Payment Details — Auto"]],
  },
  {
    panel: "customer", key: "c-modals", title: "مودال‌های وضعیت", en: "Status Modals",
    tables: ["bookings", "slot_holds", "branch_working_hours"], endpoints: ["POST /v1/booking/hold"],
    frames: [["4295:14421", "Connection Error"], ["4299:41489", "Salon Closed"], ["4299:41559", "Exit Booking"], ["4300:41632", "Time Slot Taken"], ["4300:41704", "Time Conflict"], ["4300:41799", "Remove Service"]],
  },
  {
    panel: "customer", key: "c-appointments", title: "رزروهای من", en: "Appointments",
    tables: ["bookings", "booking_items", "reviews", "payments"], endpoints: ["GET /v1/bookings", "GET /v1/bookings/{id}", "POST /v1/bookings/{id}/cancel", "POST /v1/bookings/{id}/review", "POST /v1/bookings/{id}/rebook"],
    frames: [["4495:10590", "Appointments — Upcoming"], ["4496:13043", "Appointments — Past"], ["4521:10526", "View Appointment — Confirmed"], ["4521:11669", "View Appointment — Confirmed — Auto"], ["4521:12696", "View Appointment — Confirmed — Scrolled"], ["4521:12425", "View Appointment — Completed"], ["4548:11522", "Submit Review Sheet"]],
  },
  {
    panel: "customer", key: "c-profile", title: "پروفایل و تنظیمات", en: "Profile",
    tables: ["users", "wallets", "wallet_transactions", "favorites", "notifications", "user_settings", "auth_sessions", "faqs", "app_releases", "otp_codes"], endpoints: ["GET /v1/me", "PATCH /v1/me", "GET /v1/wallet/transactions", "POST /v1/wallet/topup", "GET /v1/favorites", "GET /v1/notifications", "PATCH /v1/me/settings", "GET /v1/me/sessions", "DELETE /v1/me"],
    frames: [["1088:836", "Profile"], ["3986:10573", "Profile — Auto"], ["1291:2535", "Edit Profile"], ["4351:10107", "Top Up Wallet"], ["1385:2151", "Transactions"], ["1385:2087", "Favorites"], ["1385:2215", "Notifications"], ["1337:3936", "Settings"], ["5213:36420", "Language"], ["4363:17762", "Mobile Number"], ["5212:36034", "Mobile Number Verification"], ["4363:18028", "Connected Devices"], ["1362:1515", "Support Center"], ["1371:1553", "About"], ["4425:10158", "Log Out"], ["4425:10211", "Delete Account"], ["4425:12338", "Delete Account — Blocked"], ["4425:22832", "Delete Account — Success"]],
  },
  /* ─────────── STAFF ─────────── */
  {
    panel: "staff", key: "s-auth", title: "احراز هویت پنل", en: "Authentication",
    tables: ["users", "otp_codes", "auth_sessions"], endpoints: ["POST /v1/auth/otp", "POST /v1/auth/otp/verify", "PATCH /v1/me"],
    frames: [["5449:36736", "Select Language"], ["5449:36718", "Log In"], ["5656:70451", "Log In — Invalid Number"], ["5449:36695", "Log In Verification"], ["5449:36671", "Log In Verification — Error"], ["5656:70634", "Too Many Attempts"], ["5656:71124", "Account Blocked Modal"], ["5449:36652", "Sign Up"], ["5449:36627", "Sign Up Verification"], ["5449:36604", "Complete Profile"], ["5656:70777", "Complete Profile — Validation Error"], ["5449:36589", "Sign Up Success"]],
  },
  {
    panel: "staff", key: "s-create", title: "ثبت سالن (۴ مرحله)", en: "Create Salon",
    tables: ["salons", "branches", "branch_working_hours", "verification_requests", "branch_members", "salon_types", "media_files", "cities"], endpoints: ["POST /v1/staff/salons", "POST /v1/media", "GET /v1/geo/cities"],
    frames: [["5451:51026", "Step 1 Type & Name"], ["5451:51635", "Step 1 — Filled"], ["5472:65942", "Step 1 — Name Error"], ["5656:73778", "Salon Type Sheet"], ["5451:54248", "Step 2 Branch"], ["5472:57850", "Step 2 Branch — Filled"], ["5472:58788", "Step 3 Working Hours"], ["5679:81137", "Step 3 — All Closed"], ["5656:74702", "Step 3 — Invalid Hours"], ["5472:62079", "Step 4 Role"], ["5679:83583", "Step 4 Role — Owner Only"], ["5472:63254", "Exit Modal"], ["5472:63551", "Submitted"]],
  },
  {
    panel: "staff", key: "s-join", title: "پیوستن به سالن", en: "Join Salon",
    tables: ["join_requests", "branches", "salons", "cities", "branch_members"], endpoints: ["GET /v1/staff/join/search", "POST /v1/staff/join-requests", "POST /v1/staff/join-requests/{id}/cancel"],
    frames: [["5494:31169", "Join Salon — Search"], ["5679:86503", "City Sheet"], ["5494:40923", "No Results"], ["5679:84112", "Own Salon"], ["5494:41299", "Join Request — Form"], ["5679:85451", "Form — Job Title Error"], ["5679:85701", "Form — Pending Exists"], ["5494:42661", "Pending — Sent Toast"], ["5497:43527", "Cancel Modal"], ["5499:45709", "Accepted"]],
  },
  {
    panel: "staff", key: "s-home", title: "خانه پنل (مالک / متخصص / هر دو)", en: "Home",
    tables: ["bookings", "branch_members", "join_requests", "verification_requests", "wallet_transactions"], endpoints: ["GET /v1/staff/branches/{id}/dashboard", "GET /v1/staff/my-salons", "PATCH /v1/staff/memberships/{id}/work-status"],
    frames: [["5451:48573", "Home — No Salon"], ["5703:94151", "Salon Under Review"], ["5694:92922", "Under Review — Status Sheet"], ["5694:93648", "Under Review — Edit Confirm"], ["5694:93951", "Under Review — Cancel Confirm"], ["5703:94571", "Salon Rejected"], ["5497:44329", "Request Pending"], ["5694:93338", "Request Pending — Status Sheet"], ["5694:94022", "Request Pending — Cancel Confirm"], ["5703:94968", "Request Rejected"], ["5710:26702", "Owner — First Visit"], ["5694:91076", "Owner"], ["5710:37156", "Owner & Expert — First Visit"], ["5718:46634", "Owner & Expert"], ["5718:47353", "Owner & Expert — Empty"], ["5718:48043", "Expert — First Visit"], ["5718:47974", "Expert"], ["5718:48008", "Expert — Switched Toast"], ["5718:47961", "Salon Switcher Sheet"]],
  },
  {
    panel: "staff", key: "s-bookings", title: "رزروها", en: "Appointments",
    tables: ["bookings", "booking_items", "payments", "escrow_holds", "cancel_reasons", "booking_status_logs"], endpoints: ["GET /v1/staff/branches/{id}/bookings", "GET /v1/staff/bookings/{id}", "POST /v1/staff/bookings/{id}/confirm", "POST /v1/staff/bookings/{id}/reject", "POST /v1/staff/bookings/{id}/cancel", "POST /v1/staff/bookings/{id}/complete", "POST /v1/staff/bookings/{id}/no-show"],
    frames: [["5499:47050", "Bookings — No Salon"], ["5106:12748", "Pending"], ["5543:26363", "Pending — Confirmed Toast"], ["5109:23778", "Today"], ["5109:23992", "Upcoming"], ["5499:47302", "Upcoming — Empty"], ["5109:24176", "Completed"], ["5109:24336", "Cancelled & Rejected"], ["5109:26271", "Details — Pending — Pay in Salon"], ["5539:21237", "Reject Request Sheet"], ["5109:28071", "Details — Confirmed — Pay in Salon"], ["5743:59097", "Details — Confirmed — Online Payment"], ["5539:23460", "Deposit Receipt Sheet"], ["5539:22786", "Cancel Sheet"], ["5539:23199", "Mark Done Modal"], ["5539:23352", "No Show Modal"], ["5743:59309", "Details — Completed"], ["5109:28529", "Details — Cancelled by Customer — Late"], ["5109:28884", "Details — No Show"]],
  },
  {
    panel: "staff", key: "s-calendar", title: "تقویم و نوبت دستی", en: "Calendar",
    tables: ["bookings", "booking_items", "time_offs", "branch_working_hours", "staff_working_hours", "branch_closures", "branch_customers", "users"], endpoints: ["GET /v1/staff/branches/{id}/calendar", "GET /v1/staff/branches/{id}/calendar/month", "POST /v1/staff/time-offs", "DELETE /v1/staff/time-offs/{id}", "POST /v1/staff/branches/{id}/manual-bookings", "GET /v1/staff/customers/lookup"],
    frames: [["5545:32466", "Empty (No Salon)"], ["5121:14604", "Today"], ["5771:27875", "Pending Request Day"], ["5771:31720", "Leave Day"], ["5771:35532", "Salon Closed"], ["5771:30830", "Full Month Sheet"], ["5121:16919", "Add Menu Sheet"], ["5771:36501", "Manual Booking — Returning Customer"], ["5543:25606", "Manual Booking — New Customer"], ["5543:22738", "Manual Booking — No Free Time"], ["5771:36903", "Manual Booking — Services Too Long"], ["5771:37290", "Manual Booking — Exit Confirm"], ["5127:24208", "Block Time Sheet"], ["5771:31250", "Blocked Slot Details"], ["5771:31650", "Delete Blocked Slot"], ["5126:18638", "Add Leave Sheet"], ["5771:37667", "Toast — Booking Created"], ["5771:38063", "Toast — Slot Blocked"], ["5771:38444", "Toast — Leave Added"]],
  },
  {
    panel: "staff", key: "s-profile", title: "پروفایل، سالن‌های من، درخواست‌ها", en: "Profile — Overview & Edit",
    tables: ["users", "user_languages", "branch_members", "verification_requests", "join_requests", "wallets"], endpoints: ["GET /v1/me", "PATCH /v1/me", "GET /v1/staff/my-salons", "GET /v1/staff/requests", "POST /v1/staff/memberships/{id}/leave"],
    frames: [["5789:1511", "Profile — Owner"], ["5127:25377", "Profile — Owner & Expert"], ["5789:1854", "Profile — Expert"], ["5787:49420", "Edit Profile"], ["5791:1051", "Photo Options Sheet"], ["5787:49374", "Saved Toast"], ["5787:49351", "Add Language Sheet"], ["5787:49318", "My Salons"], ["5800:40428", "Leave Salon Modal"], ["5808:1112", "Left Salon Toast"], ["5637:40209", "My Requests — Empty"], ["5793:53104", "My Requests"], ["5800:39497", "Request Cancelled Toast"], ["5793:53976", "Salon Request — In Review"], ["5793:54334", "Needs Changes"], ["5800:28612", "Approved"], ["5800:28829", "Cancel Modal"], ["5805:3767", "Cancelled"]],
  },
  {
    panel: "staff", key: "s-services", title: "خدمات و قیمت‌ها", en: "Services & Prices",
    tables: ["services", "service_categories", "member_services"], endpoints: ["GET /v1/staff/branches/{id}/services", "POST /v1/staff/branches/{id}/services", "PATCH /v1/staff/services/{id}", "DELETE /v1/staff/services/{id}", "PATCH /v1/staff/memberships/{id}/services/{service_id}"],
    frames: [["5616:55680", "Expert — Empty"], ["5129:39429", "Expert"], ["5616:63292", "Expert — Disabled Toast"], ["5616:55142", "Owner — Empty"], ["5616:56068", "Owner — No Results"], ["5543:36712", "Owner"], ["5562:37882", "Add Service"], ["5562:50085", "Edit Service"], ["5565:51271", "Delete Modal"]],
  },
  {
    panel: "staff", key: "s-hours", title: "ساعات کاری و مرخصی‌ها", en: "Working Hours & Leaves",
    tables: ["staff_working_hours", "branch_working_hours", "time_offs"], endpoints: ["GET /v1/staff/memberships/{id}/hours", "PUT /v1/staff/memberships/{id}/hours", "PUT /v1/staff/branches/{id}/hours"],
    frames: [["5616:57430", "Expert"], ["5616:59862", "Owner"], ["5616:57394", "Add Sheet"], ["5616:57388", "Delete Block Modal"], ["5616:60664", "Salon Hours — Edit"], ["5616:60322", "My Hours — Conflict"]],
  },
  {
    panel: "staff", key: "s-crm", title: "مشتریان و نظرات", en: "Reviews & Clients",
    tables: ["branch_customers", "customer_notes", "reviews", "review_reports", "bookings"], endpoints: ["GET /v1/staff/branches/{id}/customers", "GET /v1/staff/branch-customers/{id}", "PUT /v1/staff/branch-customers/{id}/note", "GET /v1/staff/branches/{id}/reviews", "POST /v1/staff/reviews/{id}/report"],
    frames: [["5601:53009", "Reviews — Empty"], ["5601:53428", "Reviews — Filter Empty"], ["5177:19481", "Reviews"], ["5302:29503", "Report Modal"], ["5616:54118", "My Customers — No Results"], ["5302:29719", "My Customers"], ["5616:53750", "My Customers — Empty"], ["5302:31730", "Customer File"]],
  },
  {
    panel: "staff", key: "s-portfolio", title: "پروفایل حرفه‌ای و نمونه‌کار", en: "Professional Profile & Portfolio",
    tables: ["branch_members", "portfolio_items", "media_files"], endpoints: ["PATCH /v1/staff/memberships/{id}/profile", "POST /v1/staff/memberships/{id}/portfolio", "PUT /v1/staff/memberships/{id}/portfolio/order", "DELETE /v1/staff/portfolio/{id}"],
    frames: [["5601:42792", "Professional Profile — Empty"], ["5601:41907", "Professional Profile"], ["5601:41632", "Edit Professional Profile"], ["5180:32358", "Portfolio — Reorder"], ["5302:28296", "Add Item"], ["5302:28468", "Add Item — Selected"], ["5302:29371", "Item Sheet"], ["5601:43041", "Delete Modal"]],
  },
  {
    panel: "staff", key: "s-salon-info", title: "اطلاعات سالن و شعبه", en: "Salon & Branch Info",
    tables: ["salons", "branches", "branch_media", "branch_categories", "verification_requests"], endpoints: ["GET /v1/staff/salons/{id}", "PATCH /v1/staff/salons/{id}", "PATCH /v1/staff/branches/{id}", "POST /v1/staff/salons/{id}/branches", "DELETE /v1/staff/branches/{id}"],
    frames: [["5616:65351", "Salon & Branch Info"], ["5632:70902", "Salon Info"], ["5632:72157", "Salon Info — Confirm Modal"], ["5632:72723", "Add Branch — Step 1"], ["5632:72694", "Add Branch — Step 2 Hours"], ["5632:72654", "Add Branch — Step 3 Role"], ["5632:72641", "Add Branch — Submitted"]],
  },
  {
    panel: "staff", key: "s-team", title: "تیم و درخواست‌های همکاری", en: "Team & Join Requests",
    tables: ["branch_members", "join_requests", "member_services", "staff_working_hours"], endpoints: ["GET /v1/staff/branches/{id}/team", "GET /v1/staff/members/{id}", "DELETE /v1/staff/members/{id}", "GET /v1/staff/branches/{id}/join-requests", "POST /v1/staff/join-requests/{id}/accept", "POST /v1/staff/join-requests/{id}/reject"],
    frames: [["5632:76856", "Team — Empty"], ["5632:77100", "Team"], ["5632:78404", "Join Requests Empty"], ["5632:77200", "Join Requests"], ["5651:30537", "Review Request"], ["5651:30899", "Reject Request Modal"], ["5651:31964", "Member Detail"], ["5651:51269", "Remove Member Modal"]],
  },
  {
    panel: "staff", key: "s-income", title: "درآمد و تنظیمات", en: "Income & Settings",
    tables: ["wallets", "wallet_transactions", "withdrawals", "bank_accounts", "user_settings"], endpoints: ["GET /v1/staff/salons/{id}/wallet", "POST /v1/staff/salons/{id}/withdrawals", "PATCH /v1/me/settings"],
    frames: [["5651:51803", "Income — Empty"], ["5302:54997", "Income & Transactions"], ["5330:55850", "Settings"]],
  },
];

export const screenCount = sections.reduce((a, s) => a + s.frames.length, 0);
