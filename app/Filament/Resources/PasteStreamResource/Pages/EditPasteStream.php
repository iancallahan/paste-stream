<?php

namespace App\Filament\Resources\PasteStreamResource\Pages;

use App\Filament\Resources\PasteStreamResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPasteStream extends EditRecord
{
    protected static string $resource = PasteStreamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
