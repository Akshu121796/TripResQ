import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldCheck,
  Zap,
  Clock,
  Trash2,
  Check,
  User,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  MapPin,
  Filter,
  Star,
  Send,
  Upload,
  Sparkles,
  LogOut,
  CheckCircle,
  Shield,
  Globe,
  Flame,
  AlertCircle,
  Calendar,
  Edit3,
  RefreshCw
} from 'lucide-react';
import './App.css';
import { RecoveryControl } from './components/recovery';
import { RiskRadar } from './components/risk';
import { DiningHub } from './components/dining';
import OnboardingGuide from './components/OnboardingGuide';

// --- i18n Translation Dictionary ---
const TRANSLATIONS = {
  en: {
    logo: "TripResQ",
    navHome: "Home",
    navMyTrips: "My Trips",
    navRestaurants: "Dining",
    navSupport: "Support Hub",
    navChaos: "⚡ Chaos Lab",
    signIn: "Sign In",
    signOut: "Sign Out",
    welcome: "Welcome",
    
    // Home Page
    tagline: "Book Seamlessly. Travel Resiliently.",
    subTagline: "TripResQ is the world's first consumer travel platform with a built-in Disruption Recovery Engine. If connections fail, we automatically rebook alternatives in seconds—at no cost to you.",
    protectionBadge: "Auto-Rebooking Guard Included",
    searchDeals: "Build & Protect Journey",
    flightTab: "✈️ Flights",
    trainTab: "🚆 Trains",
    hotelTab: "🏨 Hotels",
    cabTab: "🚕 Cabs",
    fromLabel: "From Location",
    toLabel: "To Location",
    dateLabel: "Departure Date",
    timeLabel: "Departure Time",
    durationLabel: "Duration (Minutes)",
    airwaysLabel: "Airways Name",
    trainNameLabel: "Train Name / Number",
    cabServiceLabel: "Cab Operator / Service",
    hotelNameLabel: "Hotel Name",
    addNodeBtn: "➕ Add Node to Itinerary",
    lockTripBtn: "🛡️ Lock & Protect Itinerary",
    livePreview: "Live Itinerary Preview Chain",
    authPromptTitle: "Sign In to Protect Your Trip",
    authPromptDesc: "Build your custom travel routes and let our engine automatically safeguard your connections from cascading delays.",
    noNodesYet: "No travel nodes added yet. Add a Flight, Train, Cab, or Hotel above to start building your timeline.",
    typePlaceholder: "Type location...",
    
    freeCancellation: "Free cancellation up to 24h & automatic missed connection protection.",
    howItWorks: "Smart Trip Protection, Reimagined",
    marketingTitle1: "Automatic Rebooking",
    marketingDesc1: "If your train or flight is delayed, our system instantly triggers alternate travel vectors so you never miss a connection.",
    marketingTitle2: "Real-Time Risk Alerts",
    marketingDesc2: "We track weather, rail lines, and airports. Get proactive notifications before disruptions cascade, putting you in control.",
    marketingTitle3: "We've Got Your Back",
    marketingDesc3: "Rest easy knowing you have free, automatic replacement bookings or 100% refund claims processed within minutes.",

    // Timeline Page
    tripHeaderTitle: "Your Journey to",
    tripReference: "Trip Reference",
    backToBookings: "Back to Bookings",
    emailItinerary: "Email Itinerary",
    healthyTitle: "Your Journey is Protected",
    healthyDesc: "TripResQ is active. All departures are operating on schedule and your buffers are fully safe.",
    disruptTitle: "Connection Disrupted",
    disruptDesc: "A disruption was detected. Your transit schedule has slipped, risking downstream connections.",
    viewRescuePlans: "View Smart Rescue Plans",
    timelineTitle: "Chronological Route Timeline",
    scheduled: "SCHEDULED",
    actual: "ACTUAL",
    bufferLabel: "Buffer",
    missed: "Missed",
    lateArrival: "Late Arrival Risk",
    onTime: "On Time",
    delayed: "Delayed",
    connectionBroken: "Connection Broken",
    missedConnection: "Missed Connection",
    generalDisruption: "General",

    // Rescue Page
    rescueHeader: "We've got you covered.",
    rescueSub: "Due to the disruption on your transit node, we calculated that your downstream bookings are compromised. Select a recovery plan below.",
    backToTimeline: "View Disrupted Timeline",
    planFastest: "⚡ The Fastest Plan",
    planBudget: "💰 The Budget Plan",
    planRefund: "💸 Max Refund Plan",
    acceptPlan: "Accept Plan",
    free: "FREE",
    refund: "Refund",
    fastestTitle: "⚡ Express Route Shift",
    fastestDesc: "Rescheduled Premium Transit",
    fastestDetails: "Reschedule transit to next immediate express connection. All downstream cab pick-up schedules are automatically shifted. Hotel notified of late arrival.",
    transitShift: "Transit Shift",
    nextDepartureRescheduled: "Next Departure (Rescheduled)",
    cabPickup: "Cab Pickup",
    updatedAutomatically: "Updated Automatically",
    hotelCheckin: "Hotel Check-in",
    warningAlertDispatched: "Warning Alert Dispatched",
    tripresqCost: "TripResQ Cost",
    processing: "Processing...",
    tripRecoveredTitle: "Trip Recovered!",
    tripRecoveredDesc: "We've updated your itinerary vouchers and notified the cab operator and hotel staff. Your new boarding pass is on its way.",
    updatingTimeline: "Updating timeline view...",
    
    budgetTitle: "💰 Delayed Coach Reschedule",
    budgetDesc: "Off-Peak Transit Reschedule",
    budgetDetails: "Reschedule to later connecting transit node. Minimizes immediate cost by absorbing longer delay, backed by compensation voucher.",
    delayedByHours: "Delayed by 3.5 hrs",
    compensation: "Compensation",
    travelVoucher: "₹600 Travel Voucher",
    postponedReservation: "Postponed Reservation",
    compensationCredit: "Compensation Credit",
    creditBack: "₹600 Credit Back",

    refundTitle: "💸 Max Refund Claim",
    refundDesc: "Cancel & Full Claim",
    refundDetails: "Cancel all disrupted and downstream nodes immediately. Initiate 100% refund claims processed under TripResQ protective clauses.",
    refundEligible: "Refund Eligible",
    fullRefund: "100% Full Refund",
    immediateInitiated: "Immediate Initiated",
    cancellationCost: "Cancellation Cost",
    freeFee: "₹0 Fee",
    refundAmount: "Refund Amount",
    fullRefundClaim: "100% Refund",

    // Chaos Lab
    chaosTitle: "Demo Sandbox & Chaos Lab",
    chaosDesc: "Test our cascading disruption engine. Select a booking node, choose a disruption parameter, and watch TripResQ calculate downstream impact.",
    selectNode: "Select Booking Node to Disrupt",
    disruptType: "Disruption Type",
    delayAmount: "Delay Duration (Minutes)",
    disruptReason: "Disruption Reason",
    triggerBtn: "Trigger Cascading Disruption",
    resetBtn: "Reset Journey to On-Time",
    impactTitle: "Cascade Impact Metrics",
    downstreamDelay: "Downstream Delay",
    brokenConnections: "Broken Connections",
    affectedNodes: "Affected Nodes Count",
    disruptionParams: "Disruption Parameters",
    minsLabel: "Mins",
    realTimeGraphImpact: "Real-Time Graph Impact",
    graphImpactDesc: "Our ripple-effect calculator runs a dependency check on nodes sequentially. If a predecessor's arrival slips past the successor's buffer window, the node triggers a connection breach state.",
    delayOption: "⏱️ Delay",
    cancelOption: "❌ Cancellation",
    lockoutOption: "🔒 Terminal Lockout",
    weatherReason: "Severe Weather & Thunderstorms",
    mechReason: "Mechanical Failure & Engine Stall",
    trafficReason: "Rail/Air Traffic Congestion",
    securityReason: "Security Lockdown Alert",

    // Dining Page
    diningTitle: "Local Dining & Bites Near You",
    diningDesc: "Curated local eateries near your destination hub or hotel. Selected for high hygiene and transit speed.",
    vegOnly: "Pure Veg",
    specialties: "Local Specialties",
    fastDelivery: "Fast Delivery",
    open247: "Open 24/7",
    all: "All Restaurants",
    kmAway: "km from destination",
    rating: "Rating",
    avgCost: "Avg. Cost for 2",
    bookTable: "Book Table",
    tableBookedSuccess: "Table booked successfully at",
    noDiningTitle: "No dining options match this filter",
    noDiningDesc: "Try changing your filter selections above.",

    // Support Page
    supportTitle: "Support & Help Center",
    supportDesc: "24/7 emergency response, interactive FAQ, feedback forms, and bug reporter.",
    faqTab: "FAQ & Assistance",
    bugTab: "Report a Bug",
    feedbackTab: "Share Feedback",
    faqTitle: "Frequently Asked Questions",
    chatbotTitle: "AI Travel Assistant",
    chatbotSub: "Ask about delays, rebookings, and refund policies.",
    chatPlaceholder: "Type your query here...",
    chatSend: "Send",
    sosHelpline: "24/7 SOS Helpline",
    sosDesc: "Call our high-priority support deck immediately.",
    bugTitle: "Submit Bug / Platform Issue",
    bugSummary: "Issue Summary",
    bugSteps: "Steps to Reproduce",
    bugSeverity: "Severity Level",
    bugScreenshot: "Drag & drop a screenshot, or click to upload (Mock)",
    bugSubmit: "Submit Bug Report",
    feedbackTitle: "Rate Your Experience",
    feedbackSub: "We continuously refine our recovery models based on passenger feedback.",
    feedbackComment: "Write your review comments here...",
    feedbackSubmit: "Submit Feedback",
    reportSuccessTitle: "Report Submitted Successfully",
    reportSuccessDesc: "Thank you! Ticket ID: #",
    reportSuccessSub: "Our engineers are on it.",
    feedbackSuccessTitle: "Feedback Submitted",
    feedbackSuccessDesc: "Thank you for rating your experience! We appreciate your input.",
    tapToRate: "Tap to Rate",
    feedbackTags: "Feedback Tags",
    severityLow: "Low - UI/Text Glitch",
    severityMedium: "Medium - Feature Flaw",
    severityHigh: "High - Crash / State Loop",
    severityCritical: "Critical - Disruption Calculations Failure",
    chatbotChipDelay: "⏱️ delayed transit",
    chatbotChipRefund: "💸 refunds",
    chatbotChipHotel: "🏨 hotel checks",
    chatbotDefaultResponse: "I understand your query. Your TripResQ Protection Guard is active. If any transit node is delayed or cancelled, you can click on '⚡ Chaos Lab' to trigger a test disruption, then view the recovery options on the 'My Trips' timeline.",
    chatbotDelayResponse: "If a delay is detected (like the 3-hour delay simulated in Chaos Lab), our system flags compromised connections and offers three rescue plans: Fastest, Budget (with vouchers), and Max Refund. Go to the 'My Trips' timeline and click 'View Smart Rescue Plans' to see them!",
    chatbotRefundResponse: "Under TripResQ protection guidelines, if your trip is compromised and you choose to cancel, the 'Max Refund Plan' guarantees a 100% refund on all connected bookings. Refunds are processed immediately!",
    chatbotHotelResponse: "Yes, both cab reschedules and hotel arrival warnings are automated. Once you accept a recovery plan, we automatically notify our transport and lodging partners.",

    // Auth
    authTitle: "Sign In / Register",
    signInTab: "Sign In",
    signUpTab: "Create Account",
    fullName: "Full Name",
    emailOrPhone: "Email Address / Mobile Number",
    password: "Password",
    rememberMe: "Remember me",
    forgotPass: "Forgot Password?",
    socialSignIn: "Or sign in with",
    googleSignIn: "Google Account",
    otpSignIn: "Phone OTP verification",
    signUpBtn: "Sign Up & Register",
    secureVerification: "Secure verification via TripResQ Protection Shield",
    googleUser: "Google Traveler",
    otpUser: "OTP User",

    // Global
    allRightsReserved: "© 2026 TripResQ Technologies Inc. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfProtection: "Terms of Protection",
    contactHelpDesk: "Contact Help Desk",
    callSos: "Call SOS",
    simulateDelaysTitle: "Simulate Delays in the Chaos Lab",
    simulateDelaysDesc: "To mock complex multi-node failures and explore our instant auto-rebooking engine, use the dedicated ⚡ Chaos Lab sandbox at the top right of the navigation bar.",
    openSandbox: "Open Sandbox"
  },
  hi: {
    logo: "ट्रिपरेस्क्यू (TripResQ)",
    navHome: "होम",
    navMyTrips: "मेरी यात्राएं",
    navRestaurants: "भोजन",
    navSupport: "सहायता केंद्र",
    navChaos: "⚡ कैओस लैब",
    signIn: "लॉग इन करें",
    signOut: "लॉग आउट",
    welcome: "स्वागत है",
    
    tagline: "सहजता से बुक करें। सुरक्षित यात्रा करें।",
    subTagline: "TripResQ अंतर्निहित व्यवधान सुधार इंजन के साथ दुनिया का पहला यात्रा मंच है। यदि कोई कनेक्शन विफल होता है, तो हम बिना किसी अतिरिक्त लागत के सेकंडों में विकल्प बुक करते हैं।",
    protectionBadge: "ऑटो-रीबुकिंग सुरक्षा शामिल",
    searchDeals: "यात्रा बनाएं और सुरक्षित करें",
    flightTab: "✈️ उड़ानें",
    trainTab: "🚆 ट्रेनें",
    hotelTab: "🏨 होटल",
    cabTab: "🚕 कैब",
    fromLabel: "प्रस्थान स्थान",
    toLabel: "गंतव्य स्थान",
    dateLabel: "प्रस्थान की तारीख",
    timeLabel: "प्रस्थान का समय",
    durationLabel: "अवधि (मिनट)",
    airwaysLabel: "एयरलाइंस का नाम",
    trainNameLabel: "ट्रेन का नाम / नंबर",
    cabServiceLabel: "कैब सेवा प्रदाता",
    hotelNameLabel: "होटल का नाम",
    addNodeBtn: "➕ यात्रा कार्यक्रम में नोड जोड़ें",
    lockTripBtn: "🛡️ यात्रा कार्यक्रम लॉक और सुरक्षित करें",
    livePreview: "लाइव यात्रा कार्यक्रम पूर्वावलोकन",
    authPromptTitle: "अपनी यात्रा सुरक्षित करने के लिए लॉग इन करें",
    authPromptDesc: "अपने पसंदीदा यात्रा मार्ग बनाएं और हमारे व्यवधान सुधार इंजन को आपके कनेक्शन सुरक्षित करने दें।",
    noNodesYet: "अभी तक कोई यात्रा नोड नहीं जोड़ा गया है। अपनी टाइमलाइन बनाने के लिए ऊपर एक उड़ान, ट्रेन, कैब या होटल जोड़ें।",
    typePlaceholder: "स्थान का नाम लिखें...",

    freeCancellation: "24 घंटे पहले तक मुफ्त रद्दीकरण और स्वचालित सुरक्षा सुविधा।",
    howItWorks: "स्मार्ट यात्रा सुरक्षा, नए रूप में",
    marketingTitle1: "स्वचालित रीबुकिंग",
    marketingDesc1: "यदि आपकी ट्रेन या उड़ान में देरी होती है, तो हमारा सिस्टम तुरंत अन्य विकल्प सक्रिय करता है ताकि आप यात्रा मिस न करें।",
    marketingTitle2: "रीअल-टाइम चेतावनी",
    marketingDesc2: "हम मौसम, रेल लाइनों और हवाई अड्डों पर नज़र रखते हैं। किसी भी संकट से पहले आपको चेतावनी दी जाती है ताकि आप नियंत्रण में रहें।",
    marketingTitle3: "हम आपके साथ हैं",
    marketingDesc3: "निश्चिंत रहें, व्यवधान के कुछ ही मिनटों के भीतर मुफ्त रिप्लेसमेंट बुकिंग या 100% रिफंड प्रक्रिया शुरू हो जाती है।",

    tripHeaderTitle: "आपकी यात्रा",
    tripReference: "यात्रा संदर्भ संख्या",
    backToBookings: "बुकिंग पर वापस जाएं",
    emailItinerary: "यात्रा कार्यक्रम ईमेल करें",
    healthyTitle: "आपकी यात्रा सुरक्षित है",
    healthyDesc: "TripResQ सक्रिय है। सभी प्रस्थान समय पर चल रहे हैं और बफर सुरक्षित हैं।",
    disruptTitle: "यात्रा बाधित हुई",
    disruptDesc: "व्यवधान पाया गया। आपकी यात्रा का समय बदल गया है, जिससे आगे के कनेक्शन के छूटने का जोखिम है।",
    viewRescuePlans: "स्मार्ट बचाव योजनाएं देखें",
    timelineTitle: "यात्रा का समय चक्र",
    scheduled: "निर्धारित समय",
    actual: "वास्तविक समय",
    bufferLabel: "बफ़र समय",
    missed: "छूट गया",
    lateArrival: "देर से आगमन का जोखिम",
    onTime: "समय पर",
    delayed: "विलंबित",
    connectionBroken: "कनेक्शन टूटा",
    missedConnection: "छूटा हुआ कनेक्शन",
    generalDisruption: "सामान्य",

    rescueHeader: "हमने आपकी सुरक्षा सुनिश्चित की है।",
    rescueSub: "आपकी यात्रा बाधित होने के कारण आगे की बुकिंग प्रभावित हुई है। कृपया नीचे दी गई किसी एक पुनर्प्राप्ति योजना का चयन करें।",
    backToTimeline: "बाधित समय चक्र देखें",
    planFastest: "⚡ सबसे तेज़ योजना",
    planBudget: "💰 बजट योजना",
    planRefund: "💸 अधिकतम रिफंड योजना",
    acceptPlan: "योजना स्वीकार करें",
    free: "मुफ़्त",
    refund: "रिफंड",
    fastestTitle: "⚡ एक्सप्रेस मार्ग परिवर्तन",
    fastestDesc: "पुनर्निर्धारित प्रीमियम पारगमन",
    fastestDetails: "तत्काल एक्सप्रेस कनेक्शन पर पारगमन को पुनर्निर्धारित करें। सभी डाउनस्ट्रीम कैब पिक-अप समय स्वचालित रूप से स्थानांतरित हो जाते हैं। होटल को देर से आगमन की सूचना दी जाती है।",
    transitShift: "पारगमन परिवर्तन",
    nextDepartureRescheduled: "अगला प्रस्थान (पुनर्निर्धारित)",
    cabPickup: "कैब पिकअप",
    updatedAutomatically: "स्वचालित रूप से अद्यतन",
    hotelCheckin: "होटल चेक-इन",
    warningAlertDispatched: "चेतावनी अलर्ट भेजा गया",
    tripresqCost: "ट्रिपरेस्क्यू लागत",
    processing: "प्रक्रिया जारी है...",
    tripRecoveredTitle: "यात्रा सुधारी गई!",
    tripRecoveredDesc: "हमने आपके यात्रा वाउचर अपडेट कर दिए हैं और कैब ऑपरेटर तथा होटल कर्मचारियों को सूचित कर दिया है। आपका नया बोर्डिंग पास भेजा जा रहा है।",
    updatingTimeline: "टाइमलाइन अपडेट हो रही है...",
    
    budgetTitle: "💰 विलंबित कोच पुनर्निर्धारण",
    budgetDesc: "ऑफ-पीक पारगमन पुनर्निर्धारण",
    budgetDetails: "बाद के पारगमन नोड में पुनर्निर्धारित करें। मुआवजा वाउचर द्वारा समर्थित, लंबी देरी को अवशोषित करके तत्काल लागत को कम करता है।",
    delayedByHours: "3.5 घंटे की देरी",
    compensation: "मुनावजा",
    travelVoucher: "₹600 यात्रा वाउचर",
    postponedReservation: "बुकिंग स्थगित की गई",
    compensationCredit: "मुआवजा क्रेडिट",
    creditBack: "₹600 क्रेडिट वापस",

    refundTitle: "💸 अधिकतम रिफंड दावा",
    refundDesc: "रद्द करें और पूरा दावा",
    refundDetails: "सभी बाधित और डाउनस्ट्रीम नोड्स को तुरंत रद्द करें। ट्रिपरेस्क्यू सुरक्षात्मक खंडों के तहत संसाधित 100% रिफंड दावा शुरू करें।",
    refundEligible: "रिफंड के योग्य",
    fullRefund: "100% पूर्ण रिफंड",
    immediateInitiated: "तत्काल शुरू किया गया",
    cancellationCost: "रद्दीकरण लागत",
    freeFee: "₹0 शुल्क",
    refundAmount: "रिफंड राशि",
    fullRefundClaim: "100% रिफंड",

    chaosTitle: "डेमो सैंडबॉक्स और कैओस लैब",
    chaosDesc: "हमारे व्यवधान इंजन का परीक्षण करें। एक बुकिंग नोड चुनें, देरी का पैमाना सेट करें, और देखें कि TripResQ कैसे प्रभाव की गणना करता है।",
    selectNode: "बाधित करने के लिए बुकिंग नोड चुनें",
    disruptType: "व्यवधान का प्रकार",
    delayAmount: "देरी की अवधि (मिनट)",
    disruptReason: "व्यवधान का कारण",
    triggerBtn: "व्यवधान सक्रिय करें",
    resetBtn: "यात्रा को समय पर रीसेट करें",
    impactTitle: "व्यवधान प्रभाव विवरण",
    downstreamDelay: "आगे होने वाली देरी",
    brokenConnections: "टूटे हुए कनेक्शन",
    affectedNodes: "प्रभावित नोड्स की संख्या",
    disruptionParams: "व्यवधान पैरामीटर",
    minsLabel: "मिनट",
    realTimeGraphImpact: "वास्तविक समय ग्राफ प्रभाव",
    graphImpactDesc: "हमारा तरंग-प्रभाव कैलकुलेटर नोड्स पर क्रमिक रूप से निर्भरता जांच चलाता है। यदि किसी पूर्ववर्ती का वास्तविक आगमन बाद वाले के निर्धारित समय से अधिक हो जाता है, तो नोड टूटे कनेक्शन की स्थिति में आ जाता है।",
    delayOption: "⏱️ देरी",
    cancelOption: "❌ रद्दीकरण",
    lockoutOption: "🔒 टर्मिनल लॉकडाउन",
    weatherReason: "गंभीर मौसम और गरज के साथ बारिश",
    mechReason: "यांत्रिक विफलता और इंजन खराब होना",
    trafficReason: "रेल/हवाई यातायात भीड़",
    securityReason: "सुरक्षा लॉकडाउन चेतावनी",

    diningTitle: "आपके आस-पास स्थानीय भोजन",
    diningDesc: "आपके गंतव्य स्टेशन या होटल के पास चुनिंदा भोजनालय। बेहतर स्वच्छता और तेज़ सेवा के आधार पर चुने गए।",
    vegOnly: "शुद्ध शाकाहारी",
    specialties: "स्थानीय व्यंजन",
    fastDelivery: "तेज़ डिलीवरी",
    open247: "24/7 खुला है",
    all: "सभी रेस्तरां",
    kmAway: "किमी गंतव्य से",
    rating: "रेटिंग",
    avgCost: "2 लोगों के लिए औसत लागत",
    bookTable: "टेबल बुक करें",
    tableBookedSuccess: "सफलतापूर्वक टेबल बुक की गई:",
    noDiningTitle: "कोई भोजन विकल्प इस फ़िल्टर से मेल नहीं खाता",
    noDiningDesc: "कृपया ऊपर अपने फ़िल्टर चयन बदलने का प्रयास करें।",

    supportTitle: "सहायता और प्रतिक्रिया केंद्र",
    supportDesc: "24/7 आपातकालीन प्रतिक्रिया, सामान्य प्रश्न, प्रतिक्रिया फॉर्म और बग रिपोर्टर।",
    faqTab: "सामान्य प्रश्न और सहायता",
    bugTab: "बग रिपोर्ट करें",
    feedbackTab: "प्रतिक्रिया साझा करें",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    chatbotTitle: "एआई यात्रा सहायक",
    chatbotSub: "देरी, रीबुकिंग और रिफंड नीतियों के बारे में पूछें।",
    chatPlaceholder: "यहाँ अपना प्रश्न लिखें...",
    chatSend: "भेजें",
    sosHelpline: "24/7 आपातकालीन हेल्पलाइन",
    sosDesc: "तत्काल सहायता के लिए हमारे हेल्पलाइन पर कॉल करें।",
    bugTitle: "बग / प्लेटफॉर्म समस्या सबमिट करें",
    bugSummary: "समस्या का विवरण",
    bugSteps: "समस्या दोहराने के चरण",
    bugSeverity: "गंभीरता का स्तर",
    bugScreenshot: "स्क्रीनशॉट यहाँ लाएँ, या अपलोड करने के लिए क्लिक करें (मॉक)",
    bugSubmit: "बग रिपोर्ट सबमिट करें",
    feedbackTitle: "अपने अनुभव को रेटिंग दें",
    feedbackSub: "हम यात्रियों की प्रतिक्रिया के आधार पर अपनी योजनाओं में सुधार करते हैं।",
    feedbackComment: "यहाँ अपनी समीक्षा लिखें...",
    feedbackSubmit: "प्रतिक्रिया सबमिट करें",
    reportSuccessTitle: "रिपोर्ट सफलतापूर्वक सबमिट की गई",
    reportSuccessDesc: "धन्यवाद! टिकट आईडी: #",
    reportSuccessSub: "हमारे इंजीनियर इस पर काम कर रहे हैं।",
    feedbackSuccessTitle: "प्रतिक्रिया सबमिट की गई",
    feedbackSuccessDesc: "अपने अनुभव को रेटिंग देने के लिए धन्यवाद! हम आपके इनपुट की सराहना करते हैं।",
    tapToRate: "रेटिंग देने के लिए टैप करें",
    feedbackTags: "प्रतिक्रिया टैग",
    severityLow: "कम - यूआई/टेक्स्ट गड़बड़ी",
    severityMedium: "मध्यम - फीचर दोष",
    severityHigh: "उच्च - क्रैश / स्टेट लूप",
    severityCritical: "गंभीर - व्यवधान गणना विफलता",
    chatbotChipDelay: "⏱️ विलंबित पारगमन",
    chatbotChipRefund: "💸 रिफंड",
    chatbotChipHotel: "🏨 होटल जांच",
    chatbotDefaultResponse: "मैं आपकी बात समझता हूँ। आपका ट्रिपरेस्क्यू सुरक्षा गार्ड सक्रिय है। यदि कोई पारगमन नोड विलंबित या रद्द होता है, तो आप परीक्षण व्यवधान शुरू करने के लिए '⚡ कैओस लैब' पर क्लिक कर सकते हैं, फिर 'मेरी यात्राएं' टाइमलाइन पर पुनर्प्राप्ति विकल्प देख सकते हैं।",
    chatbotDelayResponse: "यदि देरी का पता चलता है (जैसे कैओस लैब में सिम्युलेट की गई 3 घंटे की देरी), तो हमारा सिस्टम प्रभावित कनेक्शनों को चिह्नित करता है और तीन बचाव योजनाएं प्रदान करता है: सबसे तेज़, बजट (वाउचर के साथ), और अधिकतम रिफंड। इसे देखने के लिए 'मेरी यात्राएं' टाइमलाइन पर जाएं और 'स्मार्ट बचाव योजनाएं देखें' पर क्लिक करें!",
    chatbotRefundResponse: "ट्रिपरेस्क्यू सुरक्षा दिशानिर्देशों के तहत, यदि आपकी यात्रा बाधित होती है और आप रद्द करने का विकल्प चुनते हैं, तो 'अधिकतम रिफंड योजना' सभी संबंधित बुकिंग पर 100% रिफंड की गारंटी देती है। रिफंड तुरंत संसाधित किए जाते हैं!",
    chatbotHotelResponse: "हाँ, कैब पुनर्निर्धारण और होटल आगमन चेतावनी दोनों स्वचालित हैं। जैसे ही आप पुनर्प्राप्ति योजना स्वीकार करते हैं, हम स्वचालित रूप से अपने परिवहन और आवास भागीदारों को सूचित करते हैं।",

    // Auth
    authTitle: "लॉग इन / पंजीकरण",
    signInTab: "लॉग इन",
    signUpTab: "खाता बनाएं",
    fullName: "पूरा नाम",
    emailOrPhone: "ईमेल पता / मोबाइल नंबर",
    password: "पासवर्ड",
    rememberMe: "मुझे याद रखें",
    forgotPass: "पासवर्ड भूल गए?",
    socialSignIn: "या इससे लॉग इन करें",
    googleSignIn: "गुगल खाता",
    otpSignIn: "मोबाइल ओटीपी सत्यापन",
    signUpBtn: "पंजीकरण करें",
    secureVerification: "ट्रिपरेस्क्यू सुरक्षा शील्ड के माध्यम से सुरक्षित सत्यापन",
    googleUser: "गूगल यात्री",
    otpUser: "ओटीपी उपयोगकर्ता",

    // Global
    allRightsReserved: "© 2026 ट्रिपरेस्क्यू टेक्नोलॉजीज इंक। सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    termsOfProtection: "सुरक्षा की शर्तें",
    contactHelpDesk: "सहायता डेस्क से संपर्क करें",
    callSos: "एसओएस कॉल करें",
    simulateDelaysTitle: "कैओस लैब में देरी का अनुकरण करें",
    simulateDelaysDesc: "जटिल मल्टी-नोड विफलताओं का अनुकरण करने और हमारे त्वरित ऑटो-रीबुकिंग इंजन का पता लगाने के लिए, नेविगेशन बार के शीर्ष दाईं ओर समर्पित ⚡ कैओस लैब सैंडबॉक्स का उपयोग करें।",
    openSandbox: "सैंडबॉक्स खोलें"
  },
  mr: {
    logo: "ट्रिपरेस्क्यू (TripResQ)",
    navHome: "होम",
    navMyTrips: "माझ्या सहली",
    navRestaurants: "जेवण",
    navSupport: "मदत केंद्र",
    navChaos: "⚡ कॅओस लॅब",
    signIn: "लॉग इन करा",
    signOut: "लॉग आउट",
    welcome: "स्वागत आहे",
    
    tagline: "सहजतेने बुक करा. सुरक्षित प्रवास करा.",
    subTagline: "TripResQ हे अंगभूत व्यत्यय दुरुस्ती इंजिन असलेले जगातील पहिले प्रवास प्लॅटफॉर्म आहे. कनेक्शन अयशस्वी झाल्यास, आम्ही कोणत्याही अतिरिक्त खर्चाशिवाय सेकंदात पर्याय बुक करतो.",
    protectionBadge: "ऑटो-रीबुकिंग संरक्षण समाविष्ट",
    searchDeals: "प्रवास तयार करा आणि सुरक्षित करा",
    flightTab: "✈️ विमाने",
    trainTab: "🚆 रेल्वे",
    hotelTab: "🏨 हॉटेल्स",
    cabTab: "🚕 कॅब",
    fromLabel: "प्रस्थान स्थान",
    toLabel: "गंतव्य स्थान",
    dateLabel: "प्रस्थानाची तारीख",
    timeLabel: "प्रस्थानाची वेळ",
    durationLabel: "कालावधी (मिनिटे)",
    airwaysLabel: "विमान कंपनीचे नाव",
    trainNameLabel: "रेल्वेचे नाव / नंबर",
    cabServiceLabel: "कॅब ऑपरेटर / सेवा",
    hotelNameLabel: "हॉटेलचे नाव",
    addNodeBtn: "➕ प्रवासात नोड जोडा",
    lockTripBtn: "🛡️ प्रवासाची कालरेषा लॉक व सुरक्षित करा",
    livePreview: "थेट प्रवासाचे कालरेषा पूर्वावलोकन",
    authPromptTitle: "आपला प्रवास सुरक्षित करण्यासाठी लॉग इन करा",
    authPromptDesc: "तुमचे सानुकूल प्रवास मार्ग तयार करा आणि आमच्या इंजिनला तुमच्या जोडण्या वेळेवर राखू द्या.",
    noNodesYet: "अद्याप प्रवासाचे कोणतेही नोड जोडलेले नाहीत. तुमची कालरेषा तयार करण्यासाठी वर विमान, ट्रेन, कॅब किंवा हॉटेल जोडा.",
    typePlaceholder: "ठिकाण लिहा...",

    freeCancellation: "24 तास आधीपर्यंत मोफत रद्दीकरण आणि स्वयंचलित संरक्षण सुविधा.",
    howItWorks: "स्मार्ट प्रवास संरक्षण, नवीन रूपात",
    marketingTitle1: "स्वयंचलित रीबुकिंग",
    marketingDesc1: "तुमच्या ट्रेनला किंवा विमानाला उशीर झाल्यास, आमची सिस्टीम त्वरित पर्यायी प्रवास मार्ग सक्रिय करते जेणेकरून तुमचा प्रवास चुकणार नाही.",
    marketingTitle2: "रिअल-टाइम चेतावणी",
    marketingDesc2: "आम्ही हवामान, रेल्वे मार्ग आणि विमानतळांवर लक्ष ठेवतो. कोणत्याही संकटापूर्वी तुम्हाला चेतावणी दिली जाते जेणेकरून तुम्ही नियंत्रणात राहाल.",
    marketingTitle3: "आम्ही तुमच्या सोबत आहोत",
    marketingDesc3: "काळजी करू नका, व्यत्ययानंतर काही मिनिटांतच मोफत रिप्लेसमेंट बुकिंग किंवा 100% रिफंड प्रक्रिया सुरू केली जाते.",

    tripHeaderTitle: "तुमचा प्रवास",
    tripReference: "प्रवास संदर्भ संख्या",
    backToBookings: "बुकिंगवर परत जा",
    emailItinerary: "प्रवास कार्यक्रम ईमेल करा",
    healthyTitle: "तुमचा प्रवास सुरक्षित आहे",
    healthyDesc: "TripResQ सक्रिय आहे. सर्व प्रस्थान वेळेवर सुरू आहेत आणि बफर सुरक्षित आहेत.",
    disruptTitle: "प्रवासात अडथळा आला",
    disruptDesc: "व्यत्यय आढळला. तुमचे प्रवासाचे वेळापत्रक बदलले आहे, ज्यामुळे पुढील कनेक्शन चुकण्याचा धोका आहे.",
    viewRescuePlans: "स्मार्ट बचाव योजना पहा",
    timelineTitle: "प्रवासाची कालरेषा",
    scheduled: "नियोजित वेळ",
    actual: "वास्तविक वेळ",
    bufferLabel: "बफर वेळ",
    missed: "छुकले",
    lateArrival: "उशिरा पोहोचण्याचा धोका",
    onTime: "वेळेवर",
    delayed: "उशिरा",
    connectionBroken: "कनेक्शन तुटले",
    missedConnection: "चुकलेले कनेक्शन",
    generalDisruption: "सामान्य",

    rescueHeader: "आम्ही तुमचे संरक्षण करतो.",
    rescueSub: "तुमच्या प्रवासात अडथळा आल्यामुळे पुढील बुकिंग बाधित झाले आहे. कृपया खालीलपैकी एका रिकव्हरी योजनेची निवड करा.",
    backToTimeline: "बाधित प्रवासाची कालरेषा पहा",
    planFastest: "⚡ सर्वात जलद योजना",
    planBudget: "💰 बजेट योजना",
    planRefund: "💸 जास्तीत जास्त परतावा योजना",
    acceptPlan: "योजना स्वीकारा",
    free: "मोफत",
    refund: "परतावा",
    fastestTitle: "⚡ जलद मार्ग बदल",
    fastestDesc: "पुनर्निर्धारित प्रीमियम ट्रान्झिट",
    fastestDetails: "पुढील तात्काळ एक्सप्रेस कनेक्शनवर ट्रान्झिट पुनर्निर्धारित करा. सर्व डाउनस्ट्रीम कॅब पिक-अप वेळापत्रक स्वयंचलितपणे बदलले जाते. हॉटेलला उशिरा येण्याची सूचना दिली जाते.",
    transitShift: "ट्रान्झिट बदल",
    nextDepartureRescheduled: "पुढील प्रस्थान (पुनर्निर्धारित)",
    cabPickup: "कॅब पिकअप",
    updatedAutomatically: "स्वयंचलितपणे अद्यतनित",
    hotelCheckin: "हॉटेल चेक-इन",
    warningAlertDispatched: "चेतावणी अलर्ट पाठवला",
    tripresqCost: "ट्रिपरेस्क्यू खर्च",
    processing: "प्रक्रिया सुरू आहे...",
    tripRecoveredTitle: "प्रवास यशस्वीरित्या सुधारला!",
    tripRecoveredDesc: "आम्ही तुमचे प्रवास व्हाउचर अपडेट केले आहेत आणि कॅब ऑपरेटर व हॉटेल कर्मचाऱ्यांना सूचित केले आहे. तुमचे नवीन बोर्डिंग पास पाठवले जात आहे.",
    updatingTimeline: "कालरेषा अपडेट होत आहे...",
    
    budgetTitle: "💰 विलंबित कोच पुनर्निर्धारण",
    budgetDesc: "ऑफ-पीक ट्रान्झिट पुनर्निर्धारण",
    budgetDetails: "नंतरच्या ट्रान्झिट नोडमध्ये पुनर्निर्धारित करा. भरपाई व्हाउचरद्वारे समर्थित, लांब विलंब शोषून तात्काळ खर्च कमी करते.",
    delayedByHours: "3.5 तास विलंब",
    compensation: "भरपाई",
    travelVoucher: "₹600 प्रवास व्हाउचर",
    postponedReservation: "बुकिंग स्थगित केले",
    compensationCredit: "भरपाई क्रेडिट",
    creditBack: "₹600 क्रेडिट परत",

    refundTitle: "💸 जास्तीत जास्त परतावा दावा",
    refundDesc: "रद्द करा आणि पूर्ण दावा",
    refundDetails: "सर्व व्यत्यय आलेले आणि डाउनस्ट्रीम नोड्स त्वरित रद्द करा. ट्रिपरेस्क्यू संरक्षणात्मक कलमांखाली १००% परतावा दावा सुरू करा.",
    refundEligible: "परतावा मिळण्यास पात्र",
    fullRefund: "100% पूर्ण परतावा",
    immediateInitiated: "त्वरित सुरू केले",
    cancellationCost: "रद्द करण्याचा खर्च",
    freeFee: "₹0 शुल्क",
    refundAmount: "परतावा रक्कम",
    fullRefundClaim: "100% परतावा",

    // Chaos Lab
    chaosTitle: "डेमो सँडबॉक्स आणि कॅओस लॅब",
    chaosDesc: "आमच्या व्यत्यय इंजिनची चाचणी घ्या. एक बुकिंग नोड निवडा, विलंबाचे प्रमाण सेट करा, आणि TripResQ कसे प्रभाव मोजते ते पहा.",
    selectNode: "व्यत्यय आणण्यासाठी बुकिंग नोड निवडा",
    disruptType: "व्यत्ययाचा प्रकार",
    delayAmount: "विलंभाचा कालावधी (मिनिटे)",
    disruptReason: "व्यत्ययाचे कारण",
    triggerBtn: "व्यत्यय सक्रिय करा",
    resetBtn: "प्रवास वेळेवर रीसेट करा",
    impactTitle: "व्यत्यय प्रभाव तपशील",
    downstreamDelay: "पुढील संभाव्य विलंब",
    brokenConnections: "तुटलेले कनेक्शन",
    affectedNodes: "प्रभावित नोड्सची संख्या",
    disruptionParams: "व्यत्यय पॅरामीटर्स",
    minsLabel: "मिनिटे",
    realTimeGraphImpact: "रिअल-टाइम आलेख प्रभाव",
    graphImpactDesc: "आमचे तरंग-प्रभाव कॅल्क्युलेटर नोड्सवर अनुक्रमे अवलंबित्व तपासणी चालवते. जर पूर्ववर्तीचे वास्तविक आगमन नंतरच्या नियोजित वेळेपेक्षा जास्त झाले, तर नोड तुटलेल्या कनेक्शनच्या स्थितीत येतो.",
    delayOption: "⏱️ विलंब",
    cancelOption: "❌ रद्द करणे",
    lockoutOption: "🔒 टर्मिनल लॉकआउट",
    weatherReason: "गंभीर हवामान आणि वादळ",
    mechReason: "यांत्रिक बिघाड आणि इंजिन बंद पडणे",
    trafficReason: "रेल्वे/हवाई वाहतूक कोंडी",
    securityReason: "सुरक्षा लॉकडाऊन चेतावणी",

    // Dining Page
    diningTitle: "तुमच्या जवळील स्थानिक जेवण",
    diningDesc: "तुमच्या गंतव्य स्टेशन किंवा हॉटेल जवळील निवडक रेस्टॉरंट्स. स्वच्छता आणि जलद सेवेच्या आधारे निवडलेले.",
    vegOnly: "शुद्ध शाकाहारी",
    specialties: "स्थानिक पदार्थ",
    fastDelivery: "जलद डिलिव्हरी",
    open247: "24/7 सुरू",
    all: "सर्व रेस्टॉरंट्स",
    kmAway: "किमी गंतव्यस्थानापासून",
    rating: "रेटिंग",
    avgCost: "2 लोकांसाठी सरासरी खर्च",
    bookTable: "टेबल बुक करा",
    tableBookedSuccess: "टेबल यशस्वीरित्या बुक केले:",
    noDiningTitle: "या फिल्टरशी जुळणारा कोणताही जेवणाचा पर्याय नाही",
    noDiningDesc: "कृपया वर आपले फिल्टर पर्याय बदलण्याचा प्रयत्न करा.",

    // Support Page
    supportTitle: "मदत आणि अभिप्राय केंद्र",
    supportDesc: "24/7 आपत्कालीन प्रतिसाद, वारंवार विचारले जाणारे प्रश्न, अभिप्राय फॉर्म आणि बग रिपोर्टर.",
    faqTab: "वारंवार विचारले जाणारे प्रश्न आणि मदत",
    bugTab: "बग रिपोर्ट करा",
    feedbackTab: "अभिप्राय शेअर करा",
    faqTitle: "वारंवार विचारले जाणारे प्रश्न",
    chatbotTitle: "एआय प्रवास सहाय्यक",
    chatbotSub: "विलंब, रीबुकिंग आणि रिफंड धोरणांबद्दल विचारा.",
    chatPlaceholder: "येथे आपला प्रश्न विचारा...",
    chatSend: "पाठवा",
    sosHelpline: "24/7 आपत्कालीन हेल्पलाइन",
    sosDesc: "त्वरित मदतीसाठी आमच्या हेल्पलाइनला कॉल करा.",
    bugTitle: "बग / प्लॅटफॉर्म समस्या सबमिट करा",
    bugSummary: "समस्येचा गोषवारा",
    bugSteps: "समस्या पुन्हा कशी तयार करावी",
    bugSeverity: "गंभीरता पातळी",
    bugScreenshot: "स्क्रीनशॉट येथे ड्रॅग करून आणा, किंवा अपलोड करण्यासाठी क्लिक करा (मॉक)",
    bugSubmit: "बग रिपोर्ट सबमिट करा",
    feedbackTitle: "तुमच्या अनुभवाचे मूल्यांकन करा",
    feedbackSub: "आम्ही प्रवाशांच्या अभिप्रायाच्या आधारे आमच्या सेवांमध्ये सुधारणा करतो.",
    feedbackComment: "तुमचे मत येथे लिहा...",
    feedbackSubmit: "अभिप्राय सबमिट करा",
    reportSuccessTitle: "रिपोर्ट यशस्वीरित्या सबमिट केला",
    reportSuccessDesc: "धन्यवाद! तिकीट आयडी: #",
    reportSuccessSub: "आमचे अभियंते यावर काम करत आहेत.",
    feedbackSuccessTitle: "अभिप्राय सबमिट केला",
    feedbackSuccessDesc: "तुमच्या अनुभवाचे मूल्यांकन केल्याबद्दल धन्यवाद! आम्ही तुमच्या इनपुटची प्रशंसा करतो.",
    tapToRate: "मूल्यांकन करण्यासाठी टॅप करा",
    feedbackTags: "अभिप्राय टॅग",
    severityLow: "कमी - यूआय/मजकूर त्रुटी",
    severityMedium: "मध्यम - वैशिष्ट्य दोष",
    severityHigh: "उच्च - क्रॅश / स्टेट लूप",
    severityCritical: "गंभीर - व्यत्यय मोजणी अपयश",
    chatbotChipDelay: "⏱️ विलंबित प्रवास",
    chatbotChipRefund: "💸 परतावा",
    chatbotChipHotel: "🏨 हॉटेल तपासणी",
    chatbotDefaultResponse: "मी तुमची क्वेरी समजतो. तुमचे ट्रिपरेस्क्यू प्रोटेक्शन गार्ड सक्रिय आहे. कोणताही ट्रान्झिट नोड विलंबित किंवा रद्द झाल्यास, तुम्ही चाचणी व्यत्यय आणण्यासाठी '⚡ कॅओस लॅब' वर क्लिक करू शकता, त्यानंतर 'माझ्या सहली' कालरेषेवर रिकव्हरी पर्याय पाहू शकता.",
    chatbotDelayResponse: "उशीर आढळल्यास (कॅओस लॅबमध्ये सिम्युलेट केलेल्या ३ तासांच्या विलंबाप्रमाणे), आमची सिस्टीम तडजोड केलेले कनेक्शन चिन्हांकित करते आणि तीन बचाव योजना ऑफर करते: सर्वात जलद, बजेट (व्हाउचरसह) आणि कमाल परतावा. 'माझ्या सहली' कालरेषेवर जा आणि ते पाहण्यासाठी 'स्मार्ट बचाव योजना पहा' वर क्लिक करा!",
    chatbotRefundResponse: "ट्रिपरेस्क्यू संरक्षण मार्गदर्शक तत्त्वांनुसार, जर तुमचा प्रवास विस्कळीत झाला आणि तुम्ही रद्द करणे निवडले, तर 'कमाल परतावा योजना' सर्व जोडलेल्या बुकिंगवर १००% परताव्याची हमी देते. परतावा त्वरित प्रक्रिया केला जातो!",
    chatbotHotelResponse: "होय, कॅबचे वेळापत्रक बदलणे आणि हॉटेल आगमन चेतावणी दोन्ही स्वयंचलित आहेत. एकदा आपण रिकव्हरी योजना स्वीकारली की, आम्ही आमच्या वाहतूक आणि निवास भागीदारांना स्वयंचलितपणे सूचित करतो.",

    // Auth
    authTitle: "लॉग इन / नोंदणी",
    signInTab: "लॉग इन",
    signUpTab: "खाते तयार करा",
    fullName: "पूर्ण नाव",
    emailOrPhone: "ईमेल पत्ता / मोबाईल नंबर",
    password: "पासवर्ड",
    rememberMe: "माझी आठवण ठेवा",
    forgotPass: "पासवर्ड विसरलात?",
    socialSignIn: "किंवा याद्वारे लॉग इन करा",
    googleSignIn: "गुगल खाते",
    otpSignIn: "मोबाईल ओटीपी पडताळणी",
    signUpBtn: "नोंदणी करा",
    secureVerification: "ट्रिपरेस्क्यू प्रोटेक्शन शील्डद्वारे सुरक्षित पडताळणी",
    googleUser: "गुगल प्रवासी",
    otpUser: "ओटीपी वापरकर्ता",

    // Global
    allRightsReserved: "© 2026 ट्रिपरेस्क्यू टेक्नॉलॉजीज इंक. सर्व हक्क राखीव.",
    privacyPolicy: "गोपनीयता धोरण",
    termsOfProtection: "संरक्षणाच्या अटी",
    contactHelpDesk: "मदत डेस्कशी संपर्क साधा",
    callSos: "एसओएस कॉल करा",
    simulateDelaysTitle: "कॅओस लॅबमध्ये विलंबाचे अनुकरण करा",
    simulateDelaysDesc: "गुंतागुंटीच्या मल्टी-नोड अपयशाचे अनुकरण करण्यासाठी आणि आमच्या त्वरित ऑटो-रीबुकिंग इंजिनचा शोध घेण्यासाठी, नेव्हिगेशन बारच्या वरच्या उजव्या बाजूला असलेल्या समर्पित ⚡ कॅओस लॅब सँडबॉक्सचा वापर करा.",
    openSandbox: "सँडबॉक्स उघडा"
  }
};

// --- Mock Dining Hub Data ---
const RESTAURANTS = [
  {
    id: 'r1',
    city: 'Pune',
    name: 'Shabree Restaurant',
    cuisine: 'Maharashtrian Thali, Local Specialties',
    distance: 0.4,
    cost: 800,
    rating: 4.6,
    tags: ['Local Specialties', 'Pure Veg'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r2',
    city: 'Pune',
    name: 'German Bakery Café',
    cuisine: 'Bakery, Cakes, Continental Snacks',
    distance: 1.2,
    cost: 600,
    rating: 4.3,
    tags: ['Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r3',
    city: 'Pune',
    name: 'Vaishali Restaurant',
    cuisine: 'South Indian Dosa, Idli, Filter Coffee',
    distance: 2.1,
    cost: 450,
    rating: 4.7,
    tags: ['Pure Veg', 'Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r4',
    city: 'Mumbai',
    name: 'Britannia & Co. Restaurant',
    cuisine: 'Parsi Mutton Berry Pulao, Sali Boti',
    distance: 0.5,
    cost: 1100,
    rating: 4.5,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r5',
    city: 'Mumbai',
    name: 'Bastian Bandra',
    cuisine: 'Seafood Specialties, Premium European',
    distance: 3.2,
    cost: 2600,
    rating: 4.8,
    tags: ['Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r6',
    city: 'Mumbai',
    name: 'Sukh Sagar Chowpatty',
    cuisine: 'North Indian Pav Bhaji, Chaat, Juice',
    distance: 0.8,
    cost: 500,
    rating: 4.2,
    tags: ['Pure Veg', 'Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r7',
    city: 'Delhi',
    name: 'Karim\'s Jama Masjid',
    cuisine: 'Mughlai Kebabs, Butter Chicken, Naan',
    distance: 0.3,
    cost: 950,
    rating: 4.6,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r8',
    city: 'Delhi',
    name: 'Saravana Bhavan Connaught Place',
    cuisine: 'Traditional South Indian Thali, Pure Veg',
    distance: 1.4,
    cost: 550,
    rating: 4.5,
    tags: ['Pure Veg', 'Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r9',
    city: 'Delhi',
    name: 'Midnight Express Diner',
    cuisine: 'Rolls, Burgers, Late Night Shakes',
    distance: 1.1,
    cost: 400,
    rating: 4.1,
    tags: ['Fast Delivery', 'Open 24/7'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r-goa-1',
    city: 'Goa',
    name: 'Fisherman\'s Wharf',
    cuisine: 'Goan Seafood, Prawn Curry, Xacuti',
    distance: 0.6,
    cost: 1200,
    rating: 4.7,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r-goa-2',
    city: 'Goa',
    name: 'Gunpowder',
    cuisine: 'South Indian & Kerala Cuisine, Dosa, Appam',
    distance: 1.3,
    cost: 900,
    rating: 4.5,
    tags: ['Pure Veg', 'Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r-goa-3',
    city: 'Goa',
    name: 'Baba Au Rhum',
    cuisine: 'French Bakery, Croissants, Artisan Coffee',
    distance: 0.8,
    cost: 700,
    rating: 4.4,
    tags: ['Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r-goa-4',
    city: 'Goa',
    name: 'Thalassa Greek Taverna',
    cuisine: 'Greek Mediterranean, Seafood, Sunset Dining',
    distance: 3.5,
    cost: 2200,
    rating: 4.8,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r-goa-5',
    city: 'Goa',
    name: '24x7 Beach Shack Express',
    cuisine: 'Quick Bites, Fish Fry, Cold Drinks',
    distance: 0.3,
    cost: 350,
    rating: 4.0,
    tags: ['Fast Delivery', 'Open 24/7'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
  }
];

// --- Indian Cities for Autocomplete ---
const INDIAN_CITIES = [
  { name: 'Mumbai', code: 'BOM', state: 'Maharashtra' },
  { name: 'Delhi', code: 'DEL', state: 'Delhi' },
  { name: 'Bengaluru', code: 'BLR', state: 'Karnataka' },
  { name: 'Hyderabad', code: 'HYD', state: 'Telangana' },
  { name: 'Chennai', code: 'MAA', state: 'Tamil Nadu' },
  { name: 'Kolkata', code: 'CCU', state: 'West Bengal' },
  { name: 'Pune', code: 'PNQ', state: 'Maharashtra' },
  { name: 'Ahmedabad', code: 'AMD', state: 'Gujarat' },
  { name: 'Goa', code: 'GOI', state: 'Goa' },
  { name: 'Jaipur', code: 'JAI', state: 'Rajasthan' },
  { name: 'Kochi', code: 'COK', state: 'Kerala' },
  { name: 'Chandigarh', code: 'IXC', state: 'Chandigarh' },
  { name: 'Lucknow', code: 'LKO', state: 'Uttar Pradesh' },
  { name: 'Indore', code: 'IDR', state: 'Madhya Pradesh' },
  { name: 'Nagpur', code: 'NAG', state: 'Maharashtra' },
  { name: 'Surat', code: 'STV', state: 'Gujarat' },
  { name: 'Nashik', code: 'ISK', state: 'Maharashtra' },
  { name: 'Bhopal', code: 'BHO', state: 'Madhya Pradesh' },
  { name: 'Varanasi', code: 'VNS', state: 'Uttar Pradesh' },
  { name: 'Amritsar', code: 'ATQ', state: 'Punjab' },
  { name: 'Thiruvananthapuram', code: 'TRV', state: 'Kerala' },
  { name: 'Udaipur', code: 'UDR', state: 'Rajasthan' },
  { name: 'Visakhapatnam', code: 'VTZ', state: 'Andhra Pradesh' },
  { name: 'Coimbatore', code: 'CJB', state: 'Tamil Nadu' },
  { name: 'Patna', code: 'PAT', state: 'Bihar' },
  { name: 'Mangalore', code: 'IXE', state: 'Karnataka' },
  { name: 'Ranchi', code: 'IXR', state: 'Jharkhand' },
  { name: 'Dehradun', code: 'DED', state: 'Uttarakhand' },
  { name: 'Srinagar', code: 'SXR', state: 'Jammu & Kashmir' },
  { name: 'Agra', code: 'AGR', state: 'Uttar Pradesh' }
];

// --- City Autocomplete Component ---
function CityAutocomplete({ value, onChange, placeholder, required }) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef(null);

  // Sync external value
  useEffect(() => { setQuery(value || ''); }, [value]);

  const filtered = query.trim().length > 0
    ? INDIAN_CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.state.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : INDIAN_CITIES.slice(0, 6);

  const selectCity = (city) => {
    setQuery(city.name);
    onChange(city.name);
    setIsOpen(false);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0 && filtered[highlightIdx]) {
      e.preventDefault();
      selectCity(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        required={required}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightIdx(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] focus:ring-2 focus:ring-[#287DFA]/10 transition"
        autoComplete="off"
        aria-label={placeholder}
      />
      <ChevronDown className={`absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
          {filtered.map((city, idx) => (
            <button
              key={city.code}
              type="button"
              onClick={() => selectCity(city)}
              onMouseEnter={() => setHighlightIdx(idx)}
              className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-3 transition cursor-pointer ${
                idx === highlightIdx ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-700 hover:bg-slate-50'
              } ${idx === 0 ? 'rounded-t-xl' : ''} ${idx === filtered.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <div className="flex-1 min-w-0">
                <span className="font-bold">{city.name}</span>
                <span className="text-slate-400 ml-1.5 font-mono text-[10px]">({city.code})</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{city.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Seed helper to construct the default trip (Delhi → Goa Family Vacation)
const seedInitialTripNodes = () => {
  return [
    {
      id: 'node-1',
      type: 'flight',
      title: 'Flight AI-502 (Air India)',
      sub: 'Delhi (DEL) → Mumbai (BOM)',
      scheduledStart: '06:00',
      scheduledEnd: '08:15',
      actualStart: '06:00',
      actualEnd: '08:15',
      buffer: 75,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Delhi DEL T3 → Mumbai BOM T2'
    },
    {
      id: 'node-2',
      type: 'flight',
      title: 'Flight 6E-301 (IndiGo)',
      sub: 'Mumbai (BOM) → Goa (GOI)',
      scheduledStart: '09:30',
      scheduledEnd: '11:00',
      actualStart: '09:30',
      actualEnd: '11:00',
      buffer: 30,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Mumbai BOM T1 → Goa GOI'
    },
    {
      id: 'node-3',
      type: 'cab',
      title: 'Airport Cab Transfer (Uber Select)',
      sub: 'Goa Airport → Taj Fort Aguada',
      scheduledStart: '11:30',
      scheduledEnd: '12:15',
      actualStart: '11:30',
      actualEnd: '12:15',
      buffer: 45,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Goa Airport Pickup Zone → Taj Fort Aguada'
    },
    {
      id: 'node-4',
      type: 'hotel',
      title: 'Taj Fort Aguada Check-In',
      sub: 'Goa Premium Stay',
      scheduledStart: '13:00',
      scheduledEnd: 'Onwards',
      actualStart: '13:00',
      actualEnd: 'Onwards',
      buffer: 0,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Taj Fort Aguada, Sinquerim, Goa'
    }
  ];
};

// Helper to add minutes to 24h "HH:MM" format
function addMinutesToTime(timeStr, mins) {
  if (!timeStr) return "08:00";
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) {
    h = 8; m = 0;
  }
  m += mins;
  h += Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper to get buffer minutes between end of node 1 and start of node 2
function getMinutesBetween(time1, time2) {
  if (!time1 || !time2 || time1 === 'Onwards' || time2 === 'Onwards' || time1.includes('CANCELLED') || time2.includes('CANCELLED') || time1.includes('COMPROMISED') || time2.includes('COMPROMISED')) return 0;
  
  const cleanT1 = time1.split(' ')[0];
  const cleanT2 = time2.split(' ')[0];
  
  const [h1, m1] = cleanT1.split(':').map(Number);
  const [h2, m2] = cleanT2.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}


// Format graph nodes returned by backend to frontend state
const formatGraphNodes = (nodes, existingNodes = []) => {
  return (nodes || []).map((n, idx) => {
    let frontendStatus = 'healthy';
    if (n.status === 'AT_RISK') frontendStatus = 'delayed';
    if (n.status === 'BROKEN') frontendStatus = 'broken';

    const actualStartStr = n.start_time && n.start_time.includes('T') ? n.start_time.split('T')[1].substring(0,5) : (n.start_time || '08:00');
    const actualEndStr = n.end_time && n.end_time.includes('T') ? n.end_time.split('T')[1].substring(0,5) : (n.end_time || '09:00');

    // Find matching existing node to preserve OG baseline scheduled time
    let existing = (existingNodes || []).find(ex => ex.id === n.id);
    if (!existing) {
      existing = (existingNodes || []).find(ex => ex.title === n.title);
    }
    if (!existing && existingNodes && existingNodes[idx]) {
      existing = existingNodes[idx];
    }

    const scheduledStartStr = existing ? existing.scheduledStart : actualStartStr;
    const scheduledEndStr = existing ? existing.scheduledEnd : actualEndStr;

    // Calculate exact delay minutes between scheduled and actual start
    const calcDelay = getMinutesBetween(scheduledStartStr, actualStartStr);

    return {
      id: n.id,
      type: (n.type || 'flight').toLowerCase(),
      title: n.title,
      sub: n.location || '',
      scheduledStart: scheduledStartStr,
      scheduledEnd: scheduledEndStr,
      actualStart: actualStartStr,
      actualEnd: actualEndStr,
      buffer: 0,
      status: frontendStatus,
      disruptionReason: frontendStatus !== 'healthy' ? 'Schedule Slippage' : '',
      delayMinutes: calcDelay > 0 ? calcDelay : 0,
      info: n.location || ''
    };
  });
};

function addMinutesToISO(isoStr, mins) {
  try {
    const dt = new Date(isoStr);
    dt.setMinutes(dt.getMinutes() + mins);
    return dt.toISOString();
  } catch (e) {
    return isoStr;
  }
}

// Generate unique Trip Reference
function generateTripRef() {
  return "TR-" + Math.floor(100000 + Math.random() * 900000);
}

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('home');
  const [disruptionState, setDisruptionState] = useState('healthy'); // 'healthy' | 'disrupted' | 'resolved'
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userAuth, setUserAuth] = useState({
    loggedIn: false,
    user: null
  });

  // Search State Tab: flights | trains | cabs | hotels
  const [searchTab, setSearchTab] = useState('flights');
  
  // Custom Node Builder Input States
  const [builderFrom, setBuilderFrom] = useState('');
  const [builderTo, setBuilderTo] = useState('');
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [builderDate, setBuilderDate] = useState(todayDateStr);
  const [builderTime, setBuilderTime] = useState('08:00');
  const [builderDuration, setBuilderDuration] = useState(75);
  const [builderAirways, setBuilderAirways] = useState('');
  const [builderTrainName, setBuilderTrainName] = useState('');
  const [builderCabService, setBuilderCabService] = useState('');
  const [builderHotelName, setBuilderHotelName] = useState('');

  // Temporary constructed nodes
  const [builderNodes, setBuilderNodes] = useState([]);

  // Active Trip Graph Nodes State
  const [tripRefNum, setTripRefNum] = useState('');
  const [currentTrip, setCurrentTrip] = useState([]);
  const [originalTripNodes, setOriginalTripNodes] = useState([]);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [riskRadar, setRiskRadar] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);

  // Chaos Lab Disruption Inputs
  const [selectedDisruptNode, setSelectedDisruptNode] = useState('');
  const [disruptType, setDisruptType] = useState('delay'); // 'delay' | 'cancel' | 'lockout'
  const [disruptDelay, setDisruptDelay] = useState(180);
  const [disruptReason, setDisruptReason] = useState('Severe Weather & Thunderstorms');

  // Cascade Impact Metrics
  const [impactMetrics, setImpactMetrics] = useState({
    delayMinutes: 0,
    brokenConnections: 0,
    affectedNodes: 0
  });

  // Restaurant Filters
  const [restaurantFilter, setRestaurantFilter] = useState('All');

  // Support Portal State
  const [supportTab, setSupportTab] = useState('faq');
  const [bugSummary, setBugSummary] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugSeverity, setBugSeverity] = useState('Medium');
  const [bugScreenshot, setBugScreenshot] = useState(null);
  const [bugTicketId, setBugTicketId] = useState('');
  const [bugSuccess, setBugSuccess] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your TripResQ AI Protection Assistant. How can I help you recover your travel today?' }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Auth form state
  const [authTab, setAuthTab] = useState('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Sync translation key lookup helper
  const t = (key) => {
    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;
  };

  
  // Fetch recent trips from backend
  const fetchRecentTrips = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trips');
      if (res.ok) {
        const data = await res.json();
        setRecentTrips(data.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching recent trips:', err);
    }
  };

  // Fetch risk radar data for current trip
  const fetchRiskRadar = async (tripId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/risk-radar`);
      if (res.ok) {
        const data = await res.json();
        setRiskRadar(data);
      }
    } catch (err) {
      console.error('Error fetching risk radar:', err);
    }
  };

  const initializeSeedTrip = async () => {
    try {
      // Call backend seed-demo endpoint — this creates the trip, nodes, edges,
      // and cohort in the SQLite database through the existing models.
      const res = await fetch('http://localhost:5000/api/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      });
      const seedData = await res.json();
      const tripId = seedData.trip_id;
      const graphData = seedData.graph;

      const formattedNodes = formatGraphNodes(graphData.nodes);

      setCurrentTrip(formattedNodes);
      setOriginalTripNodes(formattedNodes);
      if (formattedNodes.length > 0) {
        setSelectedDisruptNode(formattedNodes[0].id);
      }
      setTripRefNum(tripId);

      // Fetch risk radar for the seeded trip
      fetchRiskRadar(tripId);
      // Fetch recent trips list
      fetchRecentTrips();
    } catch (err) {
      console.error('Error seeding trip:', err);
    }
  };

  useEffect(() => {
    initializeSeedTrip();
  }, []);

  useEffect(() => {
    if (currentTrip && currentTrip.length > 0) {
      const exists = currentTrip.some(n => n.id === selectedDisruptNode);
      if (!exists || !selectedDisruptNode) {
        setSelectedDisruptNode(currentTrip[0].id);
      }
    }
  }, [currentTrip]);





  // Add node dynamically as user inputs details in the form
  const handleAddBuilderNode = (e) => {
    e.preventDefault();
    
    let title = '';
    let info = '';
    let type = searchTab; // flights | trains | cabs | hotels
    let from = builderFrom.trim();
    let to = builderTo.trim();
    
    if (type === 'flights') {
      type = 'flight';
      title = builderAirways.trim() || 'Custom Flight';
      info = 'Terminal Gateway';
    } else if (type === 'trains') {
      type = 'train';
      title = builderTrainName.trim() || 'Custom Train';
      info = 'Platform Route';
    } else if (type === 'cabs') {
      type = 'cab';
      title = builderCabService.trim() || 'Custom Cab';
      info = 'Pickup Area';
    } else if (type === 'hotels') {
      type = 'hotel';
      title = builderHotelName.trim() || 'Custom Hotel Stay';
      info = 'Reception Lobby';
      to = from; 
    }

    if (!from && type !== 'hotel') {
      alert("Please enter a From Location!");
      return;
    }
    if (!to) {
      alert("Please enter a Destination Location!");
      return;
    }
    if (!title) {
      alert("Please enter the name details (Airways, Train Name, Cab service, or Hotel name)!");
      return;
    }

    const scheduledStart = builderTime;
    const scheduledEnd = type === 'hotel' ? 'Onwards' : addMinutesToTime(builderTime, builderDuration);

    const newNode = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      sub: type === 'hotel' ? `${to}` : `${from} → ${to}`,
      date: builderDate || new Date().toISOString().split('T')[0],
      scheduledStart,
      scheduledEnd,
      actualStart: scheduledStart,
      actualEnd: scheduledEnd,
      buffer: 0,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info
    };

    setBuilderNodes(prev => {
      const updated = [...prev, newNode];
      // Recalculate buffers
      for (let i = 0; i < updated.length - 1; i++) {
        if (updated[i].actualEnd !== 'Onwards' && updated[i + 1].actualStart !== 'Onwards') {
          updated[i].buffer = getMinutesBetween(updated[i].actualEnd, updated[i + 1].actualStart);
        }
      }
      return updated;
    });

    // Reset inputs for standard chain workflow
    if (type !== 'hotel') {
      setBuilderFrom(to); // Next node starts where this one ended
      setBuilderTo('');
    }
    if (scheduledEnd !== 'Onwards') {
      setBuilderTime(addMinutesToTime(scheduledEnd, 30)); // Next starts 30 mins after
    }
    setBuilderAirways('');
    setBuilderTrainName('');
    setBuilderCabService('');
    setBuilderHotelName('');
  };

  const handleRemoveBuilderNode = (nodeId) => {
    setBuilderNodes(prev => {
      const updated = prev.filter(n => n.id !== nodeId);
      for (let i = 0; i < updated.length - 1; i++) {
        if (updated[i].actualEnd !== 'Onwards' && updated[i + 1].actualStart !== 'Onwards') {
          updated[i].buffer = getMinutesBetween(updated[i].actualEnd, updated[i + 1].actualStart);
        }
      }
      return updated;
    });
  };

  const handleLockJourney = async () => {
    if (builderNodes.length === 0) return;
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Trip Journey' })
      });
      const tripData = await res.json();
      const tripId = tripData.id;

      for (const node of builderNodes) {
        const nodeDate = node.date || new Date().toISOString().split('T')[0];
        const st = `${nodeDate}T${node.scheduledStart}:00Z`;
        const et = node.scheduledEnd === 'Onwards' ? `${nodeDate}T23:59:59Z` : `${nodeDate}T${node.scheduledEnd}:00Z`;
        
        let hardCutoff = null;
        if (node.type === 'cab') {
          hardCutoff = addMinutesToISO(st, 30);
        } else if (node.type === 'hotel') {
          hardCutoff = addMinutesToISO(st, 60);
        }

        const payload = {
          trip_id: tripId,
          node_type: (node.type || 'flight').toUpperCase(),
          title: node.title,
          location: node.info || node.sub || '',
          start_time: st,
          end_time: et
        };
        if (hardCutoff) {
          payload.hard_cutoff = hardCutoff;
        }

        await fetch('http://localhost:5000/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const graphRes = await fetch(`http://localhost:5000/api/trips/${tripId}/graph`);
      const graphData = await graphRes.json();
      
      const formattedNodes = formatGraphNodes(graphData.nodes);

      setCurrentTrip(formattedNodes);
      setOriginalTripNodes(formattedNodes);
      if (formattedNodes.length > 0) {
        setSelectedDisruptNode(formattedNodes[0].id);
      }
      setBuilderNodes([]);
      setTripRefNum(tripId);
      setDisruptionState('healthy');
      setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
      setCurrentPage('my-trip');
    } catch (err) {
      console.error(err);
      alert('Failed to lock journey with backend');
    }
  };

  // Cascade ripple effects calculation engine
  const triggerDisruptionCascade = async (nodeId, type, delayMins, reason) => {
    const targetId = nodeId || selectedDisruptNode || (currentTrip.length > 0 ? currentTrip[0].id : '');
    if (!targetId) {
      alert("Please select a travel node to disrupt!");
      return;
    }
    if (!tripRefNum) {
      alert("Trip not loaded yet. Please wait for the trip to initialize.");
      return;
    }
    try {
      const delayToApply = (type === 'cancel' || type === 'lockout') ? 360 : (delayMins || 180);
      console.log(`[TripResQ] Disrupting node=${targetId} trip=${tripRefNum} type=${type} delay=${delayToApply}`);
      const res = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/disrupt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: targetId,
          delay_minutes: delayToApply,
          disruption_type: type,
          reason: reason
        })
      });
      const data = await res.json();
      console.log('[TripResQ] Disruption response:', { metrics: data.metrics, graphNodes: data.updated_graph?.nodes?.length });
      if (data.error) {
         alert(`Disruption Error: ${data.error}`);
         return;
      }
      
      // Preserve OG scheduled times by passing originalTripNodes baseline
      const targetBaseline = (originalTripNodes && originalTripNodes.length > 0) ? originalTripNodes : currentTrip;
      const formattedNodes = formatGraphNodes(data.updated_graph?.nodes || [], targetBaseline);

      // Parse metrics from backend response — available at top level and inside impacts
      const backendMetrics = data.metrics || data.impacts?.metrics || {};
      const brokenCount = backendMetrics.brokenConnections ?? backendMetrics.broken_connections ?? (data.updated_graph?.nodes || []).filter(n => n.status === 'BROKEN').length;
      const affectedCount = backendMetrics.affectedNodes ?? backendMetrics.affected_nodes ?? (data.updated_graph?.nodes || []).filter(n => n.status !== 'OK').length;
      const downstreamDelay = backendMetrics.delayMinutes ?? backendMetrics.delay_minutes ?? delayToApply;

      console.log('[TripResQ] Setting metrics:', { delayMinutes: downstreamDelay, brokenConnections: brokenCount, affectedNodes: affectedCount });

      setCurrentTrip(formattedNodes);
      setDisruptionState('disrupted');
      setRecoveryResult(null);
      setImpactMetrics({
        delayMinutes: downstreamDelay,
        brokenConnections: brokenCount,
        affectedNodes: affectedCount
      });
    } catch (err) {
      console.error('[TripResQ] Disruption error:', err);
      alert('Failed to execute disruption simulation. Ensure the Flask backend is running at http://localhost:5000.');
    }
  };

  
  

  const handleResetJourney = async () => {
    try {
      // Re-seed the demo trip using the backend endpoint
      // force: true deletes and re-creates the demo trip cleanly
      const res = await fetch('http://localhost:5000/api/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const seedData = await res.json();
      const tripId = seedData.trip_id;
      const graphData = seedData.graph;

      const formattedNodes = formatGraphNodes(graphData.nodes);

      setCurrentTrip(formattedNodes);
      setOriginalTripNodes(formattedNodes);
      if (formattedNodes.length > 0) {
        setSelectedDisruptNode(formattedNodes[0].id);
      }
      setTripRefNum(tripId);
      setDisruptionState('healthy');
      setRecoveryResult(null);
      setRiskRadar(null);
      setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });

      // Re-fetch risk radar
      fetchRiskRadar(tripId);
    } catch (err) {
      console.error(err);
      // Fallback: reset frontend state using original nodes
      const targetNodes = (originalTripNodes && originalTripNodes.length > 0) ? originalTripNodes : currentTrip;
      const resetNodes = targetNodes.map(n => ({ ...n, status: 'healthy', actualStart: n.scheduledStart, actualEnd: n.scheduledEnd, delayMinutes: 0, disruptionReason: '' }));
      setCurrentTrip(resetNodes);
      if (resetNodes.length > 0) {
        setSelectedDisruptNode(resetNodes[0].id);
      }
      setDisruptionState('healthy');
      setRecoveryResult(null);
      setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
    }
  };

  // Applied recovery plan handler called by RecoveryControl
  const handlePlanApplied = (updatedGraph, plan, responseData) => {
    const rawNodes = updatedGraph?.nodes || [];
    const targetBaseline = (originalTripNodes && originalTripNodes.length > 0) ? originalTripNodes : currentTrip;
    const formattedNodes = formatGraphNodes(rawNodes, targetBaseline);

    const comparison = formattedNodes.map((fn, idx) => {
      let orig = targetBaseline.find(o => o.id === fn.id);
      if (!orig && targetBaseline && targetBaseline[idx]) {
        orig = targetBaseline[idx];
      }
      if (!orig) orig = fn;

      const timeChanged = orig.scheduledStart !== fn.actualStart || orig.scheduledEnd !== fn.actualEnd;
      const titleChanged = orig.title !== fn.title;
      const isRebooked = timeChanged || titleChanged;

      return {
        id: fn.id,
        type: fn.type,
        originalTitle: orig.title,
        newTitle: fn.title,
        originalStart: orig.scheduledStart,
        originalEnd: orig.scheduledEnd,
        newStart: fn.actualStart,
        newEnd: fn.actualEnd,
        timeChanged,
        titleChanged,
        isRebooked,
        actionType: isRebooked ? (timeChanged ? 'RESCHEDULED' : 'UPDATED') : 'PRESERVED'
      };
    });

    const appliedInfo = {
      strategy: plan?.title || responseData?.strategy || "Intelligent Personalized Recovery",
      priority: plan?.priority || responseData?.priority || "FASTEST",
      replacement: plan?.subtitle || (plan?.details?.transit || plan?.action || "Synchronized Alternative Connection"),
      cost: plan?.estimated_cost ?? responseData?.cost ?? 0,
      timeSaved: plan?.time_saved_minutes ?? responseData?.time_saved ?? 0,
      refund: plan?.estimated_refund ?? responseData?.refund ?? 0,
      affectedNodes: plan?.affected_nodes ?? responseData?.affected_nodes ?? comparison.filter(c => c.isRebooked).length,
      reason: plan?.reason || "Restored schedule integrity with minimum passenger friction.",
      details: plan?.details || {},
      appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      comparison: comparison
    };

    setRecoveryResult(appliedInfo);
    setCurrentTrip(formattedNodes);
    setDisruptionState('resolved');
    setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
    setCurrentPage('my-trip');
  };

  // Chatbot Query Submit Handler
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: chatMessages.length + 1, sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const textQuery = chatInput.toLowerCase();
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      let botResponse = t('chatbotDefaultResponse');
      
      if (textQuery.includes('delay') || textQuery.includes('late')) {
        botResponse = t('chatbotDelayResponse');
      } else if (textQuery.includes('refund') || textQuery.includes('cancel')) {
        botResponse = t('chatbotRefundResponse');
      } else if (textQuery.includes('hotel') || textQuery.includes('cab')) {
        botResponse = t('chatbotHotelResponse');
      }

      setChatMessages(prev => [...prev, { id: prev.length + 1, sender: 'bot', text: botResponse }]);
      setIsChatTyping(false);
    }, 1200);
  };

  const handleQuickChatPrompt = (promptText) => {
    setChatInput(promptText);
  };

  // Bug report submit handler
  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugSummary.trim()) return;
    setBugTicketId("BUG-" + Math.floor(1000 + Math.random() * 9000));
    setBugSuccess(true);
    setTimeout(() => {
      setBugSuccess(false);
      setBugSummary('');
      setBugSteps('');
      setBugScreenshot(null);
    }, 3000);
  };

  // Feedback submit handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackRating === 0) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setSelectedTags([]);
    }, 3000);
  };

  // Auth Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setUserAuth({
      loggedIn: true,
      user: {
        name: authName || authEmail.split('@')[0],
        email: authEmail
      }
    });
    setShowAuthModal(false);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setCurrentPage('home'); 
  };

  // Restaurant destination: use LAST node's destination or hotel city
  const lastNode = currentTrip[currentTrip.length - 1];
  const activeDestination = (() => {
    // Try hotel/destination node's location for city
    if (lastNode?.type === 'hotel') {
      const loc = lastNode.info || lastNode.sub || '';
      if (loc.toLowerCase().includes('goa')) return 'Goa';
      if (loc.toLowerCase().includes('pune')) return 'Pune';
      if (loc.toLowerCase().includes('mumbai')) return 'Mumbai';
      if (loc.toLowerCase().includes('delhi')) return 'Delhi';
    }
    // Try last node's destination from sub field
    const lastSub = lastNode?.sub || '';
    if (lastSub.includes('→')) {
      return lastSub.split('→').pop().trim().split(' ')[0].split('(')[0].trim();
    }
    // Fallback to first node's arrival
    const firstSub = currentTrip[0]?.sub || '';
    if (firstSub.includes('→')) {
      return firstSub.split('→').pop().trim().split(' ')[0].split('(')[0].trim();
    }
    return 'Goa';
  })();
  
  const filteredRestaurants = RESTAURANTS.filter(r => {
    const isCity = r.city.toLowerCase() === activeDestination.toLowerCase();
    if (!isCity) return false;
    if (restaurantFilter === 'All') return true;
    return r.tags.includes(restaurantFilter);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col justify-between selection:bg-[#287DFA] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* --- Global Navigation Header --- */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-105 shadow-sm px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-[#287DFA] focus:outline-none cursor-pointer"
          >
            <div className="p-1 bg-[#287DFA] text-white rounded-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-serif font-extrabold">{t('logo')}</span>
          </button>

          {/* Desktop Nav Links - Gated by Login */}
          {userAuth.loggedIn && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-655">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'home' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navHome')}
              </button>
              <button 
                onClick={() => setCurrentPage('my-trip')}
                className={`hover:text-[#287DFA] transition py-1 flex items-center gap-1.5 cursor-pointer ${currentPage === 'my-trip' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navMyTrips')}
                {disruptionState === 'disrupted' && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7700] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF7700]"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={() => setCurrentPage('restaurants')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'restaurants' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navRestaurants')}
              </button>
              <button 
                onClick={() => setCurrentPage('support')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'support' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navSupport')}
              </button>
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Chaos Sandbox badge - Gated by Login */}
          {userAuth.loggedIn && (
            <button 
              onClick={() => setCurrentPage('chaos-lab')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs font-bold rounded-full transition duration-200 cursor-pointer ${
                currentPage === 'chaos-lab' 
                  ? 'bg-[#FF7700] text-white shadow-md shadow-[#FF7700]/20'
                  : 'bg-orange-50 text-[#FF7700] hover:bg-orange-100 border border-orange-200/20'
              }`}
            >
              {t('navChaos')}
            </button>
          )}

          {/* Language Dropdown Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 border border-slate-200 bg-white rounded-full hover:bg-slate-50 transition cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-[#287DFA]" />
              <span>{currentLanguage === 'en' ? 'EN' : currentLanguage === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-28 bg-white border border-slate-105 rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50">
              <button 
                onClick={() => setCurrentLanguage('en')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                English
              </button>
              <button 
                onClick={() => setCurrentLanguage('hi')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                हिन्दी
              </button>
              <button 
                onClick={() => setCurrentLanguage('mr')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                मराठी
              </button>
            </div>
          </div>

          {/* Auth System */}
          {userAuth.loggedIn ? (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50 transition cursor-pointer">
                <div className="w-5 h-5 bg-[#287DFA] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {userAuth.user?.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-700">{userAuth.user?.name}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-100 rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50">
                <div className="px-3 py-2 border-b border-slate-50 text-[10px] text-slate-400 truncate">
                  {userAuth.user?.email}
                </div>
                <button 
                  onClick={() => setUserAuth({ loggedIn: false, user: null })}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('signOut')}
                </button>
                <button
                  onClick={() => { if (window.__tripresq_restart_guide) window.__tripresq_restart_guide(); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#287DFA] hover:bg-blue-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restart Guide
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setAuthTab('signin');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-[10px] sm:text-xs font-bold rounded-full transition shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" /> {t('signIn')}
            </button>
          )}
        </div>
      </header>

      {/* Mobile navigation row (only shown when logged in on small screens) */}
      {userAuth.loggedIn && (
        <nav className="md:hidden bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-around text-xs font-bold text-slate-500">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`hover:text-[#287DFA] transition pb-1 ${currentPage === 'home' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
          >
            {t('navHome')}
          </button>
          <button 
            onClick={() => setCurrentPage('my-trip')}
            className={`hover:text-[#287DFA] transition pb-1 flex items-center gap-1 ${currentPage === 'my-trip' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
          >
            {t('navMyTrips')}
            {disruptionState === 'disrupted' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7700]" />
            )}
          </button>
          <button 
            onClick={() => setCurrentPage('restaurants')}
            className={`hover:text-[#287DFA] transition pb-1 ${currentPage === 'restaurants' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
          >
            {t('navRestaurants')}
          </button>
          <button 
            onClick={() => setCurrentPage('support')}
            className={`hover:text-[#287DFA] transition pb-1 ${currentPage === 'support' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
          >
            {t('navSupport')}
          </button>
        </nav>
      )}

      {/* --- Main Content Stage --- */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          
          {/* ================= PAGE 1: HOMEPAGE WITH AUTH GATED BUILDER ================= */}
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center w-full"
            >
              {/* Hero Banner Section */}
              <section className="w-full bg-gradient-to-b from-[#EAF3FF] to-white py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-100/40 blur-xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-44 h-44 rounded-full bg-orange-100/40 blur-2xl pointer-events-none" />

                {!userAuth.loggedIn && (
                  <div className="max-w-3xl z-10 px-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] sm:text-xs font-bold text-[#287DFA] mb-4 shadow-sm uppercase tracking-wider font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> {t('protectionBadge')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4 font-serif">
                      {t('tagline').split('.')[0]}.<br />
                      <span className="text-[#287DFA]">{t('tagline').split('.')[1]}</span>
                    </h1>
                    <p className="text-slate-650 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
                      {t('subTagline')}
                    </p>
                  </div>
                )}

                {/* Gated Builder Form Render */}
                <div className="w-full max-w-4xl z-20 px-2">
                  {userAuth.loggedIn ? (
                    /* Authenticated Custom Node Builder */
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 text-left mt-2">
                      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-slate-100 pb-4 mb-6">
                        {['flights', 'trains', 'cabs', 'hotels'].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => {
                              setSearchTab(tab);
                              if (tab === 'flights') setBuilderDuration(75);
                              else if (tab === 'trains') setBuilderDuration(180);
                              else if (tab === 'cabs') setBuilderDuration(45);
                              else setBuilderDuration(0);
                            }}
                            className={`px-3 py-2 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase flex items-center gap-1 transition cursor-pointer ${
                              searchTab === tab ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-55'
                            }`}
                          >
                            {tab === 'flights' ? t('flightTab')
                              : tab === 'trains' ? t('trainTab')
                              : tab === 'cabs' ? t('cabTab')
                              : t('hotelTab')}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddBuilderNode} className="space-y-6">
                        {/* Dynamic Input Fields based on Active Tab */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          
                          {/* From location (Not for Hotels) */}
                          {searchTab !== 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fromLabel')}</label>
                              <CityAutocomplete
                                value={builderFrom}
                                onChange={setBuilderFrom}
                                placeholder={t('typePlaceholder')}
                                required
                              />
                            </div>
                          )}

                          {/* To Location (Hotel check-in destination) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {searchTab === 'hotels' ? t('toLabel').split(' ')[0] + " Location" : t('toLabel')}
                            </label>
                            <CityAutocomplete
                              value={builderTo}
                              onChange={setBuilderTo}
                              placeholder={t('typePlaceholder')}
                              required
                            />
                          </div>

                          {/* Date */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dateLabel')}</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                type="date"
                                required
                                value={builderDate}
                                onChange={(e) => setBuilderDate(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-250 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          </div>

                          {/* Start Time */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('timeLabel')}</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                type="time"
                                required
                                value={builderTime}
                                onChange={(e) => setBuilderTime(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-250 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          </div>

                          {/* Duration in Minutes (Except Hotel) */}
                          {searchTab !== 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('durationLabel')}</label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={builderDuration}
                                  onChange={(e) => setBuilderDuration(Number(e.target.value))}
                                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Specific Identity Inputs */}
                          {searchTab === 'flights' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('airwaysLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderAirways}
                                onChange={(e) => setBuilderAirways(e.target.value)}
                                placeholder="E.g. IndiGo, Air India"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/45 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'trains' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('trainNameLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderTrainName}
                                onChange={(e) => setBuilderTrainName(e.target.value)}
                                placeholder="E.g. Shatabdi Exp, Deccan Queen"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/45 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'cabs' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('cabServiceLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderCabService}
                                onChange={(e) => setBuilderCabService(e.target.value)}
                                placeholder="E.g. Uber Select, Ola Outstation"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/45 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('hotelNameLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderHotelName}
                                onChange={(e) => setBuilderHotelName(e.target.value)}
                                placeholder="E.g. Grand Hyatt, Taj Mahal Stay"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/45 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-6 h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-extrabold rounded-lg transition shadow-md shadow-[#287DFA]/10 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                          >
                            {t('addNodeBtn')}
                          </button>
                        </div>
                      </form>

                      {/* Timeline live preview chain builder */}
                      <div className="border-t border-slate-100 mt-6 pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400 font-mono">
                            {t('livePreview')}
                          </h4>
                          {builderNodes.length > 0 && (
                            <button
                              onClick={handleLockJourney}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition shadow-md shadow-emerald-500/10 active:scale-98 flex items-center justify-center gap-1 cursor-pointer w-full sm:w-auto"
                            >
                              {t('lockTripBtn')}
                            </button>
                          )}
                        </div>

                        {builderNodes.length > 0 ? (
                          <div className="overflow-x-auto custom-scrollbar pb-3 pt-2 min-h-[170px] flex items-center justify-start">
                            <div className="flex items-center">
                              {builderNodes.map((node, idx) => (
                                <div key={node.id} className="flex items-center">
                                  
                                  {/* Preview Node Card */}
                                  <div className="w-56 p-3 bg-slate-50 border border-slate-200 rounded-xl relative hover:border-[#287DFA] transition group flex-shrink-0 shadow-xs">
                                    <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Populate form fields for editing
                                          const parts = node.sub?.split('→') || ['', ''];
                                          setBuilderFrom(parts[0]?.trim() || '');
                                          setBuilderTo(parts[parts.length-1]?.trim() || '');
                                          setBuilderTime(node.scheduledStart || '');
                                          if (node.type === 'flight') { setSearchTab('flights'); setBuilderAirways(node.title); }
                                          else if (node.type === 'train') { setSearchTab('trains'); setBuilderTrainName(node.title); }
                                          else if (node.type === 'cab') { setSearchTab('cabs'); setBuilderCabService(node.title); }
                                          else if (node.type === 'hotel') { setSearchTab('hotels'); setBuilderHotelName(node.title); }
                                          handleRemoveBuilderNode(node.id);
                                        }}
                                        className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full cursor-pointer shadow-xs border border-blue-200/50"
                                        aria-label="Edit node"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBuilderNode(node.id)}
                                        className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full cursor-pointer shadow-xs border border-red-200/50"
                                        aria-label="Remove node"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-[#EAF3FF] text-[#287DFA]">
                                        {node.type === 'flight' ? t('flightTab').split(' ')[1] : node.type === 'train' ? t('trainTab').split(' ')[1] : node.type === 'cab' ? t('cabTab').split(' ')[1] : t('hotelTab').split(' ')[1]}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono font-bold">
                                        {node.scheduledStart}
                                      </span>
                                    </div>
                                    <h5 className="font-extrabold text-xs text-slate-900 truncate font-serif">{node.title}</h5>
                                    <p className="text-[10px] text-slate-450 truncate mt-0.5">{node.sub}</p>
                                    
                                    {node.type !== 'hotel' && (
                                      <span className="text-[9px] text-slate-400 block mt-2 font-mono">
                                        {t('actual').split(' ')[0]} End: {node.scheduledEnd}
                                      </span>
                                    )}
                                  </div>

                                  {/* Preview Timeline Bridge connector */}
                                  {idx < builderNodes.length - 1 && (
                                    <div className="w-12 h-[2px] bg-slate-205 relative flex items-center justify-center flex-shrink-0">
                                      <span className="absolute px-1.5 py-0.5 bg-white border border-slate-150 rounded-full text-[8px] font-bold text-slate-450 font-mono">
                                        {node.buffer}{t('minsLabel').substring(0, 1)}
                                      </span>
                                    </div>
                                  )}

                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-105 flex flex-col items-center justify-center gap-1.5">
                            <AlertCircle className="w-6 h-6 text-slate-300" />
                            <p className="text-xs text-slate-450 font-semibold px-4">{t('noNodesYet')}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Guest Call-to-action banner */
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 text-center flex flex-col items-center gap-4">
                      <div className="p-4 bg-[#EAF3FF] text-[#287DFA] rounded-full">
                        <ShieldCheck className="w-8 h-8 stroke-[2]" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-serif">{t('authPromptTitle')}</h3>
                      <p className="text-slate-500 text-xs max-w-md leading-relaxed px-2">
                        {t('authPromptDesc')}
                      </p>
                      <button
                        onClick={() => {
                          setAuthTab('signin');
                          setShowAuthModal(true);
                        }}
                        className="px-6 h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-md shadow-[#287DFA]/15 active:scale-95 cursor-pointer font-semibold"
                      >
                        {t('signInTab')}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Trips Section (logged-in only) */}
              {userAuth.loggedIn && recentTrips.length > 0 && (
                <section className="max-w-4xl w-full px-4 sm:px-6 py-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕐</span>
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Trips</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{recentTrips.length} trips</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recentTrips.map((trip) => (
                        <button
                          key={trip.id}
                          type="button"
                          onClick={async () => {
                            try {
                              const graphRes = await fetch(`http://localhost:5000/api/trips/${trip.id}/graph`);
                              if (!graphRes.ok) return;
                              const graphData = await graphRes.json();
                              const formattedNodes = formatGraphNodes(graphData.nodes);
                              if (formattedNodes.length > 0) {
                                setCurrentTrip(formattedNodes);
                                setOriginalTripNodes(formattedNodes);
                                setSelectedDisruptNode(formattedNodes[0].id);
                                setTripRefNum(trip.id);
                                setDisruptionState('healthy');
                                setRecoveryResult(null);
                                setRiskRadar(null);
                                setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
                                setCurrentPage('my-trip');
                                fetchRiskRadar(trip.id);
                              }
                            } catch (err) {
                              console.error('Error loading trip:', err);
                            }
                          }}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-[#287DFA] hover:bg-[#EAF3FF]/30 transition text-left cursor-pointer group flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 truncate pr-2 group-hover:text-[#287DFA] transition">
                              {trip.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#287DFA] transition shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>{trip.id.length > 15 ? trip.id.substring(0, 12) + '...' : trip.id}</span>
                            {trip.created_at && (
                              <span>• {new Date(trip.created_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Marketing Perks Grid - Hidden for logged-in users to fulfill "home page should only have that input boxes" */}
              {!userAuth.loggedIn && (
                <section className="max-w-6xl w-full px-6 py-12 sm:py-16">
                  <h2 className="text-2xl font-bold tracking-tight text-center text-slate-900 mb-10 font-serif">
                    {t('howItWorks')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                      <div className="p-3 rounded-xl bg-[#EAF3FF] text-[#287DFA]">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-950 font-serif">{t('marketingTitle1')}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {t('marketingDesc1')}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                      <div className="p-3 rounded-xl bg-orange-50 text-[#FF7700]">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-955 font-serif">{t('marketingTitle2')}</h3>
                      <p className="text-slate-505 text-xs leading-relaxed">
                        {t('marketingDesc2')}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-555">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-955 font-serif">{t('marketingTitle3')}</h3>
                      <p className="text-slate-505 text-xs leading-relaxed">
                        {t('marketingDesc3')}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {/* ================= PAGE 2: "MY TRIP" LIVE TIMELINE VIEW ================= */}
          {currentPage === 'my-trip' && userAuth.loggedIn && (
            <motion.div
              key="my-trip-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6"
            >
              {/* Trip Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                    {t('tripHeaderTitle')} {currentTrip[currentTrip.length - 1]?.sub?.split('→')[1]?.trim() || currentTrip[currentTrip.length - 1]?.title || 'Destination'}
                  </h1>
                  <p className="text-slate-505 text-xs font-semibold mt-0.5">{t('tripReference')}: <span className="font-mono text-slate-800 font-bold">{tripRefNum}</span></p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 text-slate-655 hover:bg-slate-50 text-xs font-bold rounded-full transition cursor-pointer text-center"
                  >
                    {t('backToBookings')}
                  </button>
                  <button 
                    onClick={() => alert('Itinerary emailed to your account!')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-full hover:bg-slate-900 transition cursor-pointer text-center"
                  >
                    {t('emailItinerary')}
                  </button>
                  <button
                    onClick={() => {
                      // Load current trip nodes into builder for editing
                      setBuilderNodes(currentTrip.map(node => ({...node})));
                      setCurrentPage('home');
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-[#287DFA] text-[#287DFA] text-xs font-bold rounded-full hover:bg-[#EAF3FF] transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Route
                  </button>
                </div>
              </div>

              {/* 🔮 Risk Radar Section */}
              <RiskRadar tripId={tripRefNum} />

              {/* 👨‍👩‍👦 Family & Group Protection Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨‍👩‍👦</span>
                    <div>
                      <h3 className="font-extrabold text-sm tracking-tight">Family & Group Protection</h3>
                      <p className="text-[10px] text-white/80 font-mono">Split-party prevention • Child guardian enforcement</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border bg-white/15 border-white/30 text-white">
                    3 Travelers
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xl">👨</span>
                      <div className="text-[10px] font-bold text-slate-700 mt-1">Rahul</div>
                      <div className="text-[9px] font-mono text-slate-400">PNR-A123</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xl">👩</span>
                      <div className="text-[10px] font-bold text-slate-700 mt-1">Priya</div>
                      <div className="text-[9px] font-mono text-slate-400">PNR-B456</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <span className="text-xl">👦</span>
                      <div className="text-[10px] font-bold text-amber-800 mt-1">Aarav (8)</div>
                      <div className="text-[9px] font-mono text-amber-600 font-bold">CHILD</div>
                    </div>
                  </div>

                  {disruptionState === 'disrupted' ? (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-red-800">⚠️ Family may be split by rebooking</p>
                          <p className="text-[10px] text-red-600 mt-0.5">Airlines rebook each PNR independently — Aarav could be separated from guardians</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentPage('rescue')}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer whitespace-nowrap"
                      >
                        🛡️ View Rescue
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">All travelers protected</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">CHILD_GUARDIAN + COHORT_COHESION rules active • Group will not be split</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentPage('rescue')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Dynamic Alerts Banner */}
              <AnimatePresence mode="wait">
                {disruptionState === 'disrupted' ? (
                  <motion.div
                    key="disrupted-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-855 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-[#FF7700] text-white rounded-lg self-start shrink-0">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 font-serif">{t('disruptTitle')}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {t('disruptDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage('rescue')}
                      className="px-4 py-2 bg-[#FF7700] hover:bg-[#E06600] text-white text-xs font-extrabold rounded-lg transition shrink-0 shadow-sm flex items-center gap-1 cursor-pointer w-full md:w-auto justify-center"
                    >
                      {t('viewRescuePlans')} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : disruptionState === 'resolved' ? (
                  <motion.div
                    key="resolved-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="rounded-2xl bg-white border-2 border-emerald-500/50 shadow-md overflow-hidden text-left"
                  >
                    {/* Top status banner */}
                    <div className="bg-emerald-600 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-100" />
                        <span className="text-xs font-mono font-extrabold tracking-wider uppercase">
                          RECOVERY COMPLETE
                        </span>
                      </div>
                      <span className="text-[11px] font-mono bg-emerald-700/80 px-2.5 py-0.5 rounded-full text-emerald-100">
                        {recoveryResult?.appliedAt ? `Applied at ${recoveryResult.appliedAt}` : 'Live Backend Restored'}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col gap-5">
                      {/* Strategy & Replacement Title */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                            Strategy: <span className="text-[#287DFA]">{recoveryResult?.strategy || 'Intelligent Personalized Recovery'}</span>
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-serif mt-0.5">
                            Replacement: {recoveryResult?.replacement || 'Synchronized Transit & Lodging Realignment'}
                          </h3>
                          {recoveryResult?.reason && (
                            <p className="text-xs text-slate-500 mt-1">
                              {recoveryResult.reason}
                            </p>
                          )}
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                          ✓ All Buffers Realigned
                        </span>
                      </div>

                      {/* 4 Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Additional Cost</span>
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                            {recoveryResult ? (recoveryResult.cost === 0 ? '₹0 (Free)' : `₹${recoveryResult.cost.toLocaleString()}`) : '₹0'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Time Saved</span>
                          <span className="text-base sm:text-lg font-extrabold text-[#287DFA] font-mono mt-0.5">
                            {recoveryResult?.timeSaved > 0 ? `${recoveryResult.timeSaved} Mins` : 'Schedule Preserved'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Refund</span>
                          <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono mt-0.5">
                            {recoveryResult?.refund > 0 ? `₹${recoveryResult.refund.toLocaleString()}` : '₹0'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Affected Nodes</span>
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                            {recoveryResult?.affectedNodes ?? currentTrip.length} Nodes
                          </span>
                        </div>
                      </div>

                      {/* ORIGINAL → RESCHEDULED Comparison Sub-Section */}
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                            ORIGINAL → RESCHEDULED COMPARISON
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {recoveryResult?.comparison?.filter(c => c.isRebooked).length || 0} Rebooked / Modified
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {(recoveryResult?.comparison || currentTrip.map((node, i) => {
                            const orig = originalTripNodes[i] || node;
                            const isChanged = orig.scheduledStart !== node.actualStart || orig.scheduledEnd !== node.actualEnd;
                            return {
                              id: node.id,
                              originalTitle: orig.title,
                              newTitle: node.title,
                              originalStart: orig.scheduledStart,
                              originalEnd: orig.scheduledEnd,
                              newStart: node.actualStart,
                              newEnd: node.actualEnd,
                              isRebooked: isChanged
                            };
                          })).map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className={`p-3 rounded-xl border transition-all ${
                                item.isRebooked
                                  ? 'border-emerald-200 bg-emerald-50/40'
                                  : 'border-slate-100 bg-slate-50/50'
                              }`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-11 gap-2 md:gap-3 items-center text-xs">
                                {/* Original */}
                                <div className="md:col-span-5 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-200 text-slate-600 uppercase">
                                      Original
                                    </span>
                                    <span className="font-mono font-bold text-slate-500">
                                      {item.originalStart} → {item.originalEnd}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-800 font-serif truncate mt-0.5">
                                    {item.originalTitle}
                                  </span>
                                </div>

                                {/* Arrow */}
                                <div className="md:col-span-1 flex items-center justify-center">
                                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                    →
                                  </span>
                                </div>

                                {/* Rescheduled */}
                                <div className="md:col-span-5 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                      item.isRebooked ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#287DFA]'
                                    }`}>
                                      {item.isRebooked ? 'Rescheduled' : 'Preserved'}
                                    </span>
                                    <span className={`font-mono font-bold ${
                                      item.isRebooked ? 'text-emerald-700 font-extrabold' : 'text-slate-700'
                                    }`}>
                                      {item.newStart} → {item.newEnd}
                                    </span>
                                  </div>
                                  <span className="font-bold text-slate-900 font-serif truncate mt-0.5">
                                    {item.newTitle}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="healthy-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 rounded-xl bg-[#EAF3FF] border border-blue-200 text-slate-805 flex items-center gap-3 shadow-sm"
                  >
                    <div className="p-2 bg-[#287DFA] text-white rounded-lg shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-serif">{t('healthyTitle')}</h4>
                      <p className="text-xs text-slate-655 mt-0.5">{t('healthyDesc')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chronological Route Horizontal Timeline */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden mt-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t('timelineTitle')}</h3>

                <div className="overflow-x-auto custom-scrollbar pb-4 pt-2 flex items-center justify-start min-h-[220px]">
                  <div className="flex items-center min-w-full lg:min-w-0">
                    {currentTrip.map((node, index) => {
                      const isTargetDisrupted = node.status === 'delayed' || node.status === 'broken';
                      
                      return (
                        <div key={node.id} className="flex items-center">
                          {/* Node Card */}
                          <motion.div
                            layout
                            className={`w-64 p-4 rounded-xl border transition-all duration-300 shadow-sm flex-shrink-0 ${
                              node.status === 'broken'
                                ? 'border-red-500 bg-red-50/20 shadow-red-105'
                                : node.status === 'delayed' ? 'border-amber-400 bg-amber-50/30 shadow-amber-100' : 'border-emerald-500 bg-emerald-50/20 shadow-emerald-100 hover:border-emerald-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                                node.status === 'broken'
                                  ? 'bg-red-100 text-red-600'
                                  : node.status === 'delayed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700 font-extrabold'
                              }`}>
                                {node.type === 'flight' ? t('flightTab').split(' ')[1] : node.type === 'train' ? t('trainTab').split(' ')[1] : node.type === 'cab' ? t('cabTab').split(' ')[1] : t('hotelTab').split(' ')[1]}
                              </span>
                              
                              <span className="text-[10px] text-slate-400 font-bold font-mono">
                                {node.status === 'broken'
                                  ? '❌ ' + t('connectionBroken')
                                  : node.status === 'delayed'
                                  ? '⚠️ ' + t('delayed')
                                  : (disruptionState === 'resolved' && node.actualStart !== node.scheduledStart
                                    ? '✓ RECOVERED'
                                    : (node.title.includes('LATE CHECK-IN APPROVED')
                                      ? '✓ LATE CHECK-IN'
                                      : '✓ SAFE & ON TIME'))}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 leading-tight text-sm font-serif">{node.title}</h4>
                            <p className="text-slate-400 text-[11px] mt-1 truncate">{node.sub}</p>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t('scheduled')}</span>
                                <span className="text-xs font-semibold text-slate-555 font-mono">{node.scheduledStart} - {node.scheduledEnd}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                  {disruptionState === 'resolved' && node.actualStart !== node.scheduledStart ? 'RECOVERED' : t('actual')}
                                </span>
                                <span className={`text-xs font-extrabold font-mono ${
                                  node.status === 'broken' ? 'text-red-500' : node.status === 'delayed' ? 'text-[#FF7700]' : (disruptionState === 'resolved' && node.actualStart !== node.scheduledStart ? 'text-emerald-700' : 'text-emerald-600')
                                }`}>
                                  {node.actualStart} - {node.actualEnd}
                                </span>
                              </div>
                            </div>

                            {/* Recovered replacement note */}
                            {disruptionState === 'resolved' && node.actualStart !== node.scheduledStart && (
                              <div className="mt-3 p-1.5 rounded bg-emerald-100/40 text-[9px] font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>✓ Replacement: {node.actualStart} - {node.actualEnd}</span>
                              </div>
                            )}

                            {disruptionState === 'resolved' && node.actualStart === node.scheduledStart && node.title.includes('LATE CHECK-IN APPROVED') && (
                              <div className="mt-3 p-1.5 rounded bg-blue-100/40 text-[9px] font-bold text-[#287DFA] flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-[#287DFA]" />
                                <span>✓ Room Hold Guaranteed (Late Arrival)</span>
                              </div>
                            )}

                            {/* Node Alert message */}
                            {node.status === 'delayed' && (
                              <div className="mt-3 p-1.5 rounded bg-orange-100/30 text-[9px] font-bold text-[#FF7700] flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>+{node.delayMinutes} {t('minsLabel')} {t('delayed')} ({t(node.disruptionReason) || t('generalDisruption')})</span>
                              </div>
                            )}

                            {node.status === 'broken' && (
                              <div className="mt-3 p-1.5 rounded bg-red-100/30 text-[9px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{t('missedConnection')}</span>
                              </div>
                            )}
                          </motion.div>

                          {/* Timeline connector bridge */}
                          {index < currentTrip.length - 1 && (
                            <div className="relative flex items-center justify-center w-20 flex-shrink-0">
                              <div className="h-[2px] w-full bg-slate-205">
                                <motion.div 
                                  className={`h-full ${isTargetDisrupted ? 'bg-red-400' : 'bg-emerald-400'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div className="absolute z-10">
                                {isTargetDisrupted ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[8px] font-bold text-red-650 whitespace-nowrap shadow-sm font-mono">
                                    {t('missed')}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[8px] font-bold text-emerald-655 whitespace-nowrap shadow-sm font-mono">
                                    {t('bufferLabel')}: {node.buffer}m
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick instructions to use Chaos Sandbox */}
              <div className="p-5 bg-blue-50 border border-blue-105 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#287DFA] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">{t('simulateDelaysTitle')}</h4>
                    <p className="text-xs text-slate-655 leading-normal mt-0.5">
                      {t('simulateDelaysDesc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('chaos-lab')}
                  className="px-4 py-2 bg-[#287DFA] text-white text-xs font-bold rounded-xl hover:bg-[#1C6BDB] transition cursor-pointer whitespace-nowrap w-full sm:w-auto text-center"
                >
                  {t('openSandbox')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 3: THE RESCUE CENTER ================= */}
          {currentPage === 'rescue' && userAuth.loggedIn && (
            <motion.div
              key="rescue-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6"
            >
              <RecoveryControl
                tripId={tripRefNum}
                currentTrip={currentTrip}
                disruptionState={disruptionState}
                onPlanApplied={handlePlanApplied}
                onBackToTimeline={() => setCurrentPage('my-trip')}
              />
            </motion.div>
          )}

          {/* ================= PAGE 4: CHAOS LAB SANDBOX ================= */}
          {currentPage === 'chaos-lab' && userAuth.loggedIn && (
            <motion.div
              key="chaos-lab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6"
            >
              <div className="border-b border-slate-205 pb-5 text-left">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-[#FF7700] text-xs font-bold font-mono uppercase tracking-wider">
                  ⚡ Sandbox Mode
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">{t('chaosTitle')}</h1>
                <p className="text-slate-505 text-xs mt-1 leading-relaxed">{t('chaosDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Controls Card */}
                <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">{t('disruptionParams')}</h3>

                  {/* 1. Node selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('selectNode')}</label>
                    {currentTrip.length === 0 ? (
                      <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
                        <Clock className="w-5 h-5 text-[#287DFA] animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-semibold">Loading trip nodes from backend...</p>
                        <p className="text-[10px] text-slate-400 mt-1">Ensure Flask backend is running at http://localhost:5000</p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentTrip.map(node => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedDisruptNode(node.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                            selectedDisruptNode === node.id
                              ? 'border-[#287DFA] bg-[#EAF3FF]/60 ring-2 ring-[#287DFA]/30'
                              : node.status === 'broken'
                              ? 'border-red-300 bg-red-50/30 hover:bg-red-50/50'
                              : node.status === 'delayed'
                              ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/50'
                              : 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {node.type}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono ${
                              node.status === 'broken'
                                ? 'bg-red-100 text-red-700'
                                : node.status === 'delayed'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {node.status === 'broken' ? 'BROKEN' : node.status === 'delayed' ? 'AT RISK' : 'SAFE'}
                            </span>
                          </div>
                          <span className="font-bold text-xs truncate text-slate-900">{node.title}</span>
                          <span className="text-[10px] font-semibold text-slate-500 font-mono">{node.scheduledStart} - {node.scheduledEnd}</span>
                        </button>
                      ))}
                    </div>
                    )}
                  </div>

                  {/* 2. Disruption Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('disruptType')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDisruptType('delay')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'delay'
                            ? 'border-[#FF7700] bg-orange-50 text-[#FF7700]'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t('delayOption')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisruptType('cancel')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'cancel'
                            ? 'border-red-500 bg-red-50 text-red-655'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t('cancelOption')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisruptType('lockout')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'lockout'
                            ? 'border-red-500 bg-red-50 text-red-655'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t('lockoutOption')}
                      </button>
                    </div>
                  </div>

                  {/* 3. Delay duration slider */}
                  {disruptType === 'delay' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs font-bold text-slate-655">{t('delayAmount')}</label>
                        <span className="text-sm font-mono font-extrabold text-[#FF7700]">{disruptDelay} {t('minsLabel')} ({(disruptDelay/60).toFixed(1)} hrs)</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="360"
                        step="15"
                        value={disruptDelay}
                        onChange={(e) => setDisruptDelay(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF7700]"
                      />
                      {/* Slider Scale */}
                      <div className="flex justify-between px-0.5 -mt-0.5">
                        {[0, 60, 120, 180, 240, 300, 360].map(val => (
                          <div key={val} className="flex flex-col items-center">
                            <div className={`w-px h-1.5 ${disruptDelay >= val ? 'bg-[#FF7700]' : 'bg-slate-300'}`} />
                            <span className={`text-[8px] font-mono font-bold mt-0.5 ${disruptDelay >= val ? 'text-[#FF7700]' : 'text-slate-400'}`}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Reason */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('disruptReason')}</label>
                    <div className="relative">
                      <select
                        value={disruptReason}
                        onChange={(e) => setDisruptReason(e.target.value)}
                        className="w-full h-10 px-3 pr-9 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/10 transition cursor-pointer appearance-none"
                      >
                        <option value="Severe Weather & Thunderstorms">{t('weatherReason')}</option>
                        <option value="Mechanical Failure & Engine Stall">{t('mechReason')}</option>
                        <option value="Rail/Air Traffic Congestion">{t('trafficReason')}</option>
                        <option value="Security Lockdown Alert">{t('securityReason')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-105">
                    <button
                      type="button"
                      onClick={() => {
                        triggerDisruptionCascade(selectedDisruptNode, disruptType, disruptDelay, disruptReason);
                      }}
                      className="flex-1 px-6 h-11 bg-[#FF7700] hover:bg-[#E06600] text-white font-extrabold rounded-xl transition shadow-md shadow-[#FF7700]/10 active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Flame className="w-4 h-4" /> {t('triggerBtn')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage('rescue')}
                      className="px-4 h-11 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#287DFA] font-bold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>🎛️ Recovery Control →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage('my-trip')}
                      className="px-4 h-11 border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{t('navMyTrips')} →</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResetJourney}
                      className="px-6 h-11 border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      {t('resetBtn')}
                    </button>
                  </div>
                </div>

                {/* Metrics & Impact Panel */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800 text-left">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-36 h-36 rounded-full bg-[#FF7700]/10 blur-xl pointer-events-none" />
                  
                  <div className="space-y-6 z-10">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">{t('impactTitle')}</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Metric 1 */}
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('downstreamDelay')}</span>
                        <span className="text-lg font-mono font-extrabold text-[#FF7700]">
                          {impactMetrics.delayMinutes > 0 ? `${impactMetrics.delayMinutes} ${t('minsLabel')}` : `0 ${t('minsLabel')}`}
                        </span>
                      </div>

                      {/* Metric 2 */}
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('brokenConnections')}</span>
                        <span className="text-lg font-mono font-extrabold text-rose-500">
                          {impactMetrics.brokenConnections}
                        </span>
                      </div>

                      {/* Metric 3 */}
                      <div className="pb-1 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('affectedNodes')}</span>
                        <span className="text-lg font-mono font-extrabold text-orange-400">
                          {impactMetrics.affectedNodes}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 z-10">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-400 space-y-2">
                      <span className="font-extrabold text-white block uppercase tracking-wider font-mono text-[10px]">{t('realTimeGraphImpact')}</span>
                      {t('graphImpactDesc')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 5: LOCAL DINING & RESTAURANTS ================= */}
          {currentPage === 'restaurants' && userAuth.loggedIn && (
            <motion.div
              key="restaurants-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6"
            >
              <DiningHub
                tripId={tripRefNum}
                tripRef={tripRefNum}
                currentTripNodes={currentTrip}
                activeDestination={activeDestination}
              />
            </motion.div>
          )}

          {/* ================= PAGE 6: SUPPORT HUB & CHATBOT CENTER ================= */}
          {currentPage === 'support' && userAuth.loggedIn && (
            <motion.div
              key="support-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6"
            >
              <div className="border-b border-slate-200 pb-5 text-left">
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider">
                  📞 Help Center
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">{t('supportTitle')}</h1>
                <p className="text-slate-550 text-xs mt-1">{t('supportDesc')}</p>
              </div>

              {/* Support tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setSupportTab('faq')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'faq' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('faqTab')}
                </button>
                <button
                  onClick={() => setSupportTab('bug')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'bug' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('bugTab')}
                </button>
                <button
                  onClick={() => setSupportTab('feedback')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'feedback' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('feedbackTab')}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Side: Content Tab Panels */}
                <div className="lg:col-span-2">
                  
                  {/* Tab 1: FAQs & Helpline */}
                  {supportTab === 'faq' && (
                    <div className="space-y-6 text-left">
                      {/* Helpline Box */}
                      <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="p-3 bg-rose-500 text-white rounded-xl self-start shrink-0">
                            <ShieldAlert className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 font-serif">{t('sosHelpline')}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-normal font-semibold">
                              {t('sosDesc')}: <span className="font-extrabold text-rose-600 font-mono">1800-419-7377</span> (Toll-Free). Immediate vector backup deck active.
                            </p>
                          </div>
                        </div>
                        <a
                          href="tel:18004197377"
                          className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition shadow-sm whitespace-nowrap text-center animate-pulse w-full sm:w-auto"
                        >
                          {t('callSos')}
                        </a>
                      </div>

                      {/* FAQs Grid */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-50 pb-2 font-serif">{t('faqTitle')}</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: How does the automatic rebooking guard work?</h4>
                            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                              TripResQ monitors flight and train schedules in real-time. If your transit is delayed and we compute a broken connection with your downstream travel (e.g. cab pickup or hotel stay), our engine automatically triggers pre-validated recovery routes and registers them for you at no cost.
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: Are the rescue flights/trains completely free?</h4>
                            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                              Yes! All recovery travel is covered 100% under your TripResQ Protection plan. You don't pay a single rupee extra when choosing a replacement plan.
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: How is hotel late check-in handled?</h4>
                            <p className="text-[11px] text-slate-555 leading-relaxed font-semibold">
                              If your arrival is delayed, our system automatically informs the hotel reception desk via API, sending check-in updates and preventing reservation cancellations for late arrival.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Bug Report Form */}
                  {supportTab === 'bug' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 font-serif">{t('bugTitle')}</h3>
                        <p className="text-slate-450 text-[11px] mt-0.5 font-semibold">Spotted something broken? File a report so our engineers can fix it.</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {bugSuccess ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col items-center gap-3"
                          >
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <h4 className="font-bold text-slate-900 text-sm font-serif">{t('reportSuccessTitle')}</h4>
                            <p className="text-xs text-slate-600 font-semibold">{t('reportSuccessDesc')}{bugTicketId}. {t('reportSuccessSub')}</p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleBugSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655">{t('bugSummary')}</label>
                              <input
                                type="text"
                                required
                                value={bugSummary}
                                onChange={(e) => setBugSummary(e.target.value)}
                                placeholder="E.g. Cab pick-up timeline node is showing NaN hours delay"
                                className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655">{t('bugSteps')}</label>
                              <textarea
                                rows="3"
                                value={bugSteps}
                                onChange={(e) => setBugSteps(e.target.value)}
                                placeholder="1. Go to homepage&#10;2. Build a flight trip&#10;3. Trigger terminal disruption in chaos lab"
                                className="w-full p-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-655">{t('bugSeverity')}</label>
                                <select
                                  value={bugSeverity}
                                  onChange={(e) => setBugSeverity(e.target.value)}
                                  className="h-10 px-3 rounded-lg border border-slate-205 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition cursor-pointer"
                                >
                                  <option value="Low">{t('severityLow')}</option>
                                  <option value="Medium">{t('severityMedium')}</option>
                                  <option value="High">{t('severityHigh')}</option>
                                  <option value="Critical">{t('severityCritical')}</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-655">Mock Screenshot Upload</label>
                                <div 
                                  onClick={() => setBugScreenshot('tripresq_screenshot.png')}
                                  className="h-10 px-3 border border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-1.5 text-xs text-slate-555 cursor-pointer hover:bg-slate-50 transition"
                                >
                                  <Upload className="w-4 h-4 text-slate-400" />
                                  <span>{bugScreenshot ? bugScreenshot : t('bugScreenshot').split(',')[0]}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                            >
                              {t('bugSubmit')}
                            </button>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Tab 3: Share Feedback */}
                  {supportTab === 'feedback' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-905 font-serif">{t('feedbackTitle')}</h3>
                        <p className="text-slate-450 text-[11px] mt-0.5 font-semibold">{t('feedbackSub')}</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {feedbackSuccess ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col items-center gap-3"
                          >
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <h4 className="font-bold text-slate-900 text-sm font-serif">{t('feedbackSuccessTitle')}</h4>
                            <p className="text-xs text-slate-650 font-semibold">{t('feedbackSuccessDesc')}</p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                            {/* Star Selection */}
                            <div className="flex flex-col items-center gap-2 py-4 bg-slate-50/60 rounded-xl">
                              <span className="text-xs font-bold text-slate-500 font-serif">{t('tapToRate')}</span>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedbackRating(star)}
                                    onMouseEnter={() => setFeedbackHover(star)}
                                    onMouseLeave={() => setFeedbackHover(0)}
                                    className="p-1 cursor-pointer transition active:scale-90"
                                  >
                                    <Star 
                                      className={`w-8 h-8 ${
                                        star <= (feedbackHover || feedbackRating) 
                                          ? 'text-amber-450 fill-amber-400 stroke-amber-500' 
                                          : 'text-slate-300 stroke-slate-300'
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Tags Selection */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-655 block">{t('feedbackTags')}</label>
                              <div className="flex flex-wrap gap-2">
                                {['#FastRescue', '#CleanLayout', '#ResponsiveSupport', '#ZeroHassle', '#AccurateCalculations'].map(tag => {
                                  const isSelected = selectedTags.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedTags(prev => prev.filter(t => t !== tag));
                                        } else {
                                          setSelectedTags(prev => [...prev, tag]);
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                        isSelected 
                                          ? 'bg-slate-900 text-white' 
                                          : 'bg-slate-105 hover:bg-slate-200 text-slate-605'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655 font-serif font-semibold">Review Comment</label>
                              <textarea
                                rows="3"
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                                placeholder={t('feedbackComment')}
                                className="w-full p-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackRating === 0}
                              className={`w-full h-10 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer ${
                                feedbackRating > 0 ? 'bg-[#287DFA] hover:bg-[#1C6BDB]' : 'bg-slate-300 text-slate-555 cursor-not-allowed'
                              }`}
                            >
                              {t('feedbackSubmit')}
                            </button>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>

                {/* Right Side: Chatbot Widget */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg flex flex-col h-[480px] overflow-hidden text-left">
                  {/* Chatbot Header */}
                  <div className="p-4 bg-[#287DFA] text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm font-serif">{t('chatbotTitle')}</h4>
                      <p className="text-[10px] text-white/80">{t('chatbotSub')}</p>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 custom-scrollbar">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#287DFA] text-white rounded-tr-none'
                              : 'bg-white text-slate-850 border border-slate-100 rounded-tl-none shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isChatTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick query chips */}
                  <div className="px-4 py-2 border-t border-slate-55 flex gap-1.5 overflow-x-auto whitespace-nowrap custom-scrollbar bg-white">
                    <button
                      onClick={() => handleQuickChatPrompt("My flight is delayed, what do I do?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-slate-605 rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      {t('chatbotChipDelay')}
                    </button>
                    <button
                      onClick={() => handleQuickChatPrompt("How do I claim a full refund?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-[#FF7700] rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      {t('chatbotChipRefund')}
                    </button>
                    <button
                      onClick={() => handleQuickChatPrompt("Is my hotel stay check-in safe?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-slate-605 rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      {t('chatbotChipHotel')}
                    </button>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('chatPlaceholder')}
                      className="flex-1 px-3 h-9 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#287DFA] transition font-semibold"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white rounded-lg transition cursor-pointer active:scale-95 flex items-center justify-center animate-pulse"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- Global Footer Area --- */}
      <footer className="bg-white border-t border-slate-100 py-8 px-6 mt-12 text-center text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-450 font-mono">
          <p>{t('allRightsReserved')}</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-600 font-semibold">{t('privacyPolicy')}</a>
            <a href="#terms" className="hover:text-slate-600 font-semibold">{t('termsOfProtection')}</a>
            <a href="#contact" className="hover:text-slate-600 font-semibold">{t('contactHelpDesk')}</a>
          </div>
        </div>
      </footer>

      {/* --- Authentication Sign In / Sign Up Modal --- */}
      <AnimatePresence>
      {/* Onboarding Guide */}
      {userAuth.loggedIn && (
        <OnboardingGuide onNavigate={setCurrentPage} />
      )}

        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/45 backdrop-blur-xs p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden flex flex-col relative"
            >
              {/* Header Tab Switcher */}
              <div className="flex bg-slate-50 border-b border-slate-105">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                    authTab === 'signin' ? 'bg-white text-[#287DFA] border-r border-slate-100 font-extrabold' : 'text-slate-455 hover:bg-slate-100/50'
                  }`}
                >
                  {t('signInTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                    authTab === 'signup' ? 'bg-white text-[#287DFA] border-l border-slate-100 font-extrabold' : 'text-slate-455 hover:bg-slate-100/50'
                  }`}
                >
                  {t('signUpTab')}
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4 text-left">
                <div className="text-center pb-2">
                  <h3 className="font-bold text-slate-900 font-serif text-base">{t('authTitle')}</h3>
                  <p className="text-slate-440 text-[10px] mt-0.5 font-semibold">{t('secureVerification')}</p>
                </div>

                {authTab === 'signup' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fullName')}</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('emailOrPhone')}</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('password')}</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                  />
                </div>

                {authTab === 'signin' && (
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#287DFA] focus:ring-0" />
                      <span>{t('rememberMe')}</span>
                    </label>
                    <a href="#forgot" className="text-[#287DFA] hover:underline font-semibold">{t('forgotPass')}</a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-md shadow-[#287DFA]/10 cursor-pointer mt-2"
                >
                  {authTab === 'signin' ? t('signInTab') : t('signUpBtn')}
                </button>

                {/* Demo Quick Logins */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-455 block text-center uppercase tracking-wider">Quick Demo Access</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuth({ loggedIn: true, user: { name: t('googleUser'), email: 'demo@tripresq.com' } });
                        setShowAuthModal(false);
                        setCurrentPage('home');
                      }}
                      className="h-9 border border-emerald-200 bg-emerald-50 rounded-lg text-[10px] font-bold hover:bg-emerald-100 cursor-pointer transition flex items-center justify-center gap-1.5 text-emerald-700"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> 🚀 Demo (Google)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuth({ loggedIn: true, user: { name: t('otpUser'), email: 'demo@tripresq.com' } });
                        setShowAuthModal(false);
                        setCurrentPage('home');
                      }}
                      className="h-9 border border-emerald-200 bg-emerald-50 rounded-lg text-[10px] font-bold hover:bg-emerald-100 cursor-pointer transition flex items-center justify-center gap-1.5 text-emerald-700"
                    >
                      <Clock className="w-3.5 h-3.5" /> 🚀 Demo (OTP)
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center font-medium">Demo mode — no real credentials required</p>
                </div>
              </form>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-655 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
