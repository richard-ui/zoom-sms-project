<?php

namespace Wren\CoreBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Wren\CoreBundle\Classes\Helpers\Enumeration\Permission;
use Wren\CoreBundle\Classes\Traits\SecurityFacadeTrait;
use Wren\CoreBundle\Entity\ApplicationFeature;
use Wren\ITBundle\Classes\FeatureSwitcher\FeatureSwitcherServiceTrait;
use Wren\LocalisationBundle\Classes\Localisation\Formatter\PhoneNumberFormatter;
use Wren\LocalisationBundle\Twig\PhoneNumberExtension;

class ZoomExtension extends AbstractExtension
{
    use FeatureSwitcherServiceTrait;
    use SecurityFacadeTrait;

    /**
     * @param PhoneNumberExtension $phoneNumberExtension
     */
    public function __construct(
        private readonly PhoneNumberExtension $phoneNumberExtension,
    ) {
    }

    /**
     * @return TwigFunction[]
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('attachZoomLinkToPhoneNumber', $this->attachZoomLinkToPhoneNumber(...)),
        ];
    }

    /**
     * @param string|null $phoneNumber
     * @param bool $fallbackToPhoneNumberExtension
     * @param bool $showPhoneNumberExtensionIcon
     * @param string|null $accountId
     * @param string|null $eventId
     * @param string|null $salesLeadId
     * @param string|null $displayText
     *
     * @return string|null
     */
    public function attachZoomLinkToPhoneNumber(
        ?string $phoneNumber,
        bool $fallbackToPhoneNumberExtension = false,
        bool $showPhoneNumberExtensionIcon = false,
        ?string $accountId = null,
        ?string $eventId = null,
        ?string $salesLeadId = null,
        ?string $displayText = null,
    ): ?string {
        $phoneNumberNational = PhoneNumberFormatter::toNational($phoneNumber);
        $phoneNumberInternational = PhoneNumberFormatter::toE164($phoneNumber);

        if (null === $phoneNumberNational || '' === $phoneNumberNational || '0' === $phoneNumberNational) {
            return $phoneNumberNational;
        }

        if (
            !$this->featureSwitcher->isFeatureEnabledForCurrentUsersDefaultBranch(ApplicationFeature::DESIGNER_ZOOM_INTEGRATION)
            || !$this->securityFacade->isGranted(Permission::ACCESS_ZOOM_VIA_FRONTEND)
        ) {
            if ($fallbackToPhoneNumberExtension) {
                return $this->phoneNumberExtension->normaliseTelephoneNumber($phoneNumber, $showPhoneNumberExtensionIcon);
            }

            return $phoneNumberNational;
        }

        if (!$this->securityFacade->isGranted(Permission::ACCESS_ZOOM_VIA_FRONTEND)) {
            return $phoneNumberNational;
        }

        $type = PhoneNumberFormatter::isMobile($phoneNumber) ? 'mobile' : 'phone';

        return sprintf(
            '<a
                        href="#"
                        title="Call this number"
                        class="zoom-phone-number-trigger"
                        data-phone="%s"
                        data-phone-international="%s"
                        data-account="%s"
                        data-calendar-event="%s"
                        data-sales-lead="%s"
                        data-type="%s"
                        data-action="%s"
                    >
                        %s
                    </a>',
            $phoneNumberNational,
            $phoneNumberInternational,
            $accountId,
            $eventId,
            $salesLeadId,
            $type,
            strtolower($displayText),
            $displayText ?? $phoneNumber,
        );
    }
}
