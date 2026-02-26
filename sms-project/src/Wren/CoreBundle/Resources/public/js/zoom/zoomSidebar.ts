export function toggleSidebar(display: boolean, showContactOptions: boolean = false): void
{
    localStorage.setItem(zoomSidebarActiveKey, display.toString());
    toggleSidebarClass(display, showContactOptions);
}

function toggleSidebarClass(display: boolean, showContactOptions: boolean = false): void {
    const activeSidebarClassName: string = 'active-sidebar';
    const fixedSidebar = document.getElementById('zoom-fixed-sidebar')!;
    const contactOptions = document.getElementById('contact-options')!;
    const zoomIframe = document.getElementById('zoom-global-phone-iframe')!;

    if (!fixedSidebar) return; // Safety check

    if (display) {
        fixedSidebar.classList.add(activeSidebarClassName);

        if (contactOptions) {
            contactOptions.classList.toggle('hidden', !showContactOptions);
            zoomIframe.classList.toggle('hidden', showContactOptions);
        }
    } else {
        fixedSidebar.classList.remove(activeSidebarClassName);

        if (contactOptions) {
            contactOptions.classList.add('hidden');
            zoomIframe.classList.add('hidden');
        }
    }
}
