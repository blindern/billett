<?php

declare(strict_types=1);

namespace Tests\Unit;

use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;
use PHPUnit\Framework\TestCase;
use SplFileInfo;

/**
 * Guards the Intervention Image API used by EventController::uploadImage.
 * Catches breaking changes (renamed/removed methods) on dependency upgrades.
 */
final class EventImageEncodingTest extends TestCase
{
    public function test_event_image_upload_chain(): void
    {
        $manager = new ImageManager(new Driver);
        $tmp = tempnam(sys_get_temp_dir(), 'billett_test_');

        try {
            $manager->createImage(500, 500)
                ->fill('#445577')
                ->encode(new JpegEncoder)
                ->save($tmp);

            $encoded = $manager
                ->decode(new SplFileInfo($tmp))
                ->scale(275, null)
                ->encode(new JpegEncoder(quality: 75));

            $this->assertSame('image/jpeg', $encoded->mediaType());
            $this->assertNotEmpty($encoded->toString());
        } finally {
            @unlink($tmp);
        }
    }
}
