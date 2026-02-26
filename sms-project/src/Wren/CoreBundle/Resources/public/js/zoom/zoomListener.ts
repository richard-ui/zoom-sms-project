import { ZoomEventHandler } from "./ZoomEventHandler";
import { toggleSidebar } from './zoomSidebar'

const targetOrigin: string = 'https://applications.zoom.us';

// Interface for dataset attributes used in this file
interface ZoomContactDataset extends DOMStringMap {
    phoneInternational: string;
    account: string;
    calendarEvent: string;
    salesLead: string;
    type: string;
    action: string;
}

document.addEventListener('DOMContentLoaded', function (): void {
    const zoomEventHandler: ZoomEventHandler = new ZoomEventHandler();

    postInitMessage();
    attachCallActionToPhoneNumberElementInsideContainer(document, zoomEventHandler);

    // RET-35410: Fix overload error
    document.addEventListener('attach-call-action-to-dynamic-elements', function (e: CustomEvent) {
        const container = document.querySelector(e.detail.selector);

        attachCallActionToPhoneNumberElementInsideContainer(container, zoomEventHandler);
    });

    window.addEventListener('message', (event: MessageEvent) => zoomEventHandler.handle(event), false);
});

function attachCallActionToPhoneNumberElementInsideContainer(container: Element|Document, zoomEventHandler: ZoomEventHandler): void
{
    const contactNumberButtons: HTMLCollectionOf<Element> = container.getElementsByClassName("zoom-phone-number-trigger");

    Array.from(contactNumberButtons).forEach(function (contactNumberButton: Element): void {
        contactNumberButton.addEventListener('click', function (this: HTMLElement): void {
            zoomEventHandler.populateEventCompletionDataFromElement(this);

            const dataset = this.dataset as ZoomContactDataset;

            const number = dataset.phoneInternational;
            const accountId = dataset.account;
            const eventId = dataset.calendarEvent;
            const salesLeadId = dataset.salesLead;
            const type = dataset.type;
            const action = dataset.action;

            const smsEnabled = document.querySelector('#contact-options') !== null;

            if (type === 'mobile' && (action !== 'sms' && action !== 'call')) { // normal phone/mobile
                if (smsEnabled) {
                    // Show SMS / CALL options if SMS feature switch is enabled.
                    showSmsCallOptions(number, accountId, eventId, salesLeadId, type, zoomEventHandler);
                } else {
                    // Make call immediately if SMS feature switch not enabled.
                    makeCall(number);
                }
            } else { // Direct actions made from main telephone/mobile or sms/call options.
                toggleSidebar(true, false);

                if (action === 'sms') {
                    openSmsPanel(number);
                } else {
                    makeCall(number);
                }
            }
        });
    });
}

function postInitMessage (): void
{
    const zoomIframe: HTMLIFrameElement = document.querySelector('iframe#zoom-global-phone-iframe')!;

    zoomIframe.contentWindow!.postMessage({
        type: 'zp-init-config',
        data: {
            enableSavingLog: false,
            enableAutoLog: false,
            enableContactSearching: false,
            enableContactMatching: false,
        }
    }, targetOrigin);
}

function showSmsCallOptions(number: string, accountId: string, eventId: string, salesLeadId: string, type: string, zoomEventHandler: ZoomEventHandler): void {
    const contactOptions = document.querySelector('#zoom-fixed-sidebar > #contact-options');
    if (!contactOptions) return;

    contactOptions.setAttribute('data-current-number', number);

    // Clear existing links
    contactOptions.innerHTML = '';

    // Add SMS and CALL links
    const smsLinkHtml = generateZoomContactOptionHTML(number, accountId, eventId, salesLeadId, type, 'sms');
    const callLinkHtml = generateZoomContactOptionHTML(number, accountId, eventId, salesLeadId, type, 'call');

    contactOptions.insertAdjacentHTML('beforeend',
        ` <div id="zoom-contact-text">
        <p>Please choose from the contact options below</p>
      </div>
      <div class="zoom-action-button-wrapper">
        ${smsLinkHtml}
        ${callLinkHtml}
      </div>`);

    // Attach listeners to the new links.
    attachCallActionToPhoneNumberElementInsideContainer(contactOptions, zoomEventHandler);

    toggleSidebar(true, true);
}

function generateZoomContactOptionHTML(phone: string, accountId: string, eventId: string, salesLeadId: string, type: string, action: string): string {
    const icon = action === 'sms' ? 'fa-comments' : 'fa-phone';
    return `
        <button
            type="button"
            class="zoom-phone-number-trigger zoom-action-button"
            data-phone="${phone}"
            data-phone-international="${phone}"
            data-account="${accountId}"
            data-calendar-event="${eventId}"
            data-sales-lead="${salesLeadId}"
            data-type="${type}"
            data-action="${action}"
        >
            <i class="fas ${icon}"></i>
        </button>
    `;
}

function makeCall(number: string): void {
    toggleSidebar(true, false);
    postToZoom('zp-make-call', { number, autoDial: true });
}

function openSmsPanel(number: string): void {
    toggleSidebar(true, false);
    postToZoom('zp-input-sms', { number });
}

function postToZoom(type: string, data: any): void {
    const zoomIFrame: HTMLIFrameElement = document.querySelector('iframe#zoom-global-phone-iframe')!;
    zoomIFrame.contentWindow!.postMessage({ type, data }, targetOrigin);
}
