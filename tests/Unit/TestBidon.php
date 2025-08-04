<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class FakeTest extends TestCase
{
    public function testNothing(): void
    {
        $this->assertTrue(true);
    }
}