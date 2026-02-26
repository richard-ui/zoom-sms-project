# Zoom SMS Integration – Code Responsibility Overview

This document explains the files, key functions, and responsibilities for the Zoom SMS integration feature. It maps each piece of code to its role in the system.


## 1. Feature Flag Definition – `ApplicationFeature.php`

Purpose:
Defines the feature switch used to safely roll out SMS functionality.

public const ZOOM_SMS_INTEGRATION = 'ZOOM_SMS_INTEGRATION';

Responsibility:
- Enables staged rollout
- Allows SMS UI to be conditionally rendered
- Prevents breaking existing Zoom call functionality


## 2. Conditional UI Rendering -
fixed_sidebar.html.twig

Purpose:
Renders the Zoom sidebar and conditionally includes SMS contact options.

{% if isFeatureEnabled(constant('Wren\\CoreBundle\\Entity\\ApplicationFeature::ZOOM_SMS_INTEGRATION')) %}
    <div id="contact-options" data-current-number=""></div>
{% endif %}

Responsibility:
- Only renders SMS UI container if feature flag is enabled
- Keeps DOM clean when feature is disabled
- Ensures frontend JS logic can detect SMS availability via DOM presence

## 3. Attaching zoom behaviour to phone numbers
ZoomExtension.php

Purpose:
Adds Zoom call/SMS capability to rendered phone numbers via Twig.

Key Method:

attachZoomLinkToPhoneNumber(...)

Responsibilities:
- Formats phone numbers (national + E164)

Checks:
- DESIGNER_ZOOM_INTEGRATION feature
- ACCESS_ZOOM_VIA_FRONTEND permission

Determines if number is:
- mobile
- phone

Why this is important:
- Keeps presentation logic out of templates
- Centralises Zoom integration logic
- Gracefully falls back when feature disabled


## 4. Sidebar UI styling
global_zoom.less

Purpose:
Styles the fixed Zoom sidebar and SMS/Call selection UI.

Responsibilities:
- Positions sidebar (fixed right panel)
- Handles transitions

Styles:
- Close button
- SMS/Call buttons
- Contact options layout

## 5. Sidebar state management
zoomSidebar.ts

Purpose:
Controls sidebar open/close state and UI toggling.

toggleSidebar(display, showContactOptions)

Responsibilities:
- Stores sidebar state in localStorage
- Adds/removes active class
- Toggles visibility between:
- Zoom iframe
- Contact options panel

## 6. SMS/CALL option panel
showSmsCallOptions(...)

Purpose:
Dynamically generates SMS and Call buttons for mobile numbers.

Responsibilities:
- Clears existing options
- Injects new buttons with correct data attributes
- Re-attaches event listeners
- Opens sidebar with contact options visible

## 7. Main frontend behaviour controller
zoomListener.ts

Purpose:
Core frontend logic controlling interaction flow.

A.) Initialisation
document.addEventListener('DOMContentLoaded', ...)

Handles:
- Zoom iframe configuration (postInitMessage)
- Attaching event listeners
- Listening for Zoom iframe messages

B.) Phone Number Click Handling
attachCallActionToPhoneNumberElementInsideContainer(...)

Responsibilities:
- Detects clicks on .zoom-phone-number-trigger
- Reads data-* attributes injected from Twig
- Determines behaviour based on:
- Number type (mobile vs phone)
- Feature availability
- Selected action (sms/call)

C.) Mobile Logic Branch
if (type === 'mobile' && (action !== 'sms' && action !== 'call'))

Flow:

If SMS feature enabled:
→ Show SMS / CALL options

If not enabled:
→ Immediately initiate call

D) Zoom iframe Communication

postToZoom(type, data)

Purpose:
Uses window.postMessage to communicate with Zoom’s embeddable iframe.

Handles:
- zp-make-call
- zp-input-sms
- zp-init-config
