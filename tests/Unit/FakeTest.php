/* Test bidon, possiblement passe phpstan level=6 */
<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

final class FakeTest extends TestCase
{
    public function testAddition(): void
    {
        $this->assertEquals(4, 2 + 2);
    }
}