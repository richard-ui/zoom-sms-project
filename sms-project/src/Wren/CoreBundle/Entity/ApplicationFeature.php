<?php

declare(strict_types=1);

namespace Wren\CoreBundle\Entity;

use Carbon\Carbon;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as JMS;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Wren\CoreBundle\Classes\ApplicationFeature\ApplicationFeatureDTO;
use Wren\CoreBundle\DataSynchronisation\Annotation\Synchronisation;
use Wren\CoreBundle\Repository\ApplicationFeatureRepository;
use Wren\CoreBundle\Traits\Entity\EntitySoftDeleteTrait;
use Wren\CoreBundle\Traits\Entity\EntityTimestampTrait;
use Wren\DoctrineBundle\Entity\AbstractBaseEntity;
use Wren\DoctrineBundle\Interfaces\Enum\HasEnumsInterface;
use Wren\ShowroomBundle\Entity\Employee;

 */
#[ORM\Table(name: 'Core.tblApplicationFeature')]
#[ORM\UniqueConstraint(name: 'UK_strApplicationFeatureHandle', columns: ['strApplicationFeatureHandle'])]
#[ORM\Entity(repositoryClass: ApplicationFeatureRepository::class)]
#[UniqueEntity(fields: ['strHandle'], message: '- Feature Handle already exists (must be unique)')]
class ApplicationFeature extends AbstractBaseEntity implements HasEnumsInterface
{

    // other code....


    public const ZOOM_SMS_INTEGRATION = 'ZOOM_SMS_INTEGRATION';

}
