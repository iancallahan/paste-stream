<?php

namespace App\Filament\Resources\PasteStreams\Pages;

use App\Filament\Resources\PasteStreams\PasteStreamResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditPasteStream extends EditRecord
{
    protected static string $resource = PasteStreamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
