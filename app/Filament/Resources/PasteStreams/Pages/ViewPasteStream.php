<?php

namespace App\Filament\Resources\PasteStreams\Pages;

use App\Filament\Resources\PasteStreams\PasteStreamResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewPasteStream extends ViewRecord
{
    protected static string $resource = PasteStreamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
